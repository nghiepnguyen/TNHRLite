import React from 'react';
import { User, Brain, AlertCircle, Ban } from 'lucide-react';

/**
 * CandidateCard component for the recruitment pipeline.
 * Displays candidate summary info with status indicators.
 */
interface CandidateCardProps {
  fullName: string;
  currentTitle: string;
  fitScore: number;
  lastStageChangedAt?: any; // Firestore Timestamp
  overdue?: boolean;
  blocked?: boolean;
  priority?: string;
  onClick: () => void;
  selected?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  fullName,
  currentTitle,
  fitScore,
  lastStageChangedAt,
  overdue,
  blocked,
  priority,
  onClick,
  selected
}) => {
  // Calculate days in stage
  const getDaysInStage = () => {
    if (!lastStageChangedAt) return 0;
    // Handle both Firestore Timestamp (with toMillis()) and JS Date/number
    const lastDate = lastStageChangedAt.toMillis 
      ? lastStageChangedAt.toMillis() 
      : (lastStageChangedAt.seconds 
          ? lastStageChangedAt.seconds * 1000 
          : new Date(lastStageChangedAt).getTime());
    
    const diff = Date.now() - lastDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const days = getDaysInStage();
  const isBlocked = blocked || priority === 'Block';

  return (
    <div 
      onClick={onClick}
      className={`
        group relative p-4 mb-3 rounded-lg border cursor-pointer transition-all duration-200
        ${selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}
        ${isBlocked ? 'bg-red-50 border-red-200' : 'bg-white shadow-sm hover:shadow-md'}
      `}
    >
      {/* Blocked/Priority Indicator */}
      {isBlocked && (
        <div className="absolute top-2 right-2 text-red-500" title="Blocked or High Priority Action Required">
          <Ban size={14} />
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-1 mb-3">
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {fullName}
        </h4>
        <p className="text-xs text-slate-500 truncate">
          {currentTitle || 'No title specified'}
        </p>
      </div>

      {/* Footer / Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Fit Score Badge */}
          {fitScore > 0 && (
            <div className={`
              flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
              ${fitScore > 75 
                ? 'bg-emerald-100 text-emerald-700' 
                : fitScore > 50 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-slate-100 text-slate-600'}
            `}>
              <Brain size={10} />
              <span>{fitScore}% Match</span>
            </div>
          )}

          {/* Time in Stage Tracker */}
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <span className={overdue ? 'text-amber-600' : ''}>{days > 0 ? `${days}d` : 'Today'}</span>
            {overdue && (
              <AlertCircle size={12} className="text-amber-500 animate-pulse" />
            )}
          </div>
        </div>

        {/* Small Avatar/Icon */}
        <div className={`
          w-6 h-6 rounded-full flex items-center justify-center transition-colors
          ${selected ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
        `}>
          <User size={14} />
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
