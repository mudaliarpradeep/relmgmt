import React, { useState } from 'react';
import { ComponentService } from '../../services/api/v1/componentService';

// Local type definitions to avoid import issues
const ComponentType = {
  ETL: 'ETL',
  FORGEROCK_IGA: 'FORGEROCK_IGA',
  FORGEROCK_UI: 'FORGEROCK_UI',
  FORGEROCK_IG: 'FORGEROCK_IG',
  FORGEROCK_IDM: 'FORGEROCK_IDM',
  SAILPOINT: 'SAILPOINT',
  FUNCTIONAL_TEST: 'FUNCTIONAL_TEST'
} as const;

type ComponentTypeEnum = typeof ComponentType[keyof typeof ComponentType];

interface Component {
  id: number;
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
  scopeItemId: number;
  effortEstimates?: any[];
  createdAt: string;
  updatedAt: string;
}

interface ComponentRequest {
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
}

interface ComponentTableProps {
  components: Component[];
  onAddComponent: (component: ComponentRequest) => void;
  onUpdateComponent: (id: number, component: ComponentRequest) => void;
  onDeleteComponent: (id: number) => void;
  disabled?: boolean;
}

interface ComponentRowData {
  id?: number;
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
  isNew?: boolean;
  isEditing?: boolean;
}

export const ComponentTable: React.FC<ComponentTableProps> = ({
  components,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  disabled = false
}) => {
  const [componentRows, setComponentRows] = useState<ComponentRowData[]>(
    components.map(comp => ({
      id: comp.id,
      name: comp.name,
      componentType: comp.componentType,
      technicalDesignDays: comp.technicalDesignDays,
      buildDays: comp.buildDays,
      isNew: false,
      isEditing: false
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const componentTypes = ComponentService.getComponentTypes();

  const getComponentTypeLabel = (componentTypeValue: ComponentTypeEnum): string => {
    const type = componentTypes.find(type => type.value === componentTypeValue);
    return type ? type.label : componentTypeValue;
  };

  const validateRow = (row: ComponentRowData, rowIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (!row.name || row.name.trim().length === 0) {
      newErrors[`name-${rowIndex}`] = 'Component name is required';
    } else if (row.name.length > 100) {
      newErrors[`name-${rowIndex}`] = 'Name must not exceed 100 characters';
    }

    if (!row.componentType) {
      newErrors[`type-${rowIndex}`] = 'Component type is required';
    }

    if (row.technicalDesignDays < 0 || row.technicalDesignDays > 1000) {
      newErrors[`techDesign-${rowIndex}`] = 'Must be between 0-1000 PD';
    }

    if (row.buildDays < 0 || row.buildDays > 1000) {
      newErrors[`build-${rowIndex}`] = 'Must be between 0-1000 PD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddComponent = () => {
    const newRow: ComponentRowData = {
      name: '',
      componentType: ComponentType.ETL as ComponentTypeEnum,
      technicalDesignDays: 0,
      buildDays: 0,
      isNew: true,
      isEditing: true
    };
    setComponentRows([...componentRows, newRow]);
  };

  const handleSaveComponent = (rowIndex: number) => {
    const row = componentRows[rowIndex];
    
    if (!validateRow(row, rowIndex)) {
      return;
    }

    const componentData: ComponentRequest = {
      name: row.name,
      componentType: row.componentType,
      technicalDesignDays: row.technicalDesignDays,
      buildDays: row.buildDays
    };

    if (row.isNew) {
      onAddComponent(componentData);
    } else if (row.id) {
      onUpdateComponent(row.id, componentData);
    }

    // Update local state
    const updatedRows = [...componentRows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      isNew: false,
      isEditing: false
    };
    setComponentRows(updatedRows);
  };

  const handleCancelEdit = (rowIndex: number) => {
    const row = componentRows[rowIndex];
    
    if (row.isNew) {
      // Remove the new row
      const updatedRows = componentRows.filter((_, index) => index !== rowIndex);
      setComponentRows(updatedRows);
    } else {
      // Reset to original values
      const originalComponent = components.find(comp => comp.id === row.id);
      if (originalComponent) {
        const updatedRows = [...componentRows];
        updatedRows[rowIndex] = {
          id: originalComponent.id,
          name: originalComponent.name,
          componentType: originalComponent.componentType,
          technicalDesignDays: originalComponent.technicalDesignDays,
          buildDays: originalComponent.buildDays,
          isNew: false,
          isEditing: false
        };
        setComponentRows(updatedRows);
      }
    }
    
    // Clear errors
    setErrors({});
  };

  const handleDeleteComponent = (rowIndex: number) => {
    const row = componentRows[rowIndex];
    if (row.id) {
      onDeleteComponent(row.id);
    } else if (row.isNew) {
      // Remove from local state
      const updatedRows = componentRows.filter((_, index) => index !== rowIndex);
      setComponentRows(updatedRows);
    }
  };

  const handleEditComponent = (rowIndex: number) => {
    const updatedRows = [...componentRows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      isEditing: true
    };
    setComponentRows(updatedRows);
  };

  const handleInputChange = (rowIndex: number, field: keyof ComponentRowData, value: any) => {
    const updatedRows = [...componentRows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value
    };
    setComponentRows(updatedRows);

    // Clear error for this field
    const errorKey = `${field}-${rowIndex}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const calculateTotalEffort = (row: ComponentRowData): number => {
    return row.technicalDesignDays + row.buildDays;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Components</h3>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddComponent}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Component
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Component Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technical Design (PD)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Build (PD)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total (PD)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {componentRows.map((row, index) => (
              <tr key={row.id || `new-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors[`name-${index}`] ? 'border-red-300' : ''
                        }`}
                        placeholder="Component name"
                        disabled={disabled}
                      />
                      {errors[`name-${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`name-${index}`]}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{row.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.isEditing ? (
                    <div>
                      <select
                        value={row.componentType}
                        onChange={(e) => handleInputChange(index, 'componentType', e.target.value as ComponentTypeEnum)}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors[`type-${index}`] ? 'border-red-300' : ''
                        }`}
                        disabled={disabled}
                      >
                        {componentTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors[`type-${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`type-${index}`]}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-900">{getComponentTypeLabel(row.componentType)}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.isEditing ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={row.technicalDesignDays}
                        onChange={(e) => handleInputChange(index, 'technicalDesignDays', Number(e.target.value))}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors[`techDesign-${index}`] ? 'border-red-300' : ''
                        }`}
                        disabled={disabled}
                      />
                      {errors[`techDesign-${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`techDesign-${index}`]}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-900">{row.technicalDesignDays}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.isEditing ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={row.buildDays}
                        onChange={(e) => handleInputChange(index, 'buildDays', Number(e.target.value))}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors[`build-${index}`] ? 'border-red-300' : ''
                        }`}
                        disabled={disabled}
                      />
                      {errors[`build-${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`build-${index}`]}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-900">{row.buildDays}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {calculateTotalEffort(row)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {!disabled && (
                    <div className="flex space-x-2">
                      {row.isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveComponent(index)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelEdit(index)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditComponent(index)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComponent(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {componentRows.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No components added yet. Click "Add Component" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ComponentTable;
