import React, { useState, useMemo } from 'react';

import CandidateCard from './CandidateCard';
import { getAppState } from '../utils/pipelineUtils';

/**
 * PipelineBoard Component
 * Handles the visual Kanban board for recruitment stages.
 * Supports DND and Stage Validations.
 * Filtering state is managed by the parent page to support Export.
 */
interface PipelineBoardProps {
  applications: any[];
  filteredApplications: any[];
  candidatesMap: Record<string, any>;
  currentJobId?: string;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterOwner: string;
  setFilterOwner: (val: string) => void;
  onStageChange: (appId: string, newStage: string) => void;
  onCardClick: (app: any) => void;
  selectedAppId?: string;
}

const STAGES = ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

const PipelineBoard: React.FC<PipelineBoardProps> = ({
  filteredApplications,
  candidatesMap,
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  filterOwner,
  setFilterOwner,
  onStageChange,
  onCardClick,
  selectedAppId
}) => {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Validation Logic for DND
  const canMoveTo = (sourceStage: string, targetStage: string) => {
    if (sourceStage === targetStage) return false;
    if (['Hired', 'Rejected'].includes(sourceStage)) return false;
    return true;
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, appId: string, stage: string) => {
    e.dataTransfer.setData('appId', appId);
    e.dataTransfer.setData('sourceStage', stage);
    setDraggedAppId(appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    const sourceStage = e.dataTransfer.getData('sourceStage');

    if (canMoveTo(sourceStage, targetStage)) {
      onStageChange(appId, targetStage);
    }
    setDraggedAppId(null);
  };

  // Group filtered applications by stage
  const appsByStage = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    STAGES.forEach(s => grouped[s] = filteredApplications.filter(a => a.stage === s));
    return grouped;
  }, [filteredApplications]);

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Quick Filters Bar */}
      <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center transition-all">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search candidates by name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 whitespace-nowrap">
            <span className="material-symbols-outlined flex-shrink-0 !text-[14px] text-slate-500">filter_alt</span>
            <select 
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none border-none py-0.5"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Block">Block</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 whitespace-nowrap">
            <span className="material-symbols-outlined flex-shrink-0 !text-[14px] text-slate-500">person</span>
            <select 
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none border-none py-0.5"
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
            >
              <option value="All">All Owners</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 whitespace-nowrap">
            <span className="material-symbols-outlined flex-shrink-0 !text-[14px] text-slate-500">label</span>
            <span className="text-xs font-semibold text-slate-400">Tags...</span>
          </div>
        </div>
        
        {/* Mobile Scroll Hint */}
        <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50">
          <span className="material-symbols-outlined flex-shrink-0 !text-[14px] text-blue-400">swipe_left</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Vuốt ngang để xem các bước</span>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto select-none no-scrollbar">
        {STAGES.map(stage => {
          const appsInStage = appsByStage[stage] || [];
          return (
            <div 
              key={stage} 
              className="flex flex-col min-w-[280px] sm:min-w-[320px] w-[280px] sm:w-[320px] bg-slate-100/40 rounded-xl border border-slate-200/50"
              onDragOver={(e) => handleDragOver(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/40">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${
                    stage === 'Hired' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                    stage === 'Rejected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                  }`} />
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    {stage}
                  </h3>
                </div>
                <div className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md min-w-[24px] text-center">
                  {appsInStage.length}
                </div>
              </div>

              {/* Cards Drop Area */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[400px]">
                {appsInStage.map(app => {
                  const candidate = candidatesMap[app.candidateId];
                  if (!candidate) return null;
                  
                  return (
                    <div 
                      key={app.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, app.id, stage)}
                      onDragEnd={handleDragEnd}
                      className={`
                        transition-opacity duration-200 active:cursor-grabbing
                        ${draggedAppId === app.id ? 'opacity-40' : 'opacity-100'}
                      `}
                    >
                      {(() => {
                        const { overdue, blocked } = getAppState(app);
                        return (
                          <CandidateCard 
                            fullName={candidate.fullName}
                            currentTitle={candidate.currentTitle}
                            fitScore={app.fitScore}
                            lastStageChangedAt={app.lastStageChangedAt || app.createdAt}
                            overdue={overdue}
                            blocked={blocked}
                            priority={app.priority}
                            selected={selectedAppId === app.id}
                            onClick={() => onCardClick({ ...app, candidate })}
                          />
                        );
                      })()}
                    </div>
                  );
                })}
                
                {appsInStage.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/40 rounded-xl m-1">
                    <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-slate-200 mb-2">dashboard</span>
                    <span className="text-[10px] text-slate-300 font-medium italic">Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;
