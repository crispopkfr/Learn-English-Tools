
import React, { useState, useEffect } from 'react';
import { t } from '../services/translations';
import { saveApiKey, getStoredApiKey, removeApiKey } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const settings = t.settings;

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setApiKey(stored || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setIsSaved(true);
      setTimeout(() => {
          setIsSaved(false);
          onClose();
      }, 1000);
    }
  };

  const handleRemove = () => {
    removeApiKey();
    setApiKey('');
    setIsSaved(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-t-surface w-full max-w-md rounded-2xl shadow-xl border border-t-border overflow-hidden transform transition-all animate-scale-in">
        <div className="px-6 py-4 border-b border-t-border flex justify-between items-center bg-t-surface-alt">
          <h2 className="text-lg font-bold text-t-text flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-t-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {settings.title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-t-muted hover:text-t-text transition-colors p-1 rounded-full hover:bg-t-surface"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-t-muted leading-relaxed">
            {settings.desc}
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-t-text uppercase tracking-wider block">
              {settings.inputLabel}
            </label>
            <div className="relative">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                        setApiKey(e.target.value);
                        setIsSaved(false);
                    }}
                    placeholder={settings.placeholder}
                    className="w-full px-4 py-3 bg-t-surface border border-t-border rounded-lg text-t-text focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                />
            </div>
            
            <div className="flex justify-between items-center pt-1">
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 hover:underline"
                >
                    {settings.getKey}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 18H4.25A2.25 2.25 0 012 15.75V6.25A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                    </svg>
                </a>
            </div>
          </div>

          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
             <p className="text-xs text-blue-600/80">
                {settings.note}
             </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                    ${isSaved 
                        ? 'bg-green-500 text-white' 
                        : 'bg-t-text text-t-surface hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                    }
                `}
            >
                {isSaved ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                             <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {settings.saved}
                    </>
                ) : settings.save}
            </button>
            
            {getStoredApiKey() && (
                <button
                    onClick={handleRemove}
                    className="px-4 py-2.5 rounded-lg font-medium text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    {settings.remove}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
