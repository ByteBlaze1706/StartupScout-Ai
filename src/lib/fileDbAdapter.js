import fs from 'fs';
import path from 'path';








const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const DB_PATH = isVercel ? '/tmp/database.json' : path.join(process.cwd(), 'database.json');

export class FileDbAdapter {
  initDb() {
    if (!fs.existsSync(DB_PATH)) {
      const defaultData = {
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
      const defaultData = { users: {}, projects: {}, sessions: {} };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
  }

  saveDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- USER OPERATIONS ---
  async getUserByEmail(email) {
    const db = this.initDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = Object.values(db.users).find((u) => u.email === cleanEmail);
    return user || null;
  }

  async getUserById(id) {
    const db = this.initDb();
    return db.users[id] || null;
  }

  async createUser(user) {
    const db = this.initDb();
    db.users[user.id] = user;
    this.saveDb(db);
  }

  async updateUser(user) {
    const db = this.initDb();
    db.users[user.id] = user;
    this.saveDb(db);
  }

  async deleteUser(userId) {
    const db = this.initDb();
    if (db.users[userId]) {
      delete db.users[userId];
      this.saveDb(db);
    }
  }

  async getUserByResetToken(token) {
    const db = this.initDb();
    const user = Object.values(db.users).find((u) => u.resetToken === token);
    return user || null;
  }

  // --- SESSION OPERATIONS ---
  async getSession(sessionId) {
    const db = this.initDb();
    return db.sessions[sessionId] || null;
  }

  async createSession(session) {
    const db = this.initDb();
    db.sessions[session.id] = session;
    this.saveDb(db);
  }

  async deleteSession(sessionId) {
    const db = this.initDb();
    if (db.sessions[sessionId]) {
      delete db.sessions[sessionId];
      this.saveDb(db);
    }
  }

  async getAllSessions() {
    const db = this.initDb();
    return Object.values(db.sessions);
  }

  async deleteExpiredSessions() {
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
  async getProjectById(projectId) {
    const db = this.initDb();
    return db.projects[projectId] || null;
  }

  async getProjectsByUserId(userId) {
    const db = this.initDb();
    return Object.values(db.projects).filter((p) => p.userId === userId);
  }

  async saveProject(project) {
    const db = this.initDb();
    db.projects[project.id] = project;
    this.saveDb(db);
  }

  async deleteProject(projectId) {
    const db = this.initDb();
    if (db.projects[projectId]) {
      delete db.projects[projectId];
      this.saveDb(db);
    }
  }

  async deleteProjectsByUserId(userId) {
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