

















const isClient = typeof window !== 'undefined';

export const db = {
  getProjects: async () => {
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

  getProject: async (id) => {
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

  saveProject: async (project) => {
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

  deleteProject: async (id) => {
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

  duplicateProject: async (id) => {
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