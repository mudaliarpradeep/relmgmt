import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ScopeService from '../../services/api/v1/scopeService';
import type { ScopeItemRequest } from '../../types';

const ScopeItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { id, projectId } = useParams();
  const isEdit = Boolean(id) && !projectId; // edit uses /scope/:id/edit, create uses /projects/:projectId/scope/new

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional().or(z.literal('')),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const item = await ScopeService.getScopeItem(Number(id));
          setValue('name', item.name);
          setValue('description', item.description || '');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load scope item');
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
        await ScopeService.updateScopeItem(Number(id), {
          name: form.name.trim(),
          description: form.description?.trim() || '',
        });
        navigate(`/scope/${id}`);
      } else if (projectId) {
        await ScopeService.createScopeItem(Number(projectId), {
          name: form.name.trim(),
          description: form.description?.trim() || '',
        });
        navigate(`/projects/${projectId}/scope`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save scope item');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    if (isEdit && id) navigate(`/scope/${id}`);
    else if (projectId) navigate(`/projects/${projectId}/scope`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h1 className="text-xl font-bold">{isEdit ? 'Edit Scope Item' : 'New Scope Item'}</h1>
          </div>
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Name</label>
              <input id="name" className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-300' : ''}`} placeholder="Scope item name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-700 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">Description</label>
              <textarea id="description" className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-300' : ''}`} placeholder="Optional description" {...register('description')} />
              {errors.description && <p className="text-sm text-red-700 mt-1">{errors.description.message}</p>}
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

export default ScopeItemForm;


