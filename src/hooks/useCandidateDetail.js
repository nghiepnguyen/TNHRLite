import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCandidate, 
  updateCandidate, 
  getJobs, 
  createApplication, 
  deleteCandidate, 
  getApplicationsByCandidate, 
  logActivity 
} from '../services/db';
import { compareCandidateToJob } from '../services/ai';

export function useCandidateDetail(id, workspaceId, userProfile) {
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [linkedApplications, setLinkedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [linking, setLinking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!workspaceId || !id) return;
      try {
        const [dbCandidate, activeJobs, dbApps] = await Promise.all([
          getCandidate(id, workspaceId),
          getJobs(workspaceId),
          getApplicationsByCandidate(workspaceId, id)
        ]);

        if (dbCandidate) {
          setCandidate(dbCandidate);
        }

        setAllJobs(activeJobs);
        setJobs(activeJobs.filter(j => j.status === 'Active'));
        setLinkedApplications(dbApps);
      } catch (error) {
        console.error("Error fetching candidate detail data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, workspaceId]);

  const handleSaveNotes = async (notes) => {
    setSavingNotes(true);
    try {
      await updateCandidate(id, { recruiterNotes: notes });
      
      if (workspaceId && userProfile) {
        await logActivity(workspaceId, userProfile, 'NOTE_ADDED', {
          type: 'candidate',
          id: id,
          name: candidate?.fullName
        });
      }
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: e };
    } finally {
      setSavingNotes(false);
    }
  };

  const handleLinkToJob = async (selectedJobId) => {
    if (!selectedJobId) return { success: false, error: 'NO_JOB_SELECTED' };
    setLinking(true);
    try {
      const targetJob = jobs.find(j => j.id === selectedJobId);
      const aiResults = await compareCandidateToJob(workspaceId, candidate, targetJob);

      await createApplication(workspaceId, {
        candidateId: id,
        jobId: selectedJobId,
        fitScore: aiResults.fitScore || 0,
        strengths: aiResults.strengths || [],
        gaps: aiResults.gaps || [],
        aiSummary: aiResults.aiSummary || '',
      });
      
      if (workspaceId && userProfile) {
        await logActivity(workspaceId, userProfile, 'APPLICATION_CREATED', {
          type: 'candidate',
          id: id,
          name: candidate?.fullName
        }, {
          jobId: selectedJobId,
          jobTitle: targetJob?.title
        });
      }
      
      const updatedApps = await getApplicationsByCandidate(workspaceId, id);
      setLinkedApplications(updatedApps);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    } finally {
      setLinking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCandidate(id);
      navigate(`/dashboard/w/${workspaceId}/candidates`);
      return { success: true };
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
      return { success: false, error };
    }
  };

  return {
    candidate,
    jobs,
    allJobs,
    linkedApplications,
    loading,
    savingNotes,
    linking,
    isDeleting,
    handleSaveNotes,
    handleLinkToJob,
    handleDelete
  };
}
