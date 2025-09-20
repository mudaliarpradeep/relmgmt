import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ScopeService from '../../services/api/v1/scopeService';
import type { EffortEstimateRequest } from '../../types';
import { SkillFunction, ReleasePhase, getApplicableSubFunctions } from '../../types';

const EffortEstimationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // scope item id for adding estimates
  const scopeItemId = Number(id);

  const schema = z.object({
    skillFunction: z.enum(Object.values(SkillFunction) as [string, ...string[]]),
    skillSubFunction: z.string().optional(),
    phase: z.enum(Object.values(ReleasePhase) as [string, ...string[]]),
    effortDays: z
      .number({ invalid_type_error: 'Effort days must be a number' })
      .positive('Effort days must be positive'),
  }).refine((data) => {
    const applicable = getApplicableSubFunctions(data.skillFunction);
    if (applicable.length === 0) return !data.skillSubFunction;
    return !data.skillSubFunction || applicable.includes(data.skillSubFunction);
  }, { message: 'Invalid sub-function for selected skill function', path: ['skillSubFunction'] });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { skillFunction: SkillFunction.BUILD, phase: ReleasePhase.BUILD, effortDays: 1 },
  });

  const selectedSkillFunction = watch('skillFunction');

  const onSubmit = async (form: FormValues) => {
    try {
      await ScopeService.addEffortEstimates(scopeItemId, [form as EffortEstimateRequest]);
      navigate(`/scope/${scopeItemId}`);
    } catch (e) {
      if (e instanceof Error) {
        setError('effortDays', { type: 'manual', message: e.message });
      }
    }
  };

  const onCancel = () => navigate(`/scope/${scopeItemId}`);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h1 className="text-xl font-bold">Add Effort Estimate</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="skillFunction">Skill Function</label>
                <select id="skillFunction" className={`w-full border rounded px-3 py-2 ${errors.skillFunction ? 'border-red-300' : ''}`} {...register('skillFunction')}>
                  {Object.values(SkillFunction).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.skillFunction && <p className="text-sm text-red-700 mt-1">{errors.skillFunction.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="skillSubFunction">Skill Sub-function</label>
                <select id="skillSubFunction" className={`w-full border rounded px-3 py-2 ${errors.skillSubFunction ? 'border-red-300' : ''}`}
                  disabled={getApplicableSubFunctions(selectedSkillFunction as import('../../services/api/sharedTypes').SkillFunction).length === 0}
                  {...register('skillSubFunction')}>
                  {getApplicableSubFunctions(selectedSkillFunction as import('../../services/api/sharedTypes').SkillFunction).length === 0 ? (
                    <option value="">N/A</option>
                  ) : (
                    getApplicableSubFunctions(selectedSkillFunction as import('../../services/api/sharedTypes').SkillFunction).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  )}
                </select>
                {errors.skillSubFunction && <p className="text-sm text-red-700 mt-1">{errors.skillSubFunction.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phase">Phase</label>
                <select id="phase" className={`w-full border rounded px-3 py-2 ${errors.phase ? 'border-red-300' : ''}`} {...register('phase')}>
                  {Object.values(ReleasePhase).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.phase && <p className="text-sm text-red-700 mt-1">{errors.phase.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="effortDays">Effort Days</label>
              <input id="effortDays" type="number" min={0.5} step={0.5} className={`w-full border rounded px-3 py-2 ${errors.effortDays ? 'border-red-300' : ''}`}
                {...register('effortDays', { valueAsNumber: true })} />
              {errors.effortDays && <p className="text-sm text-red-700 mt-1">{errors.effortDays.message}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t pt-6">
              <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
              <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EffortEstimationForm;


