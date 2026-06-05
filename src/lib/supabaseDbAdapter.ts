import { supabase } from './supabase';
import { DatabaseAdapter, UserRecord, SessionRecord, ProjectRecord } from './dbAdapter';

function mapUserToDb(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    salt: user.salt,
    created_at: user.createdAt,
    reset_token: user.resetToken || null,
    reset_token_expires: user.resetTokenExpires || null
  };
}

function mapUserFromDb(row: any): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    salt: row.salt,
    createdAt: new Date(row.created_at).toISOString(),
    resetToken: row.reset_token || undefined,
    resetTokenExpires: row.reset_token_expires ? new Date(row.reset_token_expires).toISOString() : undefined
  };
}

function mapSessionToDb(session: SessionRecord) {
  return {
    id: session.id,
    user_id: session.userId,
    created_at: session.createdAt,
    expires_at: session.expiresAt
  };
}

function mapSessionFromDb(row: any): SessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString()
  };
}

function mapProjectToDb(project: ProjectRecord) {
  return {
    id: project.id,
    user_id: project.userId,
    name: project.name,
    idea: project.idea,
    industry: project.industry,
    country: project.country,
    target_audience: project.targetAudience,
    budget: project.budget,
    stage: project.stage,
    created_at: project.createdAt,
    report: project.report,
    export_count: project.exportCount || 0
  };
}

function mapProjectFromDb(row: any): ProjectRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    idea: row.idea,
    industry: row.industry,
    country: row.country,
    targetAudience: row.target_audience,
    budget: row.budget,
    stage: row.stage,
    createdAt: new Date(row.created_at).toISOString(),
    report: row.report,
    exportCount: row.export_count || 0
  };
}

export class SupabaseDbAdapter implements DatabaseAdapter {
  // --- USER OPERATIONS ---
  async getUserByEmail(email: string): Promise<UserRecord | null> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by email from Supabase:', error);
      throw error;
    }
    return data ? mapUserFromDb(data) : null;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by id from Supabase:', error);
      throw error;
    }
    return data ? mapUserFromDb(data) : null;
  }

  async createUser(user: UserRecord): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('users')
      .insert(mapUserToDb(user));

    if (error) {
      console.error('Error inserting user to Supabase:', error);
      throw error;
    }
  }

  async updateUser(user: UserRecord): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('users')
      .update(mapUserToDb(user))
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user in Supabase:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      throw error;
    }
  }

  async getUserByResetToken(token: string): Promise<UserRecord | null> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by reset token from Supabase:', error);
      throw error;
    }
    return data ? mapUserFromDb(data) : null;
  }

  // --- SESSION OPERATIONS ---
  async getSession(sessionId: string): Promise<SessionRecord | null> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching session from Supabase:', error);
      throw error;
    }
    return data ? mapSessionFromDb(data) : null;
  }

  async createSession(session: SessionRecord): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('sessions')
      .upsert(mapSessionToDb(session));

    if (error) {
      console.error('Error upserting session to Supabase:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session from Supabase:', error);
      throw error;
    }
  }

  async getAllSessions(): Promise<SessionRecord[]> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('sessions')
      .select('*');

    if (error) {
      console.error('Error fetching all sessions from Supabase:', error);
      throw error;
    }
    return data ? data.map(mapSessionFromDb) : [];
  }

  async deleteExpiredSessions(): Promise<number> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const now = new Date().toISOString();
    const { error, count } = await supabase
      .from('sessions')
      .delete({ count: 'exact' })
      .lt('expires_at', now);

    if (error) {
      console.error('Error deleting expired sessions from Supabase:', error);
      throw error;
    }
    return count || 0;
  }

  // --- PROJECT OPERATIONS ---
  async getProjectById(projectId: string): Promise<ProjectRecord | null> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project by id from Supabase:', error);
      throw error;
    }
    return data ? mapProjectFromDb(data) : null;
  }

  async getProjectsByUserId(userId: string): Promise<ProjectRecord[]> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching projects by user_id from Supabase:', error);
      throw error;
    }
    return data ? data.map(mapProjectFromDb) : [];
  }

  async saveProject(project: ProjectRecord): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('projects')
      .upsert(mapProjectToDb(project));

    if (error) {
      console.error('Error upserting project to Supabase:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project from Supabase:', error);
      throw error;
    }
  }

  async deleteProjectsByUserId(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting projects by user_id from Supabase:', error);
      throw error;
    }
  }
}
