import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReleaseService from '../../services/api/v1/releaseService';
import type { Release, ReleaseRequest, ReleasePhaseRequest, ReleaseStatusEnum, ReleasePhaseEnum } from '../../services/api/sharedTypes';
import { ReleaseStatus, ReleasePhase, getPhaseDisplayName, getStatusDisplayName } from '../../services/api/sharedTypes';

interface FormData {
  name: string;
  identifier: string;
  description: string;
  status: ReleaseStatusEnum;
  phases: ReleasePhaseRequest[];
}

interface ValidationErrors {
  name?: string;
  identifier?: string;
  phases?: string;
}

const ReleaseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    identifier: '',
    description: '',
    status: ReleaseStatus.PLANNING,
    phases: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load release data for edit mode or get next identifier for create mode
  useEffect(() => {
    if (isEditMode && id) {
      loadRelease(parseInt(id));
    } else if (!isEditMode) {
      loadNextIdentifier();
    }
  }, [isEditMode, id]);

  const loadRelease = async (releaseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const release = await ReleaseService.getRelease(releaseId);
      setFormData({
        name: release.name,
        identifier: release.identifier,
        description: release.description || '',
        status: getStatusDisplayName(release.status),
        phases: release.phases?.map(phase => ({
          name: getPhaseDisplayName(phase.phaseType) as ReleasePhaseEnum,
          startDate: phase.startDate,
          endDate: phase.endDate
        })) || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load release');
    } finally {
      setLoading(false);
    }
  };

  const loadNextIdentifier = async () => {
    try {
      setLoading(true);
      setError(null);
      const nextIdentifier = await ReleaseService.getNextReleaseIdentifier();
      setFormData(prev => ({
        ...prev,
        identifier: nextIdentifier
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load next identifier');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Release name is required';
    }

    // Validate phases
    if (formData.phases.length === 0) {
      newErrors.phases = 'At least one phase is required';
    } else {
      // Check for duplicate phase types
      const phaseTypes = formData.phases.map(phase => phase.name);
      const uniquePhaseTypes = new Set(phaseTypes);
      if (phaseTypes.length !== uniquePhaseTypes.size) {
        newErrors.phases = 'Each phase type can only be used once';
      } else {
        // Check for overlapping dates - only Production Go-live cannot overlap with other phases
        for (let i = 0; i < formData.phases.length; i++) {
          for (let j = i + 1; j < formData.phases.length; j++) {
            const phase1 = formData.phases[i];
            const phase2 = formData.phases[j];
            
            // Only check overlaps if one of the phases is Production Go-live
            const isPhase1ProductionGoLive = phase1.name === ReleasePhase.PRODUCTION_GO_LIVE;
            const isPhase2ProductionGoLive = phase2.name === ReleasePhase.PRODUCTION_GO_LIVE;
            
            if ((isPhase1ProductionGoLive || isPhase2ProductionGoLive) && 
                phase1.startDate && phase1.endDate && phase2.startDate && phase2.endDate) {
              const start1 = new Date(phase1.startDate);
              const end1 = new Date(phase1.endDate);
              const start2 = new Date(phase2.startDate);
              const end2 = new Date(phase2.endDate);
              
              if (start1 < end2 && start2 < end1) {
                newErrors.phases = 'Production Go-live phase cannot overlap with other phases';
                break;
              }
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhaseChange = (index: number, field: keyof ReleasePhaseRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.map((phase, i) => 
        i === index ? { ...phase, [field]: value } : phase
      )
    }));
  };

  const addPhase = () => {
    setFormData(prev => {
      // Find the next available phase type
      const usedPhaseTypes = new Set(prev.phases.map(phase => phase.name));
      const allPhaseTypes = [
        ReleasePhase.FUNCTIONAL_DESIGN,
        ReleasePhase.TECHNICAL_DESIGN,
        ReleasePhase.BUILD,
        ReleasePhase.SIT,
        ReleasePhase.UAT,
        ReleasePhase.REGRESSION_TESTING,
        ReleasePhase.DATA_COMPARISON,
        ReleasePhase.SMOKE_TESTING,
        ReleasePhase.PRODUCTION_GO_LIVE
      ];
      const nextAvailablePhase = allPhaseTypes.find(phaseType => !usedPhaseTypes.has(phaseType)) || ReleasePhase.FUNCTIONAL_DESIGN;
      
      return {
        ...prev,
        phases: [...prev.phases, {
          name: nextAvailablePhase,
          startDate: '',
          endDate: ''
        }]
      };
    });
  };

  const removePhase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const releaseRequest: ReleaseRequest = {
        name: formData.name.trim(),
        identifier: isEditMode ? formData.identifier.trim() : undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        phases: formData.phases
      };

      if (isEditMode && id) {
        await ReleaseService.updateRelease(parseInt(id), releaseRequest);
      } else {
        await ReleaseService.createRelease(releaseRequest);
      }

      navigate('/releases');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save release');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/releases');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error && !isEditMode) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <div>Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Release' : 'Create New Release'}
            </h1>
            <p className="text-blue-100 mt-1">
              {isEditMode ? 'Update release information' : 'Create a new release entry'}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2">
                    Release Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter release name"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Identifier */}
                <div className="flex flex-col">
                  <label htmlFor="identifier" className="text-sm font-medium text-gray-700 mb-2">
                    Release Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    value={formData.identifier}
                    readOnly
                    className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-generated"
                  />
                  <p className="mt-1 text-sm text-gray-500">Auto-generated identifier</p>
                </div>

                {/* Description */}
                <div className="flex flex-col lg:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                    placeholder="Enter release description"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                  >
                    {Object.values(ReleaseStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Phases Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Release Phases</h3>
                <button
                  type="button"
                  onClick={addPhase}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Add Phase
                </button>
              </div>

              {errors.phases && <p className="mb-4 text-sm text-red-600">{errors.phases}</p>}

              <div className="space-y-4">
                {formData.phases.map((phase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Phase {index + 1}: {phase.name}</h4>
                      <button
                        type="button"
                        onClick={() => removePhase(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">Phase Name</label>
                        <select
                          value={phase.name}
                          onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                        >
                          {Object.values(ReleasePhase).map(phaseName => (
                            <option key={phaseName} value={phaseName}>{phaseName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={phase.startDate}
                          onChange={(e) => handlePhaseChange(index, 'startDate', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={phase.endDate}
                          onChange={(e) => handlePhaseChange(index, 'endDate', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.phases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No phases added yet. Click "Add Phase" to get started.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
              >
                {submitting ? 'Saving...' : (isEditMode ? 'Update Release' : 'Create Release')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReleaseForm; 