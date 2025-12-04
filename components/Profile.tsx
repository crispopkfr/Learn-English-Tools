
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { HistoryEntry, UserStats, AppColor } from '../types';
import { getHistory, getStats, exportHistoryJSON, importHistoryJSON } from '../services/storageService';
import { t } from '../services/translations';

interface ProfileProps {
  colorScheme: AppColor;
  onColorSchemeChange: (color: AppColor) => void;
  historyUpdateTrigger: number;
}

export const Profile: React.FC<ProfileProps> = ({ colorScheme, onColorSchemeChange, historyUpdateTrigger }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expansionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = t.profile;

  useEffect(() => {
    loadData();
    return () => {
      if (expansionTimerRef.current) clearTimeout(expansionTimerRef.current);
    };
  }, [historyUpdateTrigger]); // Reload when trigger changes

  const loadData = () => {
    setStats(getStats());
    setHistory(getHistory());
  };

  const handleBackup = () => {
    exportHistoryJSON();
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importHistoryJSON(file);
      if (success) {
        loadData();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert('Failed to import history. Invalid file format.');
      }
    }
  };

  const handleRowClick = (id: string) => {
    if (expansionTimerRef.current) {
      clearTimeout(expansionTimerRef.current);
    }
    
    // If clicking already expanded, just reset timer
    setExpandedId(id);

    expansionTimerRef.current = setTimeout(() => {
      setExpandedId(null);
    }, 3000);
  };

  const formatDate = (timestamp: number) => {
    // Always English locale
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(timestamp));
  };

  // Activity Calendar Logic
  const activityWeeks = useMemo(() => {
    // Map date string (YYYY-MM-DD) to count
    const activityMap = new Map<string, number>();
    
    // Helper to get local YYYY-MM-DD string
    const toLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    history.forEach(entry => {
        const d = new Date(entry.timestamp);
        const dateStr = toLocalDateString(d);
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
    });

    const weeks = [];
    const weeksToShow = 52;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    // Find the Sunday of the CURRENT week to anchor the end of the graph
    const currentWeekSunday = new Date(today);
    currentWeekSunday.setDate(today.getDate() - today.getDay()); // Go back to Sunday
    
    // Calculate Start Date: Go back 51 weeks from the current week's Sunday
    const startDate = new Date(currentWeekSunday);
    startDate.setDate(startDate.getDate() - ((weeksToShow - 1) * 7));
    
    const loopDate = new Date(startDate);

    for (let w = 0; w < weeksToShow; w++) {
        const weekDays = [];
        for (let d = 0; d < 7; d++) {
            const dateStr = toLocalDateString(loopDate);
            
            // Check if future: compare timestamps at 00:00:00
            const isFuture = loopDate.getTime() > today.getTime();
            
            // Format for tooltip
            const tooltipDate = new Intl.DateTimeFormat('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }).format(loopDate);

            weekDays.push({
                date: dateStr,
                tooltip: tooltipDate,
                count: activityMap.get(dateStr) || 0,
                isFuture
            });
            
            // Increment day
            loopDate.setDate(loopDate.getDate() + 1);
        }
        weeks.push(weekDays);
    }
    
    return weeks;
  }, [history]);

  const getActivityColor = (count: number, _isFuture: boolean) => {
    // Show grid even for future days or empty days using a distinct visible grey
    if (count === 0) return 'bg-gray-300 dark:bg-gray-700';
    
    // Always one set color (blue) that changes only depending on the theme (light/dark shade)
    return 'bg-blue-600 dark:bg-blue-500';
  };

  const getResultBadge = (entry: HistoryEntry) => {
    if (entry.type === 'rewrite') {
      return (
        <div className="flex justify-center" title={`Rewrite: ${entry.rewriteStyle || 'Custom'}`}>
          <span className="block w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></span>
        </div>
      );
    }

    if (entry.isPerfect) {
      return (
        <div className="flex justify-center">
          <span className="block w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span>
        </div>
      );
    }
    if (entry.errorCount > 0) {
      return (
        <div className="flex justify-center">
          <span className="block w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></span>
        </div>
      );
    }
    return (
      <div className="flex justify-center">
        <span className="block w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"></span>
      </div>
    );
  };

  const colors: { code: AppColor, label: string, bgClass: string }[] = [
    { code: 'blue', label: 'Blue', bgClass: 'bg-blue-600' },
    { code: 'orange', label: 'Orange', bgClass: 'bg-orange-500' },
    { code: 'green', label: 'Green', bgClass: 'bg-green-600' },
    { code: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-600' },
    { code: 'rose', label: 'Rose', bgClass: 'bg-rose-500' },
    { code: 'red', label: 'Red', bgClass: 'bg-red-600' },
  ];

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      
      {/* Color Scheme Selector */}
      <div className="bg-t-surface p-4 rounded-2xl border border-t-border shadow-sm flex flex-col items-center justify-center gap-3">
         <h3 className="text-xs font-bold text-t-muted uppercase tracking-wider">{profile.colorScheme}</h3>
         <div className="flex items-center gap-4">
            {colors.map(color => (
                <button
                    key={color.code}
                    onClick={() => onColorSchemeChange(color.code)}
                    className={`
                        w-8 h-8 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                        ${color.bgClass}
                        ${colorScheme === color.code 
                            ? 'ring-4 ring-offset-2 ring-t-surface scale-110 shadow-md' 
                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }
                    `}
                    title={color.label}
                    aria-label={`Select ${color.label} theme`}
                />
            ))}
         </div>
      </div>

      {/* Activity Calendar */}
      <div className="bg-t-surface p-6 rounded-2xl border border-t-border shadow-sm flex flex-col items-center w-full">
        <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-3">
                <div className="text-t-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                    </svg>
                </div>
                <h3 className="text-sm font-bold text-t-muted uppercase tracking-wider">{profile.activity}</h3>
            </div>
            <span className="text-xs font-bold text-t-muted uppercase tracking-wider px-3 py-1">
                {profile.yearly}
            </span>
        </div>
        
        {/* Responsive Grid - Using Flexbox to fit weeks in available width */}
        <div className="w-full flex gap-[2px]">
            {activityWeeks.map((week, wIndex) => (
                <div key={wIndex} className="flex-1 flex flex-col gap-[2px]">
                    {week.map((day) => (
                        <div 
                            key={day.date}
                            className={`w-full aspect-square rounded-[1px] transition-colors duration-200 ${getActivityColor(day.count, day.isFuture)}`}
                            title={`${day.tooltip}: ${day.count} activities`}
                        />
                    ))}
                </div>
            ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Accuracy */}
        <div className="bg-t-surface p-6 rounded-2xl border border-t-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-t-muted uppercase tracking-wider">{profile.accuracyRate}</h3>
          </div>
          <div className="text-4xl font-serif text-t-text">
            {stats.accuracyRate}%
          </div>
          <p className="text-xs text-t-muted mt-1">{profile.accuracyDesc}</p>
        </div>

        {/* Card 2: Total Checks */}
        <div className="bg-t-surface p-6 rounded-2xl border border-t-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-t-muted uppercase tracking-wider">{profile.totalChecks}</h3>
          </div>
          <div className="text-4xl font-serif text-t-text">
            {stats.totalChecks}
          </div>
          <p className="text-xs text-t-muted mt-1">{profile.checksDesc}</p>
        </div>

        {/* Card 3: Errors Found */}
        <div className="bg-t-surface p-6 rounded-2xl border border-t-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-t-muted uppercase tracking-wider">{profile.totalErrors}</h3>
          </div>
          <div className="text-4xl font-serif text-t-text">
            {stats.totalErrors}
          </div>
          <p className="text-xs text-t-muted mt-1">{profile.errorsDesc}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-t-surface rounded-2xl border border-t-border overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-t-border flex justify-between items-center">
          <h3 className="font-bold text-t-text">{profile.recentHistory}</h3>
          <span className="text-xs text-t-muted">{history.length} {profile.entries}</span>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center text-t-muted">
            <p>{profile.noHistory}</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[23rem] scrollbar-thin scrollbar-thumb-t-border scrollbar-track-transparent">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-t-surface-alt text-xs text-t-muted uppercase tracking-wider border-b border-t-border shadow-sm">
                  <th className="px-4 py-3 font-medium w-[20%] text-center whitespace-nowrap">{profile.cols.date}</th>
                  <th className="px-4 py-3 font-medium w-[50%] text-center whitespace-nowrap">{profile.cols.text}</th>
                  <th className="px-4 py-3 font-medium w-[30%] text-center whitespace-nowrap">{profile.cols.result}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-t-border bg-t-surface">
                {history.map((entry) => (
                  <tr 
                    key={entry.id} 
                    onClick={() => handleRowClick(entry.id)}
                    className={`hover:bg-t-surface-alt/30 transition-colors cursor-pointer ${entry.id === expandedId ? 'bg-t-surface-alt/20' : ''}`}
                  >
                    <td className="px-2 py-4 text-sm text-t-muted text-center align-middle whitespace-nowrap">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-2 py-4 text-sm text-t-text font-serif text-center align-middle transition-all duration-300">
                      <div className={`mx-auto transition-all duration-300 ${entry.id === expandedId ? 'whitespace-pre-wrap break-words w-full text-left' : 'truncate w-full text-center'}`}>
                         {entry.id === expandedId ? (entry.fullText || entry.textSnippet) : entry.textSnippet}
                      </div>
                    </td>
                    <td className="px-2 py-4 text-sm text-center align-middle">
                       {getResultBadge(entry)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Data Options Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Backup Card */}
        <button 
          onClick={handleBackup}
          className="bg-t-surface p-6 rounded-2xl border border-t-border shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
        >
          <div className="text-blue-500 bg-blue-500/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <span className="font-bold text-t-text text-sm uppercase tracking-wider">{profile.backup}</span>
        </button>

        {/* Restore Card */}
        <button 
          onClick={handleRestoreClick}
          className="bg-t-surface p-6 rounded-2xl border border-t-border shadow-sm hover:shadow-md hover:border-green-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
        >
           <div className="text-green-500 bg-green-500/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <span className="font-bold text-t-text text-sm uppercase tracking-wider">{profile.restore}</span>
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="application/json" 
          className="hidden" 
        />
      </div>

    </div>
  );
};
