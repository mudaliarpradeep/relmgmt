import React, { useState, useEffect } from 'react';
import { ScopeService } from '../../services/api/v1/scopeService';
import { ReleaseEffortSummary, EffortPhase } from '../../types';
import { getComponentBadgeColor } from '../../types';

// Local type definitions to avoid import issues
type ComponentTypeKey = 'ETL' | 'FORGEROCK_IGA' | 'FORGEROCK_UI' | 'FORGEROCK_IG' | 'FORGEROCK_IDM' | 'SAILPOINT' | 'FUNCTIONAL_TEST';

interface EffortSummaryItem {
  componentType: string;
  phase: string;
  totalEffort: number;
}

interface EffortSummaryTableProps {
  releaseId: number;
}

export const EffortSummaryTable: React.FC<EffortSummaryTableProps> = ({ releaseId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [effortSummaries, setEffortSummaries] = useState<ReleaseEffortSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && effortSummaries.length === 0) {
      loadEffortSummary();
    }
  }, [isExpanded, releaseId]);

  const loadEffortSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaries = await ScopeService.getReleaseEffortSummary(releaseId);
      setEffortSummaries(summaries);
    } catch (err) {
      setError('Failed to load effort summary');
      console.error('Error loading effort summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Transform data into matrix format for display
  const getMatrixData = () => {
    const matrix: Record<string, Record<string, number>> = {};

    // Initialize matrix with all component types and phases
    const componentTypes = [
      'ETL',
      'FORGEROCK_IGA',
      'FORGEROCK_UI',
      'FORGEROCK_IG',
      'FORGEROCK_IDM',
      'SAILPOINT',
      'FUNCTIONAL_TEST'
    ];

    const phases = [
      'FUNCTIONAL_DESIGN',
      'TECHNICAL_DESIGN',
      'BUILD',
      'SIT',
      'UAT'
    ];

    // Initialize matrix with zeros
    componentTypes.forEach(componentType => {
      matrix[componentType] = {};
      phases.forEach(phase => {
        matrix[componentType][phase] = 0;
      });
    });

    // Populate matrix with actual data
    effortSummaries.forEach(summary => {
      if (matrix[summary.componentType] && matrix[summary.componentType][summary.phase] !== undefined) {
        matrix[summary.componentType][summary.phase] = summary.totalEffort;
      }
    });

    return { matrix, componentTypes, phases };
  };

  const getPhaseDisplayName = (phase: string): string => {
    const displayNames: Record<string, string> = {
      'FUNCTIONAL_DESIGN': 'Functional Design',
      'TECHNICAL_DESIGN': 'Technical Design',
      'BUILD': 'Build',
      'SIT': 'SIT',
      'UAT': 'UAT'
    };
    return displayNames[phase] || phase;
  };

  const getComponentDisplayName = (componentType: string): string => {
    const displayNames: Record<string, string> = {
      'ETL': 'ETL',
      'FORGEROCK_IGA': 'ForgeRock IGA',
      'FORGEROCK_UI': 'ForgeRock UI',
      'FORGEROCK_IG': 'ForgeRock IG',
      'FORGEROCK_IDM': 'ForgeRock IDM',
      'SAILPOINT': 'SailPoint',
      'FUNCTIONAL_TEST': 'Functional Test'
    };
    return displayNames[componentType] || componentType;
  };

  const { matrix, componentTypes, phases } = getMatrixData();

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold text-sm">∑</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Effort Summary</h3>
              <p className="text-sm text-gray-600">Total effort breakdown by component and phase</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading effort summary...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">⚠️ {error}</div>
              <button
                onClick={loadEffortSummary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component Type
                    </th>
                    {phases.map(phase => (
                      <th key={phase} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getPhaseDisplayName(phase)}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {componentTypes.map(componentType => {
                    const componentTotal = phases.reduce((sum, phase) => sum + (matrix[componentType]?.[phase] || 0), 0);
                    const hasEffort = componentTotal > 0;

                    if (!hasEffort) return null; // Skip components with no effort

                    return (
                      <tr key={componentType} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComponentBadgeColor(getComponentDisplayName(componentType))}`}>
                              {getComponentDisplayName(componentType)}
                            </span>
                          </div>
                        </td>
                        {phases.map(phase => (
                          <td key={phase} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {matrix[componentType]?.[phase] || 0} PD
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {componentTotal} PD
                        </td>
                      </tr>
                    );
                  })}
                  {/* Grand Total Row */}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      GRAND TOTAL
                    </td>
                    {phases.map(phase => {
                      const phaseTotal = componentTypes.reduce((sum, componentType) =>
                        sum + (matrix[componentType]?.[phase] || 0), 0
                      );
                      return (
                        <td key={phase} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {phaseTotal} PD
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {componentTypes.reduce((sum, componentType) =>
                        sum + phases.reduce((phaseSum, phase) => phaseSum + (matrix[componentType]?.[phase] || 0), 0), 0
                      )} PD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
