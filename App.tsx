
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { AnalysisResult } from './components/AnalysisResult';
import { RewriteResult } from './components/RewriteResult';
import { Profile } from './components/Profile';
import { SettingsModal } from './components/SettingsModal';
import { 
  GrammarAnalysis, 
  LoadingState, 
  Theme, 
  ViewMode, 
  AppColor,
  RewriteStyle,
  RewriteAnalysis,
  QuickRewriteState,
  ToolMode
} from './types';
import { checkGrammar, rewriteText } from './services/geminiService';
import { 
  saveHistory, 
  saveRewriteHistory,
  saveAppState 
} from './services/storageService';
import { t } from './services/translations';

const App: React.FC = () => {
  // --- State Initialization ---
  
  // Persistent Settings (Theme & Color Scheme)
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grammarguard_theme');
      return (saved as Theme) || 'light';
    }
    return 'light';
  });

  const [colorScheme, setColorScheme] = useState<AppColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grammarguard_color_scheme');
      return (saved as AppColor) || 'blue';
    }
    return 'blue';
  });

  // Content State - Reset on refresh as requested
  const [inputText, setInputText] = useState('');
  const [grammarResult, setGrammarResult] = useState<GrammarAnalysis | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteAnalysis | null>(null);
  
  // Quick Rewrite State (Persisted in App)
  const [quickRewriteState, setQuickRewriteState] = useState<QuickRewriteState>({
    styles: [],
    selectedStyle: null,
    result: null,
    isLoading: false
  });

  // UI State
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [currentView, setCurrentView] = useState<ViewMode>('checker');
  const [toolMode, setToolMode] = useState<ToolMode>('writing');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [historyUpdateTrigger, setHistoryUpdateTrigger] = useState(0);

  // --- Effects ---

  // Theme Handling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('grammarguard_theme', currentTheme);
  }, [currentTheme]);

  // Color Scheme Persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorScheme);
    localStorage.setItem('grammarguard_color_scheme', colorScheme);
  }, [colorScheme]);

  // State Persistence (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveAppState({
        inputText,
        grammarResult,
        rewriteResult,
        colorScheme
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [inputText, grammarResult, rewriteResult, colorScheme]);


  // --- Handlers ---

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) return;

    setLoadingState(LoadingState.LOADING);
    setGrammarResult(null); // Clear previous results while loading
    setRewriteResult(null); 
    setQuickRewriteState({ styles: [], selectedStyle: null, result: null, isLoading: false }); // Reset quick rewrite

    try {
      const result = await checkGrammar(inputText);
      setGrammarResult(result);
      setLoadingState(LoadingState.SUCCESS);
      
      // Save to history
      saveHistory(inputText, result);
      setHistoryUpdateTrigger(prev => prev + 1);

      // Initialize Random Quick Rewrite Styles
      const allStyles: RewriteStyle[] = [
        'Professional', 'Casual', 'Academic', 'Creative', 
        'Formal', 'Informal', 'Analytical', 'Narrative', 
        'Persuasive', 'Descriptive'
      ];
      // Shuffle and pick 4
      const shuffled = [...allStyles].sort(() => 0.5 - Math.random());
      setQuickRewriteState(prev => ({
          ...prev,
          styles: shuffled.slice(0, 4),
          selectedStyle: null,
          result: null,
          isLoading: false
      }));

    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
      alert(t.errors.generic);
    }
  };

  const handleRewrite = async (style: RewriteStyle) => {
    if (!inputText.trim()) return;

    setLoadingState(LoadingState.LOADING);
    setRewriteResult(null);
    setGrammarResult(null); // Clear grammar result
    setQuickRewriteState({ styles: [], selectedStyle: null, result: null, isLoading: false });

    try {
      const result = await rewriteText(inputText, style);
      setRewriteResult(result);
      setLoadingState(LoadingState.SUCCESS);
      
      // Save rewrite to history
      saveRewriteHistory(inputText, result);
      setHistoryUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
      alert(t.errors.generic);
    }
  };

  const handleQuickRewrite = async (style: RewriteStyle) => {
    if (!grammarResult) return;
    
    setQuickRewriteState(prev => ({ ...prev, selectedStyle: style, isLoading: true }));

    try {
        const result = await rewriteText(grammarResult.correctedSentence, style);
        setQuickRewriteState(prev => ({ 
            ...prev, 
            result: result.rewrittenText, 
            isLoading: false 
        }));
    } catch (error) {
        console.error(error);
        setQuickRewriteState(prev => ({ ...prev, isLoading: false }));
        // Optionally show specific error for quick rewrite
    }
  };

  const handleStopQuickRewrite = () => {
    setQuickRewriteState(prev => ({ ...prev, isLoading: false }));
  };

  const handleClear = () => {
    setInputText('');
    setGrammarResult(null);
    setRewriteResult(null);
    setQuickRewriteState({ styles: [], selectedStyle: null, result: null, isLoading: false });
    setLoadingState(LoadingState.IDLE);
  };

  const handleStop = () => {
    setLoadingState(LoadingState.IDLE);
  };

  const handleRetryRewrite = () => {
    if (rewriteResult) {
      handleRewrite(rewriteResult.style);
    }
  };

  return (
    <div className={`min-h-screen bg-t-bg text-t-text font-sans transition-colors duration-300 selection:bg-blue-500/20 selection:text-blue-700`}>
      <Header 
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentView={currentView}
        onViewChange={setCurrentView}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        colorScheme={colorScheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {currentView === 'checker' ? (
          <>
            {toolMode === 'writing' ? (
              <div className="space-y-8 animate-fade-in">
                <InputArea 
                  value={inputText}
                  onChange={setInputText}
                  onCheck={handleCheckGrammar}
                  onRewrite={handleRewrite}
                  onClear={handleClear}
                  onRetry={handleRetryRewrite}
                  onStop={handleStop}
                  loadingState={loadingState}
                  analysis={grammarResult}
                  colorScheme={colorScheme}
                  hasRewriteResult={!!rewriteResult}
                />

                {/* Grammar Analysis Result */}
                {grammarResult && (
                  <AnalysisResult 
                    analysis={grammarResult} 
                    quickRewriteState={quickRewriteState}
                    onQuickRewrite={handleQuickRewrite}
                    onStopQuickRewrite={handleStopQuickRewrite}
                  />
                )}

                {/* Rewrite Result */}
                {rewriteResult && (
                  <RewriteResult 
                    analysis={rewriteResult}
                  />
                )}
              </div>
            ) : (
              // Empty Study View
              <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-t-muted">
                 {/* Placeholder for future Study mode content */}
              </div>
            )}
          </>
        ) : (
          <Profile 
            colorScheme={colorScheme} 
            onColorSchemeChange={setColorScheme}
            historyUpdateTrigger={historyUpdateTrigger}
          />
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;
