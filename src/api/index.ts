import type {
  User, Resume, Analytics, AdminStats, AIRequest, AIResponse,
  ResumeListResponse, TemplateId, ResumeTheme, SectionOrderItem, ResumeData,
} from '@/types';
import { uid } from '@/lib/utils';
import { defaultSectionOrder, emptyResumeData } from '@/lib/resumeDefaults';
import { localAI } from '@/lib/localAI';


const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';


console.log('API_URL:', API_URL);

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error((body as any)?.message || `Request failed (${res.status})`);
  return body as T;
}

const DB_KEY = 'resumly_db_v1';
interface DB {
  users: (User & { password?: string })[];
  resumes: Resume[];
  resetTokens: { token: string; email: string; expires: number }[];
  sessionEmail: string | null;
  downloadsByResume: Record<string, number>;
}
function loadDB(): DB {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const seedAdmin: User = {
    _id: 'admin-1', name: 'Admin', email: 'admin@resumly.app', role: 'admin',
    createdAt: new Date().toISOString(), profileCompleted: true,
  };
  const db: DB = {
    users: [{ ...seedAdmin, password: 'admin123' }],
    resumes: [],
    resetTokens: [],
    sessionEmail: null,
    downloadsByResume: {},
  };
  saveDB(db);
  return db;
}
function saveDB(db: DB) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function delay<T>(v: T, ms = 180): Promise<T> { return new Promise(r => setTimeout(() => r(v), ms)); }
function sanitize<T>(u: T): T { const { password, ...rest } = u as any; return rest; }

// --- Auth (local) ---
function localRegister(name: string, email: string, password: string): Promise<User> {
  const db = loadDB();
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return Promise.reject(new Error('An account with this email already exists.'));
  const user: User = {
    _id: uid(), name, email, role: 'user', createdAt: new Date().toISOString(),
    avatarUrl: '', profileCompleted: false,
  };
  db.users.push({ ...user, password });
  db.sessionEmail = email;
  saveDB(db);
  return delay(sanitize(user));
}
function localLogin(email: string, password: string): Promise<User> {
  const db = loadDB();
  const u = db.users.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u || u.password !== password) return Promise.reject(new Error('Invalid email or password.'));
  db.sessionEmail = email; saveDB(db);
  return delay(sanitize(u));
}
function localMe(): Promise<User | null> {
  const db = loadDB();
  if (!db.sessionEmail) return delay(null);
  const u = db.users.find(x => x.email.toLowerCase() === db.sessionEmail!.toLowerCase());
  return delay(u ? sanitize(u) : null);
}
function localLogout(): Promise<void> { const db = loadDB(); db.sessionEmail = null; saveDB(db); return delay(undefined); }
function localForgot(email: string): Promise<string> {
  const db = loadDB();
  const u = db.users.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u) return delay('reset-link-sent'); // do not leak existence
  const token = uid(24);
  db.resetTokens.push({ token, email, expires: Date.now() + 3600_000 });
  saveDB(db);
  return delay(token);
}
function localReset(token: string, password: string): Promise<void> {
  const db = loadDB();
  const t = db.resetTokens.find(x => x.token === token);
  if (!t || t.expires < Date.now()) return Promise.reject(new Error('Reset token is invalid or expired.'));
  const u = db.users.find(x => x.email.toLowerCase() === t.email.toLowerCase());
  if (!u) return Promise.reject(new Error('Account not found.'));
  u.password = password;
  db.resetTokens = db.resetTokens.filter(x => x.token !== token);
  saveDB(db);
  return delay(undefined);
}
function localUpdateProfile(patch: Partial<User>): Promise<User> {
  const db = loadDB();
  const u = db.users.find(x => x.email.toLowerCase() === db.sessionEmail?.toLowerCase());
  if (!u) return Promise.reject(new Error('Not authenticated'));
  Object.assign(u, patch);
  u.profileCompleted = !!(u.name && u.title && u.phone && u.location && u.avatarUrl);
  saveDB(db);
  return delay(sanitize(u));
}

