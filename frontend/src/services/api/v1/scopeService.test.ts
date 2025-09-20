import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScopeService from './scopeService';
import ComponentService from './componentService';
import apiClient from '../apiClient';
import type { ScopeItem, Component, ComponentRequest } from '../sharedTypes';

vi.mock('../apiClient');
const mockedApi = vi.mocked(apiClient);

const mockScopeItem = (id = 1): ScopeItem => ({
  id,
  releaseId: 5, // Changed from projectId to releaseId
  name: 'Build ETL Jobs',
  description: 'Talend jobs',
  functionalDesignDays: 5, // Added new fields
  sitDays: 3,
  uatDays: 2,
  components: [], // Changed from effortEstimates to components
  componentsCount: 0,
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
});

const mockComponent = (id = 1): Component => ({
  id,
  scopeItemId: 1,
  name: 'ETL Component',
  componentType: 'ETL' as import('../sharedTypes').ComponentTypeEnum,
  technicalDesignDays: 5,
  buildDays: 10,
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
});

describe('ScopeService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getScopeItemsByReleaseId should fetch items', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { content: [mockScopeItem()], totalElements: 1 } });
    const items = await ScopeService.getScopeItemsByReleaseId(5);
    expect(items.content).toHaveLength(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/releases/5/scope-items?page=0&size=20');
  });

  it('getScopeItem should fetch by id', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockScopeItem(2) });
    const item = await ScopeService.getScopeItem(2);
    expect(item.id).toBe(2);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/scope-items/2');
  });

  it('createScopeItem should POST and return item', async () => {
    const req = { 
      name: 'New', 
      description: 'desc',
      functionalDesignDays: 5,
      sitDays: 3,
      uatDays: 2,
      components: []
    };
    mockedApi.post.mockResolvedValueOnce({ data: { ...mockScopeItem(3), ...req } });
    const item = await ScopeService.createScopeItem(5, req);
    expect(item.id).toBe(3);
    expect(mockedApi.post).toHaveBeenCalledWith('/v1/releases/5/scope-items', req);
  });
});

describe('ComponentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createComponent should POST and return component', async () => {
    const req: ComponentRequest = {
      name: 'New Component',
      componentType: 'ETL' as import('../sharedTypes').ComponentTypeEnum,
      technicalDesignDays: 5,
      buildDays: 10
    };
    mockedApi.post.mockResolvedValueOnce({ data: mockComponent() });
    const res = await ComponentService.createComponent(1, req);
    expect(res.id).toBe(1);
    expect(mockedApi.post).toHaveBeenCalledWith('/v1/scope-items/1/components', req);
  });
});


