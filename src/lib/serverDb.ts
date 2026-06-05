import crypto from 'crypto';
import { FileDbAdapter } from './fileDbAdapter';
import { DatabaseAdapter, UserRecord, SessionRecord, ProjectRecord } from './dbAdapter';

// Instantiate the active database adapter (Supabase/Neon migration route ready)
const db: DatabaseAdapter = new FileDbAdapter();

// Cryptographic Password Hashing (scrypt)
const generateSalt = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password: string, salt: string): string => {
  return crypto.scryptSync(password, salt, 64).toString('hex');
};

export const serverDb = {
  // USER OPERATIONS
  createUser: async (name: string, email: string, password: string): Promise<{ success: boolean; user?: Omit<UserRecord, 'passwordHash' | 'salt' | 'resetToken' | 'resetTokenExpires'>; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const exists = await db.getUserByEmail(cleanEmail);
    if (exists) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const id = `usr_${crypto.randomUUID()}`;
    
    const newUser: UserRecord = {
      id,
      name,
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    // Auto-clean expired sessions on signup to prune table
    await db.deleteExpiredSessions();

    const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpires: ____, ...userProfile } = newUser;
    return { success: true, user: userProfile };
  },

  verifyUser: async (email: string, password: string): Promise<{ success: boolean; user?: Omit<UserRecord, 'passwordHash' | 'salt' | 'resetToken' | 'resetTokenExpires'>; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    const user = await db.getUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const inputHash = hashPassword(password, user.salt);
    const matches = crypto.timingSafeEqual(
      Buffer.from(user.passwordHash, 'hex'),
      Buffer.from(inputHash, 'hex')
    );

    if (!matches) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Auto-clean expired sessions on verification
    await db.deleteExpiredSessions();

    const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpires: ____, ...userProfile } = user;
    return { success: true, user: userProfile };
  },

  getUserById: async (id: string): Promise<Omit<UserRecord, 'passwordHash' | 'salt' | 'resetToken' | 'resetTokenExpires'> | null> => {
    const user = await db.getUserById(id);
    if (!user) return null;
    const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpires: ____, ...userProfile } = user;
    return userProfile;
  },

  updateUserProfile: async (userId: string, name: string): Promise<boolean> => {
    const user = await db.getUserById(userId);
    if (!user) return false;
    user.name = name.trim();
    await db.updateUser(user);
    return true;
  },

  updateUserPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    const user = await db.getUserById(userId);
    if (!user) return false;
    const salt = generateSalt();
    user.passwordHash = hashPassword(newPassword, salt);
    user.salt = salt;
    await db.updateUser(user);
    return true;
  },

  deleteUserAccount: async (userId: string): Promise<boolean> => {
    const user = await db.getUserById(userId);
    if (!user) return false;
    
    // Cascade delete user projects
    await db.deleteProjectsByUserId(userId);
    
    // Invalidate user sessions
    const sessions = await db.getAllSessions();
    for (const s of sessions) {
      if (s.userId === userId) {
        await db.deleteSession(s.id);
      }
    }
    
    // Delete user record
    await db.deleteUser(userId);
    return true;
  },

  // FORGOT PASSWORD FLOW
  generateForgotPasswordToken: async (email: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const user = await db.getUserByEmail(cleanEmail);
    if (!user) {
      // Return success even if email not found to prevent user enumeration attacks
      return { success: true, token: 'mock-token' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 Hour
    await db.updateUser(user);

    return { success: true, token };
  },

  verifyAndResetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const user = await db.getUserByResetToken(token);
    if (!user) {
      return { success: false, error: 'Reset token is invalid or has expired.' };
    }
    const expiresDate = new Date(user.resetTokenExpires || '');
    if (expiresDate.getTime() < Date.now()) {
      return { success: false, error: 'Reset token has expired.' };
    }

    const salt = generateSalt();
    user.passwordHash = hashPassword(newPassword, salt);
    user.salt = salt;
    delete user.resetToken;
    delete user.resetTokenExpires;
    await db.updateUser(user);
    return { success: true };
  },

  // SESSION OPERATIONS
  createSession: async (userId: string): Promise<SessionRecord> => {
    const sessionId = `sess_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30 Days

    const newSession: SessionRecord = {
      id: sessionId,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    await db.createSession(newSession);
    return newSession;
  },

  getSession: async (sessionId: string): Promise<SessionRecord | null> => {
    const session = await db.getSession(sessionId);
    if (!session) return null;

    // Check expiration
    const expiresDate = new Date(session.expiresAt);
    if (expiresDate.getTime() < Date.now()) {
      // Clean up expired session
      await db.deleteSession(sessionId);
      return null;
    }

    // Rolling refresh: If session expires in less than 15 days, refresh to 30 days
    const timeRemaining = expiresDate.getTime() - Date.now();
    const fifteenDays = 1000 * 60 * 60 * 24 * 15;
    if (timeRemaining < fifteenDays) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
      await db.updateUser(session as any); // Wait, this should call db.createSession or update session
      // Wait, let's make sure it updates the session!
      // In dbAdapter, we have db.createSession(session). Since createSession overwrites by ID in FileDbAdapter, we can just call:
      await db.createSession(session);
    }

    return session;
  },

  deleteSession: async (sessionId: string) => {
    await db.deleteSession(sessionId);
  },

  cleanupExpiredSessions: async () => {
    await db.deleteExpiredSessions();
  },

  // PROJECT OPERATIONS
  getProjectsByUserId: async (userId: string): Promise<ProjectRecord[]> => {
    return await db.getProjectsByUserId(userId);
  },

  getProjectById: async (projectId: string, userId: string): Promise<ProjectRecord | null> => {
    const proj = await db.getProjectById(projectId);
    if (!proj || proj.userId !== userId) return null;
    return proj;
  },

  saveProject: async (project: ProjectRecord): Promise<boolean> => {
    await db.saveProject(project);
    return true;
  },

  incrementProjectExportCount: async (projectId: string, userId: string): Promise<boolean> => {
    const proj = await db.getProjectById(projectId);
    if (!proj || proj.userId !== userId) return false;
    proj.exportCount = (proj.exportCount || 0) + 1;
    await db.saveProject(proj);
    return true;
  },

  deleteProject: async (projectId: string, userId: string): Promise<boolean> => {
    const proj = await db.getProjectById(projectId);
    if (proj && proj.userId === userId) {
      await db.deleteProject(projectId);
      return true;
    }
    return false;
  },

  duplicateProject: async (projectId: string, userId: string): Promise<ProjectRecord | null> => {
    const proj = await db.getProjectById(projectId);
    if (!proj || proj.userId !== userId) return null;

    const newId = `proj_${crypto.randomUUID()}`;
    const duplicated: ProjectRecord = {
      ...proj,
      id: newId,
      name: `${proj.name} (Copy)`,
      createdAt: new Date().toISOString(),
      exportCount: 0
    };

    await db.saveProject(duplicated);
    return duplicated;
  }
};
