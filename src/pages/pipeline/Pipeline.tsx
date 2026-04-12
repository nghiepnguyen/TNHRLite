import React, { useState, useEffect, useMemo } from 'react';
import { getJobs, getApplicationsByJob, getCandidates, updateApplicationStage } from '../../services/db';
import { Layers, Download } from 'lucide-react';
import PipelineBoard from '../../components/PipelineBoard';
import CandidateDrawer from '../../components/CandidateDrawer';
import { exportCandidatesToCSV } from '../../utils/exportUtils';

export default function Pipeline() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [candidatesMap, setCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Filter States (lifted from Board)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterOwner, setFilterOwner] = useState('All');

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError('');
        const activeJobs = await getJobs();
        setJobs(activeJobs.filter(j => j.status === 'Active'));

        const candidates = await getCandidates();
        const cMap = {};
        candidates.forEach(c => cMap[c.id] = c);
        setCandidatesMap(cMap);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to load initial data. Please check your connection or permissions.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchApps() {
      if (!selectedJob) {
        setApplications([]);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const apps = await getApplicationsByJob(selectedJob);
        setApplications(apps);
      } catch (err) {
        console.error('Fetch applications error:', err);
        setError('Failed to load applications for this job.');
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, [selectedJob]);

  // Derived Filtered Data
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const candidate = candidatesMap[app.candidateId];
      if (!candidate) return false;

      const matchesSearch = candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'All' || app.priority === filterPriority;
      const matchesOwner = filterOwner === 'All' || app.owner === filterOwner;

      return matchesSearch && matchesPriority && matchesOwner;
    });
  }, [applications, candidatesMap, searchTerm, filterPriority, filterOwner]);

  const handleStageChange = async (appId, newStage) => {
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, stage: newStage } : app));
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => ({ ...prev, stage: newStage }));
    }
    await updateApplicationStage(appId, newStage);
  };

  const handleExport = () => {
    const job = jobs.find(j => j.id === selectedJob);
    exportCandidatesToCSV(filteredApplications, candidatesMap, job?.title || 'Job');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header & Main Controls */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Pipeline</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Organize candidates by progressing their application stage.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label className="text-secondary" style={{ fontWeight: 500, fontSize: '0.875rem' }}>Job Mandate:</label>
            <select 
              className="form-control" 
              style={{ width: '220px' }}
              value={selectedJob} 
              onChange={e => { setSelectedJob(e.target.value); setSelectedApp(null); }}
            >
              <option value="">-- Choose job --</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>

          <button 
            onClick={handleExport}
            disabled={!selectedJob || filteredApplications.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!selectedJob && (
         <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Layers size={32} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <p className="text-secondary">Select an active job from the dropdown above to view its pipeline.</p>
         </div>
      )}

      {selectedJob && (
        <PipelineBoard 
          applications={applications}
          filteredApplications={filteredApplications}
          candidatesMap={candidatesMap}
          currentJobId={selectedJob}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterOwner={filterOwner}
          setFilterOwner={setFilterOwner}
          onStageChange={handleStageChange}
          onCardClick={setSelectedApp}
          selectedAppId={selectedApp?.id}
        />
      )}

      <CandidateDrawer 
        application={selectedApp}
        candidate={selectedApp?.candidate}
        onClose={() => setSelectedApp(null)}
        onSave={async () => {
          setSelectedApp(null);
          if (selectedJob) {
            const apps = await getApplicationsByJob(selectedJob);
            setApplications(apps);
          }
        }}
      />
    </div>
  );
}
