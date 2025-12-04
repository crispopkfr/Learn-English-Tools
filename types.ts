
export interface Segment {
  text: string;
  isError: boolean;
  severity?: 'critical' | 'suggestion';
  correction?: string;
  reason?: string;
}

export interface Explanation {
  overview: string;
  improvements: string[];
}

export interface GrammarAnalysis {
  segments: Segment[];
  correctedSentence: string;
  explanation: Explanation;
}

export interface RewriteAnalysis {
  originalText: string;
  rewrittenText: string;
  style: RewriteStyle;
  explanation: Explanation;
}

export type RewriteStyle = 
  | 'Professional' 
  | 'Casual' 
  | 'Academic' 
  | 'Creative' 
  | 'Formal' 
  | 'Informal' 
  | 'Analytical' 
  | 'Narrative' 
  | 'Persuasive' 
  | 'Descriptive';

export interface QuickRewriteState {
  styles: RewriteStyle[];
  selectedStyle: RewriteStyle | null;
  result: string | null;
  isLoading: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type Theme = 'light' | 'dark';

export type ViewMode = 'checker' | 'profile';

export type ToolMode = 'writing' | 'study';

export type AppColor = 'blue' | 'orange' | 'green' | 'indigo' | 'rose' | 'red';

export type AppLanguage = 'en' | 'es' | 'pt' | 'fr' | 'ja' | 'zh';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  textSnippet: string;
  fullText?: string;
  errorCount: number;
  suggestionCount: number;
  isPerfect: boolean;
  type?: 'grammar' | 'rewrite';
  rewriteStyle?: string;
}

export interface UserStats {
  totalChecks: number;
  totalErrors: number;
  accuracyRate: number; // Percentage of perfect submissions
  perfectRuns: number;
}

// Global augmentations for Vite-injected variables and types
declare global {
  interface ImportMeta {
    env: {
      DEV: boolean;
      [key: string]: any;
    };
  }
}