// --- Resumes (local) ---
function localList(params: { page?: number; limit?: number; q?: string } = {}): Promise<ResumeListResponse> {
  const db = loadDB();
  const me = db.users.find(x => x.email.toLowerCase() === db.sessionEmail?.toLowerCase());
  if (!me) return Promise.reject(new Error('Not authenticated'));
  let items = db.resumes.filter(r => r.userId === me._id);
  if (params.q) {
    const q = params.q.toLowerCase();
    items = items.filter(r => r.title.toLowerCase().includes(q) || r.data.personal.fullName.toLowerCase().includes(q));
  }
  items = items.sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  const total = items.length;
  const page = params.page || 1; const limit = params.limit || 6;
  const pages = Math.max(1, Math.ceil(total / limit));
  const slice = items.slice((page-1)*limit, page*limit);
  return delay({ items: slice, total, page, pages });
}
function localGet(id: string): Promise<Resume> {
  const db = loadDB();
  const r = db.resumes.find(x => x._id === id);
  if (!r) return Promise.reject(new Error('Resume not found'));
  return delay(r);
}
function localCreate(payload: { title: string; templateId: TemplateId; theme?: Partial<ResumeTheme> }): Promise<Resume> {
  const db = loadDB();
  const me = db.users.find(x => x.email.toLowerCase() === db.sessionEmail?.toLowerCase());
  if (!me) return Promise.reject(new Error('Not authenticated'));
  const now = new Date().toISOString();
  const r: Resume = {
    _id: uid(), userId: me._id, title: payload.title, templateId: payload.templateId,
    theme: { primary:'#1f4af0', accent:'#0f172a', text:'#1e293b', muted:'#64748b', font:'sans', fontSize:'md', spacing:'normal', layout:'single', ...payload.theme },
    sectionOrder: defaultSectionOrder(),
    data: { ...emptyResumeData(), personal: { ...emptyResumeData().personal, fullName: me.name, email: me.email } },
    createdAt: now, updatedAt: now, downloads: 0, atsScore: 0,
  };
  db.resumes.push(r); saveDB(db);
  return delay(r);
}
function localUpdate(id: string, patch: Partial<Resume>): Promise<Resume> {
  const db = loadDB();
  const r = db.resumes.find(x => x._id === id);
  if (!r) return Promise.reject(new Error('Resume not found'));
  Object.assign(r, patch, { updatedAt: new Date().toISOString() });
  saveDB(db);
  return delay(r);
}
function localRemove(id: string): Promise<void> {
  const db = loadDB();
  db.resumes = db.resumes.filter(x => x._id !== id);
  delete db.downloadsByResume[id];
  saveDB(db); return delay(undefined);
}
function localDuplicate(id: string): Promise<Resume> {
  const db = loadDB();
  const r = db.resumes.find(x => x._id === id);
  if (!r) return Promise.reject(new Error('Resume not found'));
  const copy: Resume = { ...JSON.parse(JSON.stringify(r)), _id: uid(), title: `${r.title} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), downloads: 0 };
  db.resumes.push(copy); saveDB(db);
  return delay(copy);
}
function localIncrementDownload(id: string): Promise<void> {
  const db = loadDB();
  db.downloadsByResume[id] = (db.downloadsByResume[id] || 0) + 1;
  const r = db.resumes.find(x => x._id === id);
  if (r) r.downloads = (r.downloads || 0) + 1;
  saveDB(db); return delay(undefined);
}

// --- Analytics (local) ---
function localAnalytics(): Promise<Analytics> {
  const db = loadDB();
  const me = db.users.find(x => x.email.toLowerCase() === db.sessionEmail?.toLowerCase());
  if (!me) return Promise.reject(new Error('Not authenticated'));
  const mine = db.resumes.filter(r => r.userId === me._id).sort((a,b)=>+new Date(b.updatedAt)-+new Date(a.updatedAt));
  const totalDownloads = mine.reduce((s,r)=>s+(r.downloads||0),0);
  const fields = ['name','title','phone','location','avatarUrl','bio','linkedin','github','website'] as const;
  const filled = fields.filter(f => (me as any)[f]).length;
  const storageUsed = mine.reduce((s,r)=>s+JSON.stringify(r).length,0);
  const avgAtsScore = mine.length ? Math.round(mine.reduce((s,r)=>s+(r.atsScore||0),0)/mine.length) : 0;
  return delay({
    totalResumes: mine.length, totalDownloads, profileCompletion: Math.round(filled/fields.length*100),
    recentResumes: mine.slice(0,4), storageUsed, avgAtsScore,
  });
}

// --- Admin (local) ---
function localAdminStats(): Promise<AdminStats> {
  const db = loadDB();
  const users = db.users.map(sanitize);
  const resumes = db.resumes;
  const totalDownloads = resumes.reduce((s,r)=>s+(r.downloads||0),0);
  const growth: { date: string; users: number; resumes: number }[] = [];
  for (let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i); const key = d.toISOString().slice(0,10);
    growth.push({ date: key, users: users.filter(u=>u.createdAt.slice(0,10)===key).length, resumes: resumes.filter(r=>r.createdAt.slice(0,10)===key).length });
  }
  return delay({
    totalUsers: users.length, totalResumes: resumes.length, totalDownloads,
    recentUsers: users.sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)).slice(0,5),
    recentResumes: resumes.sort((a,b)=>+new Date(b.updatedAt)-+new Date(a.updatedAt)).slice(0,5),
    growth,
  });
}

// --- AI (local fallback; backend preferred) ---

function localAIRun(req: AIRequest): Promise<AIResponse> { return delay(localAI(req)); }

// --- Upload (local: returns a data URL; backend uses ImageKit) ---
async function localUpload(file: File): Promise<{ url: string }> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.onerror = rej; fr.readAsDataURL(file);
  });
  return { url: dataUrl };
}

/* ---------------- Public API surface ---------------- */
export const api = {
  isRemote: !!API_URL,

  auth: {
    register: (name: string, email: string, password: string) =>
      API_URL ? http<User>('/api/auth/register', { method:'POST', body: JSON.stringify({ name, email, password }) }) : localRegister(name, email, password),
    login: (email: string, password: string) =>
      API_URL ? http<User>('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) }) : localLogin(email, password),
    logout: () => API_URL ? http<void>('/api/auth/logout', { method:'POST' }) : localLogout(),
    me: () => API_URL ? http<User>('/api/auth/me') : localMe(),
    forgot: (email: string) => API_URL ? http<{ message: string }>('/api/auth/forgot-password', { method:'POST', body: JSON.stringify({ email }) }) : localForgot(email).then(() => ({ message: 'reset-link-sent' })),
    reset: (token: string, password: string) => API_URL ? http<void>('/api/auth/reset-password', { method:'POST', body: JSON.stringify({ token, password }) }) : localReset(token, password),
    updateProfile: (patch: Partial<User>) => API_URL ? http<User>('/api/users/me', { method:'PATCH', body: JSON.stringify(patch) }) : localUpdateProfile(patch),
  },

  resumes: {
    list: (params?: { page?: number; limit?: number; q?: string }) =>
      API_URL ? http<ResumeListResponse>(`/api/resumes?${new URLSearchParams(params as any)}`) : localList(params),
    get: (id: string) => API_URL ? http<Resume>(`/api/resumes/${id}`) : localGet(id),
    create: (p: { title: string; templateId: TemplateId; theme?: Partial<ResumeTheme> }) =>
      API_URL ? http<Resume>('/api/resumes', { method:'POST', body: JSON.stringify(p) }) : localCreate(p),
    update: (id: string, patch: Partial<Resume>) =>
      API_URL ? http<Resume>(`/api/resumes/${id}`, { method:'PATCH', body: JSON.stringify(patch) }) : localUpdate(id, patch),
    remove: (id: string) => API_URL ? http<void>(`/api/resumes/${id}`, { method:'DELETE' }) : localRemove(id),
    duplicate: (id: string) => API_URL ? http<Resume>(`/api/resumes/${id}/duplicate`, { method:'POST' }) : localDuplicate(id),
    download: (id: string) => API_URL ? http<void>(`/api/resumes/${id}/download`, { method:'POST' }) : localIncrementDownload(id),
  },

  analytics: {
    me: () => API_URL ? http<Analytics>('/api/analytics/me') : localAnalytics(),
    admin: () => API_URL ? http<AdminStats>('/api/analytics/admin') : localAdminStats(),
  },

  admin: {
    users: () => API_URL ? http<User[]>('/api/admin/users') : delay(loadDB().users.map(sanitize)),
    deleteUser: (id: string) => API_URL ? http<void>(`/api/admin/users/${id}`, { method:'DELETE' }) : (() => { const db=loadDB(); db.users=db.users.filter(u=>u._id!==id); db.resumes=db.resumes.filter(r=>r.userId!==id); saveDB(db); return delay(undefined); })(),
    deleteResume: (id: string) => API_URL ? http<void>(`/api/admin/resumes/${id}`, { method:'DELETE' }) : localRemove(id),
  },

  ai: {
    run: (req: AIRequest) => API_URL ? http<AIResponse>('/api/ai/run', { method:'POST', body: JSON.stringify(req) }) : localAIRun(req),
  },

  upload: {
  image: async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

    return API_URL
      ? http<{ url: string; fileId: string }>('/api/upload/image', {
          method: 'POST',
          body: JSON.stringify({
            file: base64,
            name: file.name,
          }),
        })
      : localUpload(file);
  },
},
};

export type Api = typeof api;
