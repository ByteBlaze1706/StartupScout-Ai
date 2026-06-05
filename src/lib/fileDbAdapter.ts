import fs from 'fs';
import path from 'path';
import { DatabaseAdapter, UserRecord, SessionRecord, ProjectRecord } from './dbAdapter';

interface DBFileSchema {
  users: Record<string, UserRecord>;
  projects: Record<string, ProjectRecord>;
  sessions: Record<string, SessionRecord>;
}

const DB_PATH = path.join(process.cwd(), 'database.json');

export class FileDbAdapter implements DatabaseAdapter {
  private initDb(): DBFileSchema {
    if (!fs.existsSync(DB_PATH)) {
      const defaultData: DBFileSchema = {
        users: {},
        projects: {},
        sessions: {}
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading file database, resetting database', e);
      const defaultData: DBFileSchema = { users: {}, projects: {}, sessions: {} };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
  }

  private saveDb(data: DBFileSchema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- USER OPERATIONS ---
  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const db = this.initDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = Object.values(db.users).find(u => u.email === cleanEmail);
    return user || null;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const db = this.initDb();
    return db.users[id] || null;
  }

  async createUser(user: UserRecord): Promise<void> {
    const db = this.initDb();
    db.users[user.id] = user;
    this.saveDb(db);
  }

  async updateUser(user: UserRecord): Promise<void> {
    const db = this.initDb();
    db.users[user.id] = user;
    this.saveDb(db);
  }

  async deleteUser(userId: string): Promise<void> {
    const db = this.initDb();
    if (db.users[userId]) {
      delete db.users[userId];
      this.saveDb(db);
    }
  }

  async getUserByResetToken(token: string): Promise<UserRecord | null> {
    const db = this.initDb();
    const user = Object.values(db.users).find(u => u.resetToken === token);
    return user || null;
  }

  // --- SESSION OPERATIONS ---
  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const db = this.initDb();
    return db.sessions[sessionId] || null;
  }

  async createSession(session: SessionRecord): Promise<void> {
    const db = this.initDb();
    db.sessions[session.id] = session;
    this.saveDb(db);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = this.initDb();
    if (db.sessions[sessionId]) {
      delete db.sessions[sessionId];
      this.saveDb(db);
    }
  }

  async getAllSessions(): Promise<SessionRecord[]> {
    const db = this.initDb();
    return Object.values(db.sessions);
  }

  async deleteExpiredSessions(): Promise<number> {
    const db = this.initDb();
    const now = Date.now();
    let count = 0;
    Object.entries(db.sessions).forEach(([id, sess]) => {
      if (new Date(sess.expiresAt).getTime() < now) {
        delete db.sessions[id];
        count++;
      }
    });
    if (count > 0) {
      this.saveDb(db);
    }
    return count;
  }

  // --- PROJECT OPERATIONS ---
  async getProjectById(projectId: string): Promise<ProjectRecord | null> {
    const db = this.initDb();
    return db.projects[projectId] || null;
  }

  async getProjectsByUserId(userId: string): Promise<ProjectRecord[]> {
    const db = this.initDb();
    return Object.values(db.projects).filter(p => p.userId === userId);
  }

  async saveProject(project: ProjectRecord): Promise<void> {
    const db = this.initDb();
    db.projects[project.id] = project;
    this.saveDb(db);
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = this.initDb();
    if (db.projects[projectId]) {
      delete db.projects[projectId];
      this.saveDb(db);
    }
  }

  async deleteProjectsByUserId(userId: string): Promise<void> {
    const db = this.initDb();
    let updated = false;
    Object.entries(db.projects).forEach(([id, proj]) => {
      if (proj.userId === userId) {
        delete db.projects[id];
        updated = true;
      }
    });
    if (updated) {
      this.saveDb(db);
    }
  }
}
