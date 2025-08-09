import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ProjectService from '../../services/api/v1/projectService';
import type { ProjectRequest } from '../../types';
import { ProjectType } from '../../types';

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id, releaseId } = useParams();
  const isEdit = Boolean(id) && !releaseId; // edit uses /projects/:id/edit, create uses /releases/:releaseId/projects/new

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Project name must not exceed 100 characters'),
    description: z.string().max(500, 'Project description must not exceed 500 characters').optional().or(z.literal('')),
    type: z.enum([ProjectType.DAY_1, ProjectType.DAY_2], { errorMap: () => ({ message: 'Type is required' }) }),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', type: ProjectType.DAY_1 },
  });

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const project = await ProjectService.getProject(Number(id));
          setValue('name', project.name);
          setValue('description', project.description || '');
          setValue('type', project.type);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load project');
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  const onSubmit = async (form: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      if (isEdit && id) {
        await ProjectService.updateProject(Number(id), {
          name: form.name.trim(),
          description: form.description?.trim() || '',
          type: form.type,
        });
        navigate(`/projects/${id}`);
      } else if (releaseId) {
        await ProjectService.createProject(Number(releaseId), {
          name: form.name.trim(),
          description: form.description?.trim() || '',
          type: form.type,
        });
        navigate(`/releases/${releaseId}/projects`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    if (isEdit && id) navigate(`/projects/${id}`);
    else if (releaseId) navigate(`/releases/${releaseId}/projects`);
    else navigate('/releases');
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h1 className="text-xl font-bold">{isEdit ? 'Edit Project' : 'New Project'}</h1>
          </div>
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Name</label>
              <input id="name" className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-300' : ''}`} placeholder="Project name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-700 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">Description</label>
              <textarea id="description" className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-300' : ''}`} placeholder="Optional description" {...register('description')} />
              {errors.description && <p className="text-sm text-red-700 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">Type</label>
              <select id="type" className={`w-full border rounded px-3 py-2 ${errors.type ? 'border-red-300' : ''}`} {...register('type')}>
                {Object.values(ProjectType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && <p className="text-sm text-red-700 mt-1">{errors.type.message}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t pt-6">
              <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;


