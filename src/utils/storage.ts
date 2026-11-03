import { Project, UserAccount } from '../types';

const STORAGE_KEY_PROJECTS = 'smartdecision_projects';
const STORAGE_KEY_ACTIVE_ID = 'smartdecision_active_id';
const STORAGE_KEY_USER = 'smartdecision_user';
const STORAGE_KEY_SYNC_SETTINGS = 'smartdecision_sync_settings';

export interface SyncSettings {
  mode: 'local' | 'cloud';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export function loadStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
    return [];
  }
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
}

export function loadActiveProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function saveActiveProjectId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (e) {
    console.error('Failed to save active project id', e);
  }
}

export function loadCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

export function loadSyncSettings(): SyncSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNC_SETTINGS);
    if (!raw) {
      return {
        mode: 'local',
        autoSync: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return { mode: 'local', autoSync: true };
  }
}

export function saveSyncSettings(settings: SyncSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYNC_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save sync settings', e);
  }
}

// JSON Backup Export
export function exportProjectsToJson(projects: Project[]): void {
  const exportData = {
    app: 'SmartDecision AI',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    projectCount: projects.length,
    projects,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.download = `SmartDecision_AI_Projects_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// JSON Import Validation
export interface ImportValidationResult {
  valid: boolean;
  projects: Project[];
  error?: string;
  duplicates: {
    existing: Project;
    incoming: Project;
  }[];
}

export function validateImportJson(
  jsonText: string,
  existingProjects: Project[]
): ImportValidationResult {
  try {
    const data = JSON.parse(jsonText);
    let projectsToValidate: any[] = [];

    if (Array.isArray(data)) {
      projectsToValidate = data;
    } else if (data && Array.isArray(data.projects)) {
      projectsToValidate = data.projects;
    } else {
      return {
        valid: false,
        projects: [],
        error: 'Tệp JSON không chứa danh sách dự án hợp lệ (cần mảng các dự án hoặc đối tượng chứa thuộc tính "projects").',
        duplicates: [],
      };
    }

    const validProjects: Project[] = [];
    for (const p of projectsToValidate) {
      if (!p.id || !p.name || !Array.isArray(p.options) || !Array.isArray(p.criteria)) {
        return {
          valid: false,
          projects: [],
          error: `Dự án "${p.name || 'Không tên'}" thiếu thông tin bắt buộc (id, name, options, criteria).`,
          duplicates: [],
        };
      }
      validProjects.push({
        id: String(p.id),
        name: String(p.name),
        businessName: p.businessName ? String(p.businessName) : '',
        domain: p.domain ? String(p.domain) : 'Lĩnh vực khác',
        problemDescription: p.problemDescription ? String(p.problemDescription) : '',
        options: p.options.map((opt: any, idx: number) => ({
          id: opt.id || `opt-${idx + 1}`,
          name: opt.name || `Phương án ${idx + 1}`,
          description: opt.description || '',
          color: opt.color || '#2563eb',
        })),
        criteria: p.criteria.map((crit: any, idx: number) => ({
          id: crit.id || `crit-${idx + 1}`,
          name: crit.name || `Tiêu chí ${idx + 1}`,
          weight: Number(crit.weight) || 0,
          description: crit.description || '',
        })),
        scores: p.scores || {},
        status: p.status === 'completed' ? 'completed' : 'in_progress',
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
        isSample: Boolean(p.isSample),
      });
    }

    // Check for duplicates with existing projects
    const duplicates: { existing: Project; incoming: Project }[] = [];
    for (const inc of validProjects) {
      const existingMatch = existingProjects.find(
        (e) => e.id === inc.id || e.name.trim().toLowerCase() === inc.name.trim().toLowerCase()
      );
      if (existingMatch) {
        duplicates.push({ existing: existingMatch, incoming: inc });
      }
    }

    return {
      valid: true,
      projects: validProjects,
      duplicates,
    };
  } catch (err: any) {
    return {
      valid: false,
      projects: [],
      error: `Lỗi đọc tệp JSON: ${err.message}`,
      duplicates: [],
    };
  }
}
