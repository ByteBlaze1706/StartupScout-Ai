import { StartupAnalysisReport } from './mockData';

export interface DBProject {
  id: string;
  name: string;
  idea: string;
  industry: string;
  country: string;
  targetAudience: string;
  budget: string;
  stage: string;
  createdAt: string;
  report: StartupAnalysisReport;
  exportCount?: number;
  teamMembers?: string[];
  comments?: { id: string; user: string; text: string; date: string }[];
}

const isClient = typeof window !== 'undefined';

export const db = {
  getProjects: async (): Promise<DBProject[]> => {
    if (!isClient) return [];
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch (e) {
      console.error('Error reading projects', e);
      return [];
    }
  },

  getProject: async (id: string): Promise<DBProject | null> => {
    if (!isClient) return null;
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(`Error reading project ${id}`, e);
      return null;
    }
  },

  saveProject: async (project: DBProject): Promise<boolean> => {
    if (!isClient) return false;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      return res.ok;
    } catch (e) {
      console.error('Error saving project', e);
      return false;
    }
  },

  deleteProject: async (id: string): Promise<boolean> => {
    if (!isClient) return false;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.error(`Error deleting project ${id}`, e);
      return false;
    }
  },

  duplicateProject: async (id: string): Promise<DBProject | null> => {
    if (!isClient) return null;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.project || null;
    } catch (e) {
      console.error(`Error duplicating project ${id}`, e);
      return null;
    }
  }
};
