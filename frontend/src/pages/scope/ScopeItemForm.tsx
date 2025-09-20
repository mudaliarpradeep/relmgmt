import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ScopeService from '../../services/api/v1/scopeService';
import ComponentService from '../../services/api/v1/componentService';
import ComponentTable from '../../components/scope/ComponentTable';
import type { 
  ScopeItemRequest, 
  ScopeItem,
  Component,
  ComponentRequest
} from '../../types';

// Form schema for scope item with components
const scopeItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().or(z.literal('')),
  functionalDesignDays: z
    .number({ invalid_type_error: 'Functional design days must be a number' })
    .min(0, 'Must be at least 0 PD')
    .max(1000, 'Cannot exceed 1000 PD'),
  sitDays: z
    .number({ invalid_type_error: 'SIT days must be a number' })
    .min(0, 'Must be at least 0 PD')
    .max(1000, 'Cannot exceed 1000 PD'),
  uatDays: z
    .number({ invalid_type_error: 'UAT days must be a number' })
    .min(0, 'Must be at least 0 PD')
    .max(1000, 'Cannot exceed 1000 PD'),
});

type ScopeItemFormValues = z.infer<typeof scopeItemSchema>;

const ScopeItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { id, releaseId } = useParams();
  const isEdit = Boolean(id);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [scopeItem, setScopeItem] = useState<ScopeItem | null>(null);

  // Form for scope item
  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors } 
  } = useForm<ScopeItemFormValues>({
    resolver: zodResolver(scopeItemSchema),
    defaultValues: { 
      name: '', 
      description: '', 
      functionalDesignDays: 0,
      sitDays: 0,
      uatDays: 0
    },
  });

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const item = await ScopeService.getScopeItem(Number(id));
          setScopeItem(item);
          
          setValue('name', item.name);
          setValue('description', item.description || '');
          setValue('functionalDesignDays', item.functionalDesignDays);
          setValue('sitDays', item.sitDays);
          setValue('uatDays', item.uatDays);
          
          // Load components
          const componentList = await ComponentService.getComponentsByScopeItemId(Number(id));
          setComponents(componentList);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load scope item');
        } finally {
          setLoading(false);
        }
      }
    };

    load();
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: ScopeItemFormValues) => {
    if (components.length === 0) {
      setError('At least one component is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const scopeItemData: ScopeItemRequest = {
        name: data.name,
        description: data.description,
        functionalDesignDays: data.functionalDesignDays,
        sitDays: data.sitDays,
        uatDays: data.uatDays,
        components: components.map(comp => ({
          name: comp.name,
          componentType: comp.componentType,
          technicalDesignDays: comp.technicalDesignDays,
          buildDays: comp.buildDays
        }))
      };

      if (isEdit && id) {
        await ScopeService.updateScopeItem(Number(id), scopeItemData);
      } else if (releaseId) {
        await ScopeService.createScopeItem(Number(releaseId), scopeItemData);
      }

      navigate(-1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save scope item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComponent = async (component: ComponentRequest) => {
    if (!scopeItem?.id) {
      // For new scope items, just add to local state
      const newComponent: Component = {
        id: Date.now(), // Temporary ID for new components
        name: component.name,
        componentType: component.componentType,
        technicalDesignDays: component.technicalDesignDays,
        buildDays: component.buildDays,
        scopeItemId: 0, // Will be set when scope item is created
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setComponents([...components, newComponent]);
    } else {
      // For existing scope items, save to backend
      try {
        const newComponent = await ComponentService.createComponent(scopeItem.id, component);
        setComponents([...components, newComponent]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add component');
      }
    }
  };

  const handleUpdateComponent = async (id: number, component: ComponentRequest) => {
    try {
      const updatedComponent = await ComponentService.updateComponent(id, component);
      setComponents(components.map(comp => 
        comp.id === id ? updatedComponent : comp
      ));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update component');
    }
  };

  const handleDeleteComponent = async (id: number) => {
    try {
      await ComponentService.deleteComponent(id);
      setComponents(components.filter(comp => comp.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete component');
    }
  };

  const calculateTotalEffort = (): number => {
    const scopeItemEffort = (scopeItem?.functionalDesignDays || 0) + 
                           (scopeItem?.sitDays || 0) + 
                           (scopeItem?.uatDays || 0);
    
    const componentEffort = components.reduce((total, component) => {
      return total + component.technicalDesignDays + component.buildDays;
    }, 0);
    
    return scopeItemEffort + componentEffort;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Scope Item' : 'Create Scope Item'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update scope item details and components' : 'Add a new scope item with components'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Scope Item Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="Enter scope item name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : ''
                }`}
                placeholder="Enter description (optional)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Scope Item Level Effort */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scope Item Level Effort</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="functionalDesignDays" className="block text-sm font-medium text-gray-700">
                Functional Design (PD) *
              </label>
              <input
                type="number"
                id="functionalDesignDays"
                min="0"
                max="1000"
                {...register('functionalDesignDays', { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.functionalDesignDays ? 'border-red-300' : ''
                }`}
              />
              {errors.functionalDesignDays && (
                <p className="mt-1 text-sm text-red-600">{errors.functionalDesignDays.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="sitDays" className="block text-sm font-medium text-gray-700">
                SIT (PD) *
              </label>
              <input
                type="number"
                id="sitDays"
                min="0"
                max="1000"
                {...register('sitDays', { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.sitDays ? 'border-red-300' : ''
                }`}
              />
              {errors.sitDays && (
                <p className="mt-1 text-sm text-red-600">{errors.sitDays.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="uatDays" className="block text-sm font-medium text-gray-700">
                UAT (PD) *
              </label>
              <input
                type="number"
                id="uatDays"
                min="0"
                max="1000"
                {...register('uatDays', { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.uatDays ? 'border-red-300' : ''
                }`}
              />
              {errors.uatDays && (
                <p className="mt-1 text-sm text-red-600">{errors.uatDays.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="bg-white shadow rounded-lg p-6">
          <ComponentTable
            components={components}
            onAddComponent={handleAddComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            disabled={submitting}
          />
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Effort Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Scope Item Level:</span>
              <span className="ml-2 font-medium">
                {((scopeItem?.functionalDesignDays || 0) + (scopeItem?.sitDays || 0) + (scopeItem?.uatDays || 0))} PD
              </span>
            </div>
            <div>
              <span className="text-blue-700">Component Level:</span>
              <span className="ml-2 font-medium">
                {components.reduce((total, comp) => total + comp.technicalDesignDays + comp.buildDays, 0)} PD
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-blue-700 font-medium">Total Effort:</span>
              <span className="ml-2 font-bold text-lg">
                {calculateTotalEffort()} PD
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update Scope Item' : 'Create Scope Item')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScopeItemForm;


