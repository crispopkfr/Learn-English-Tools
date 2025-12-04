
import { GrammarAnalysis, HistoryEntry, UserStats, RewriteAnalysis, AppColor } from "../types";

const STORAGE_KEY = 'grammarguard_history';
const STATE_KEY = 'grammarguard_app_state';
const API_KEY_STORAGE_KEY = 'grammarguard_api_key';
const VERSION_KEY = 'grammarguard_version';

// Must match package.json version to trigger migrations/clearing
const CURRENT_VERSION = '1.0.3';

interface AppState {
  inputText: string;
  grammarResult: GrammarAnalysis | null;
  rewriteResult: RewriteAnalysis | null;
  colorScheme: AppColor;
}

// --- History & State Management ---

export const saveHistory = (text: string, analysis: GrammarAnalysis): void => {
  try {
    const history = getHistory();
    
    const errorCount = analysis.segments.filter(s => s.isError && (s.severity === 'critical' || !s.severity)).length;
    const suggestionCount = analysis.segments.filter(s => s.isError && s.severity === 'suggestion').length;
    
    // Use corrected sentence for the history snippet
    const content = analysis.correctedSentence || text;

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      textSnippet: content.length > 60 ? content.substring(0, 60) + '...' : content,
      fullText: content,
      errorCount: errorCount,
      suggestionCount: suggestionCount,
      isPerfect: errorCount === 0 && suggestionCount === 0,
      type: 'grammar'
    };

    const updatedHistory = [newEntry, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
};

export const saveRewriteHistory = (text: string, analysis: RewriteAnalysis): void => {
  try {
    const history = getHistory();
    const content = analysis.rewrittenText;

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      textSnippet: content.length > 60 ? content.substring(0, 60) + '...' : content,
      fullText: content,
      errorCount: 0,
      suggestionCount: 0,
      isPerfect: true, // Rewrites are considered valid/perfect results
      type: 'rewrite',
      rewriteStyle: analysis.style
    };

    const updatedHistory = [newEntry, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save rewrite history:", error);
  }
};

export const getHistory = (): HistoryEntry[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getStats = (): UserStats => {
  const history = getHistory();
  // Filter for grammar checks mainly, or include all? 
  // Standard stats usually apply to grammar checking accuracy.
  const grammarHistory = history.filter(h => h.type === 'grammar' || !h.type);
  
  const totalChecks = grammarHistory.length;
  
  if (totalChecks === 0) {
    return {
      totalChecks: 0,
      totalErrors: 0,
      accuracyRate: 0,
      perfectRuns: 0
    };
  }

  const totalErrors = grammarHistory.reduce((sum, item) => sum + item.errorCount, 0);
  const perfectRuns = grammarHistory.filter(item => item.isPerfect).length;
  
  return {
    totalChecks,
    totalErrors,
    accuracyRate: Math.round((perfectRuns / totalChecks) * 100),
    perfectRuns
  };
};

export const exportHistoryJSON = (): void => {
  const history = localStorage.getItem(STORAGE_KEY) || '[]';
  const blob = new Blob([history], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grammarguard_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importHistoryJSON = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Merge strategy: unique IDs
          const current = getHistory();
          const currentIds = new Set(current.map(x => x.id));
          // Filter out entries that already exist
          const newEntries = parsed.filter((x: any) => x.id && !currentIds.has(x.id));
          
          const merged = [...newEntries, ...current].sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.error("Import error", err);
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save app state:", error);
  }
};

export const getAppState = (): AppState | null => {
  // Version Check: If version mismatches, clear potentially incompatible state
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== CURRENT_VERSION) {
    console.log(`Detected update: ${storedVersion} -> ${CURRENT_VERSION}. Clearing volatile app state.`);
    localStorage.removeItem(STATE_KEY);
    // Note: We deliberately preserve HISTORY and API KEY as they are valuable user data.
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    return null;
  }

  try {
    const item = localStorage.getItem(STATE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Failed to load app state:", error);
    return null;
  }
};

export const saveApiKey = (key: string): void => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch (error) {
    console.error("Failed to save API key:", error);
  }
};

export const getStoredApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to get API key:", error);
    return null;
  }
};

export const removeApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to remove API key:", error);
  }
};
