import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScopeService from './scopeService';
import apiClient from '../apiClient';
import type { ScopeItem, EffortEstimate, EffortEstimateRequest } from '../../../types';

vi.mock('../apiClient');
const mockedApi = vi.mocked(apiClient);

const mockScopeItem = (id = 1): ScopeItem => ({
  id,
  projectId: 5,
  name: 'Build ETL Jobs',
  description: 'Talend jobs',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
});

const mockEstimate = (id = 1): EffortEstimate => ({
  id,
  scopeItemId: 1,
  skillFunction: 'Build' as any,
  phase: 'Build' as any,
  effortDays: 10,
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
});

describe('ScopeService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAllScopeItems should fetch items', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [mockScopeItem()] });
    const items = await ScopeService.getAllScopeItems(5);
    expect(items).toHaveLength(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/projects/5/scope/all');
  });

  it('getScopeItem should fetch by id', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockScopeItem(2) });
    const item = await ScopeService.getScopeItem(2);
    expect(item.id).toBe(2);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/scope/2');
  });

  it('createScopeItem should POST and return item', async () => {
    const req = { name: 'New', description: 'desc' };
    mockedApi.post.mockResolvedValueOnce({ data: { ...mockScopeItem(3), ...req } });
    const item = await ScopeService.createScopeItem(5, req);
    expect(item.id).toBe(3);
    expect(mockedApi.post).toHaveBeenCalledWith('/v1/projects/5/scope', req);
  });

  it('addEffortEstimates should POST and return estimates', async () => {
    const req: EffortEstimateRequest[] = [
      { skillFunction: 'Build' as any, phase: 'Build' as any, effortDays: 5 },
    ];
    mockedApi.post.mockResolvedValueOnce({ data: [mockEstimate()] });
    const res = await ScopeService.addEffortEstimates(1, req);
    expect(res).toHaveLength(1);
    expect(mockedApi.post).toHaveBeenCalledWith('/v1/scope/1/effort-estimates', expect.any(Array));
  });
});


