import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectService from './projectService';
import apiClient from '../apiClient';
import type { Project, ProjectRequest } from '../sharedTypes';

vi.mock('../apiClient');
const mockedApi = vi.mocked(apiClient);

const mockProject = (id = 1): Project => ({
  id,
  releaseId: 10,
  name: 'Core Platform',
  description: 'Platform uplift',
  type: 'Day 1',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
});

describe('ProjectService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAllProjects should fetch projects', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [mockProject()] });
    const projects = await ProjectService.getAllProjects(10);
    expect(projects).toHaveLength(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/releases/10/projects/all');
  });

  it('getProject should fetch by id', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockProject(2) });
    const project = await ProjectService.getProject(2);
    expect(project.id).toBe(2);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/projects/2');
  });

  it('createProject should POST and return project', async () => {
    const req: ProjectRequest = { name: 'New Project', description: 'desc', type: 'Day 1' };
    mockedApi.post.mockResolvedValueOnce({ data: { ...mockProject(3), ...req } });
    const project = await ProjectService.createProject(10, req);
    expect(project.id).toBe(3);
    expect(mockedApi.post).toHaveBeenCalledWith('/v1/releases/10/projects', {
      name: 'New Project',
      description: 'desc',
      type: 'DAY_1'
    });
  });

  it('updateProject should PUT and return project', async () => {
    const req: ProjectRequest = { name: 'Updated', description: 'desc', type: 'Day 2' };
    mockedApi.put.mockResolvedValueOnce({ data: { ...mockProject(1), ...req } });
    const project = await ProjectService.updateProject(1, req);
    expect(project.name).toBe('Updated');
    expect(project.type).toBe('Day 2');
    expect(mockedApi.put).toHaveBeenCalledWith('/v1/projects/1', {
      name: 'Updated',
      description: 'desc',
      type: 'DAY_2'
    });
  });

  it('deleteProject should DELETE', async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    await expect(ProjectService.deleteProject(1)).resolves.not.toThrow();
    expect(mockedApi.delete).toHaveBeenCalledWith('/v1/projects/1');
  });
});


