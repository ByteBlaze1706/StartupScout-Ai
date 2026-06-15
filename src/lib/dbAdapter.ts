export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  resetToken?: string;
  resetTokenExpires?: string;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  name: string;
  idea: string;
  industry: string;
  country: string;
  targetAudience: string;
  budget: string;
  stage: string;
  createdAt: string;
  report: any;
  exportCount?: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DatabaseAdapter {
  // User Operations
  getUserByEmail(email: string): Promise<UserRecord | null>;
  getUserById(id: string): Promise<UserRecord | null>;
  createUser(user: UserRecord): Promise<void>;
  updateUser(user: UserRecord): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getUserByResetToken(token: string): Promise<UserRecord | null>;

  // Session Operations
  getSession(sessionId: string): Promise<SessionRecord | null>;
  createSession(session: SessionRecord): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  getAllSessions(): Promise<SessionRecord[]>;
  deleteExpiredSessions(): Promise<number>;

  // Project Operations
  getProjectById(projectId: string): Promise<ProjectRecord | null>;
  getProjectsByUserId(userId: string): Promise<ProjectRecord[]>;
  saveProject(project: ProjectRecord): Promise<void>;
  deleteProject(projectId: string): Promise<void>;
  deleteProjectsByUserId(userId: string): Promise<void>;
}
