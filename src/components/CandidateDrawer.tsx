import React, { useState, useEffect } from 'react';

import { updateApplication } from '../services/db';

/**
 * CandidateDrawer component
 * A slide-in panel containing detailed application forms organized by tabs.
 */
interface CandidateDrawerProps {
  application: any;
  candidate: any;
  onClose: () => void;
  onSave: () => void; // Triggered after successful save
}

type TabType = 'Overview' | 'Notes' | 'Interview' | 'Offer';

const STAGES = ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ application, candidate, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [formData, setFormData] = useState({
    stage: application?.stage || 'New',
    owner: application?.owner || '',
    priority: application?.priority || 'Standard',
    nextStep: application?.nextStep || '',
    tags: application?.tags || '',
    notes: application?.notes || '',
    interviewDate: application?.interview?.date || '',
    interviewLink: application?.interview?.link || '',
    interviewStatus: application?.interview?.status || 'Scheduled',
    offerValue: application?.offer?.value || '',
    offerType: application?.offer?.type || 'Full-time'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state with props when application changes
  useEffect(() => {
    if (application) {
       setFormData({
        stage: application.stage || 'New',
        owner: application.owner || '',
        priority: application.priority || 'Standard',
        nextStep: application.nextStep || '',
        tags: application.tags || '',
        notes: application.notes || '',
        interviewDate: application.interview?.date || '',
        interviewLink: application.interview?.link || '',
        interviewStatus: application.interview?.status || 'Scheduled',
        offerValue: application.offer?.value || '',
        offerType: application.offer?.type || 'Full-time'
      });
      setError('');
    }
  }, [application]);

  const handleSave = async () => {
    // Simple Validation
    if (!formData.owner.trim()) {
      setError('A candidate owner is required.');
      setActiveTab('Overview');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        stage: formData.stage,
        owner: formData.owner,
        priority: formData.priority,
        nextStep: formData.nextStep,
        tags: formData.tags,
        notes: formData.notes,
        interview: {
          date: formData.interviewDate,
          link: formData.interviewLink,
          status: formData.interviewStatus
        },
        offer: {
          value: formData.offerValue,
          type: formData.offerType
        }
      };

      await updateApplication(application.id, payload);
      onSave(); // Refresh parent state
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!application || !candidate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden focus:outline-none" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Slide-in Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined flex-shrink-0 !text-[28px]">person</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{candidate.fullName}</h2>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined flex-shrink-0 !text-[14px]">dashboard</span> {candidate.currentTitle || 'No Title'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
          >
            <span className="material-symbols-outlined flex-shrink-0 !text-[24px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-2 bg-white border-b border-slate-100">
          {(['Overview', 'Notes', 'Interview', 'Offer'] as TabType[]).map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative
                  ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                `}
              >
                {tab === 'Overview' && <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">dashboard</span>}
                {tab === 'Notes' && <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">description</span>}
                {tab === 'Interview' && <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">calendar_month</span>}
                {tab === 'Offer' && <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">attach_money</span>}
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_6px_rgba(37,99,235,0.3)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Form Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white no-scrollbar">
          
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold animate-shake">
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">error</span> {error}
            </div>
          )}

          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Current Stage</label>
                  <select 
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    value={formData.stage}
                    onChange={e => setFormData({...formData, stage: e.target.value})}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Candidate Owner</label>
                  <input 
                    type="text" 
                    placeholder="Search or enter owner..."
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    value={formData.owner}
                    onChange={e => setFormData({...formData, owner: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Priority Level</label>
                  <select 
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Standard">Standard</option>
                    <option value="High">High</option>
                    <option value="Block">Block</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Planned Next Step</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Follow up in 2 days..."
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    value={formData.nextStep}
                    onChange={e => setFormData({...formData, nextStep: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Labels / Tags</label>
                <input 
                  type="text" 
                  placeholder="e.g. referral, technical..."
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                />
              </div>
            </div>
          )}

          {activeTab === 'Notes' && (
            <div className="h-full space-y-2 flex flex-col">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Evaluation & Team Feedback</label>
              <textarea 
                className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 leading-relaxed placeholder:text-slate-300 focus:ring-0 focus:border-blue-500 outline-none transition-all resize-none min-h-[350px]"
                placeholder="Write interview summaries or internal comments here..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          )}

          {activeTab === 'Interview' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Schedule Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all"
                  value={formData.interviewDate}
                  onChange={e => setFormData({...formData, interviewDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Online Meeting Link</label>
                <input 
                  type="url" 
                  placeholder="https://zoom.us/j/..."
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-500 transition-all"
                  value={formData.interviewLink}
                  onChange={e => setFormData({...formData, interviewLink: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Interview Status</label>
                <select 
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all"
                  value={formData.interviewStatus}
                  onChange={e => setFormData({...formData, interviewStatus: e.target.value})}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'Offer' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Annual Basic Value ($)</label>
                <div className="relative">
                  <span className="material-symbols-outlined flex-shrink-0 !text-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">attach_money</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 150000"
                    className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-500 transition-all"
                    value={formData.offerValue}
                    onChange={e => setFormData({...formData, offerValue: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Role Commitment</label>
                <select 
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all"
                  value={formData.offerType}
                  onChange={e => setFormData({...formData, offerType: e.target.value})}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Project-based / Contract</option>
                  <option value="Internship">Internship / Grad Role</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 h-14 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 hover:scale-[1.02] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><span className="material-symbols-outlined flex-shrink-0 !text-[20px] group-hover:rotate-12 transition-transform">check</span> Save Progress</>
            )}
          </button>
          <button 
            onClick={onClose}
            className="px-8 h-14 border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-white hover:text-slate-700 hover:border-slate-300 transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDrawer;
