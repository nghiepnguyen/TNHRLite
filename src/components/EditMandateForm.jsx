import React, { useState } from 'react';

import { updateJob } from '../services/db';
import { useToast } from '../contexts/ToastContext';


/**
 * EditMandateForm Component - Phase 6
 * A specialized form for updating mandate status, headcount, and deadlines.
 */
const EditMandateForm = ({ initialData, onSuccess, onClose }) => {
  const toast = useToast();
  
  // Calculate roles already filled
  const filledRoles = (initialData.totalRoles || 0) - (initialData.openRoles || 0);
  
  const [formData, setFormData] = useState({
    status: initialData.status || 'Active',
    deadline: initialData.deadline ? initialData.deadline.split('T')[0] : '',
    totalRoles: initialData.totalRoles || 1,
    workingMode: initialData.workingMode || 'On-site',
    salaryRange: initialData.salaryRange || '',
    hrContact: initialData.hrContact || '',
    note: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    const today = new Date().setHours(0, 0, 0, 0);
    const deadlineDate = new Date(formData.deadline).setHours(0, 0, 0, 0);

    if (formData.totalRoles < filledRoles) {
      newErrors.totalRoles = `Total roles cannot be less than filled roles (${filledRoles}).`;
    }

    if (formData.status === 'Active' && (!formData.deadline || deadlineDate < today)) {
      newErrors.deadline = "Deadline must be today or in the future for active mandates.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        totalRoles: parseInt(formData.totalRoles),
        // We omit 'note' if the backend doesn't expect it, or include it if needed
      };

      await updateJob(initialData.id, payload);
      
      const updatedMandate = {
        ...initialData,
        ...formData,
        openRoles: Math.max(0, formData.totalRoles - filledRoles)
      };

      toast({ type: 'success', message: 'Mandate updated successfully.' });
      onSuccess?.(updatedMandate);
    } catch (error) {
      console.error(error);
      toast({ type: 'error', message: 'Failed to update database.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalRoles' ? parseInt(value) || 0 : value
    }));
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="edit-form-container">
      <div className="form-header">
        <h3 className="form-title">Edit Mandate Settings</h3>
        <p className="form-subtitle">Update recruitment parameters for this role</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-mandate-form">
        <div className="form-grid">
          {/* Status Field */}
          <div className="form-group">
            <label className="form-label">Mandate Status</label>
            <div className="select-wrapper">
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="form-control"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Deadline Field */}
          <div className="form-group">
            <label className="form-label">Recruitment Deadline</label>
            <div className={`input-with-icon ${errors.deadline ? 'has-error' : ''}`}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px] input-icon">calendar_month</span>
              <input 
                type="date" 
                name="deadline" 
                value={formData.deadline} 
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            {errors.deadline && <span className="error-message">{errors.deadline}</span>}
          </div>

          {/* Total Roles Field */}
          <div className="form-group">
            <label className="form-label">Total Headcount (Roles)</label>
            <div className={`input-with-icon ${errors.totalRoles ? 'has-error' : ''}`}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px] input-icon">group</span>
              <input 
                type="number" 
                name="totalRoles" 
                value={formData.totalRoles} 
                onChange={handleChange}
                min={filledRoles}
                className="form-control"
                required
              />
            </div>
            <p className="field-hint">Current progress: {filledRoles} filled / {formData.totalRoles} total</p>
            {errors.totalRoles && <span className="error-message">{errors.totalRoles}</span>}
          </div>

          {/* Working Mode */}
          <div className="form-group">
            <label className="form-label">Working Mode</label>
            <div className="select-wrapper">
              <span className="input-icon-left"><span className="material-symbols-outlined flex-shrink-0 !text-[16px]">public</span></span>
              <select 
                name="workingMode" 
                value={formData.workingMode} 
                onChange={handleChange}
                className="form-control with-icon"
              >
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px] input-icon">payments</span>
              <input 
                type="text" 
                name="salaryRange" 
                value={formData.salaryRange} 
                onChange={handleChange}
                placeholder="e.g. $5,000 - $8,000"
                className="form-control"
              />
            </div>
          </div>

          {/* HR Contact */}
          <div className="form-group span-2">
            <label className="form-label">HR Contact Information</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px] input-icon">person</span>
              <input 
                type="text" 
                name="hrContact" 
                value={formData.hrContact} 
                onChange={handleChange}
                placeholder="Name, Email or Phone of the primary HR contact"
                className="form-control"
              />
            </div>
          </div>

          {/* Note Field */}
          <div className="form-group span-2">
            <label className="form-label">Internal Change Note</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px] input-icon top">description</span>
              <textarea 
                name="note" 
                value={formData.note} 
                onChange={handleChange}
                placeholder="Briefly describe the reason for this change (e.g., headcount expansion, budget delay)..."
                className="form-control textarea"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="spinner-loader"></span> Saving...</>
            ) : (
              <><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">save</span> Update Mandate</>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .edit-form-container {
          animation: slideIn 0.3s ease-out;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .form-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .edit-mandate-form .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .span-2 { grid-column: span 2; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .select-wrapper {
          position: relative;
        }

        .select-icon {
          display: none;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .input-icon.top {
          top: 1rem;
          transform: none;
        }

        .form-control {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          padding: 0.625rem 0.75rem 0.625rem 2.25rem;
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s;
        }

        .input-icon-left {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          z-index: 1;
        }

        .form-control.with-icon {
          padding-left: 2.25rem;
        }

        select.form-control {
          padding-left: 0.75rem;
          padding-right: 2.25rem;
        }

        .form-control:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.05);
          outline: none;
        }

        .textarea {
          resize: none;
          min-height: 80px;
        }

        .input-with-icon.has-error .form-control {
          border-color: var(--color-danger);
          background-color: #fef2f2;
        }

        .error-message {
          font-size: 0.75rem;
          color: var(--color-danger);
          font-weight: 500;
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .form-actions {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-surface-border);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .spinner-loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default EditMandateForm;
