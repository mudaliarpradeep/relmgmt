import apiClient from '../apiClient';
import type { AllocationConflictResponse } from './allocationService';

export enum ReportType {
  ALLOCATION_CONFLICTS = 'ALLOCATION_CONFLICTS',
  RESOURCE_UTILIZATION = 'RESOURCE_UTILIZATION',
  RELEASE_TIMELINE = 'RELEASE_TIMELINE',
}

class ReportService {
  async getAllocationConflictsReport(): Promise<AllocationConflictResponse[]> {
    const res = await apiClient.get<AllocationConflictResponse[]>('/v1/reports/allocation-conflicts');
    return res.data;
  }

  async getResourceUtilizationReport(params: { from?: string; to?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const res = await apiClient.get<any[]>(`/v1/reports/resource-utilization?${query.toString()}`);
    return res.data;
  }

  async getReleaseTimelineReport(params: { year?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year);
    const res = await apiClient.get<any[]>(`/v1/reports/release-timeline?${query.toString()}`);
    return res.data;
  }

  async exportReport(type: ReportType, params?: Record<string, string>): Promise<Blob> {
    const query = new URLSearchParams();
    query.append('type', type);
    if (params) {
      Object.entries(params).forEach(([k, v]) => query.append(k, v));
    }
    const res = await apiClient.get(`/v1/reports/export?${query.toString()}`, { responseType: 'blob' });
    return new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}

export default new ReportService();


