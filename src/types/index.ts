

export type ID = string;

export interface User {
  _id: ID;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  createdAt: string;
  profileCompleted?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
}

export interface SummarySection { id: ID; title: string; text: string; }

export interface EducationItem {
  id: ID;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  gpa?: string;
  description?: string;
}
export interface ExperienceItem {
  id: ID;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}
export interface ProjectItem {
  id: ID;
  name: string;
  link?: string;
  description: string;
  tech: string[];
}
export interface SkillItem { id: ID; name: string; level?: 'Beginner'|'Intermediate'|'Advanced'|'Expert'; }
export interface LanguageItem { id: ID; name: string; proficiency: 'Basic'|'Conversational'|'Fluent'|'Native'; }
export interface CertificationItem { id: ID; name: string; issuer: string; date: string; link?: string; }
export interface AchievementItem { id: ID; title: string; description: string; date?: string; }
export interface InterestItem { id: ID; name: string; }
export interface CustomItem { id: ID; title: string; value: string; }
export interface CustomSection {
  id: ID;
  title: string;
  items: CustomItem[];
}

export type SectionKind =
  | 'personal' | 'summary' | 'experience' | 'education' | 'projects'
  | 'skills' | 'languages' | 'certifications' | 'achievements'
  | 'interests' | 'custom';

export interface SectionOrderItem { kind: SectionKind; id: string; visible: boolean; }

export interface ResumeData {
  personal: PersonalInfo;
  summary: SummarySection;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  interests: InterestItem[];
  customSections: CustomSection[];
}

export type TemplateId =
  | 'modern' | 'classic' | 'minimal' | 'executive' | 'google'
  | 'harvard' | 'stanford' | 'professional' | 'creative' | 'corporate';

export interface ResumeTheme {
  primary: string;     // hex
  accent: string;      // hex
  text: string;        // hex
  muted: string;       // hex
  font: 'sans' | 'serif' | 'mono';
  fontSize: 'sm' | 'md' | 'lg';
  spacing: 'compact' | 'normal' | 'comfortable';
  layout: 'single' | 'sidebar';
}

export interface Resume {
  _id: ID;
  userId: ID;
  title: string;
  templateId: TemplateId;
  theme: ResumeTheme;
  sectionOrder: SectionOrderItem[];
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
  downloads?: number;
  atsScore?: number;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  layout: 'single' | 'sidebar';
  accent: string;
  atsFriendly: boolean;
  premium?: boolean;
}

export interface AuthResponse { user: User; }
export interface ResumeListResponse { items: Resume[]; total: number; page: number; pages: number; }
export interface Analytics {
  totalResumes: number;
  totalDownloads: number;
  profileCompletion: number;
  recentResumes: Resume[];
  storageUsed: number;
  avgAtsScore: number;
}
export interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  totalDownloads: number;
  recentUsers: User[];
  recentResumes: Resume[];
  growth: { date: string; users: number; resumes: number }[];
}

// AI request/response
export type AIFeature =
  | 'summary' | 'bullets' | 'skills' | 'projectDescription'
  | 'coverLetter' | 'improveGrammar' | 'rewrite' | 'shorten' | 'expand'
  | 'atsScore' | 'keywordSuggestions' | 'jdMatch';

export interface AIRequest {
  feature: AIFeature;
  resumeData?: Partial<ResumeData>;
  jobDescription?: string;
  text?: string;
  context?: string;
}
export interface AIResponse {
  result: string | string[];
  score?: number;
  suggestions?: string[];
  keywords?: { matched: string[]; missing: string[] };
  matchPercent?: number;
}

export interface Toast { id: string; type: 'success'|'error'|'info'|'warning'; message: string; }
