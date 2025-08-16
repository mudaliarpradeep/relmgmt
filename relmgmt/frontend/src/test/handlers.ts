import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/test', () => {
    return HttpResponse.json({ message: 'Test response' })
  }),
  // Reports
  http.get('http://localhost:8080/api/v1/reports/allocation-conflicts', () => {
    return HttpResponse.json([
      {
        resourceId: 1,
        resourceName: 'Alice',
        weeklyConflicts: [
          { weekStarting: '2025-01-06', totalAllocation: 6.0, maxAllocation: 4.5, overAllocation: 1.5 },
        ],
      },
    ])
  }),
  http.get('http://localhost:8080/api/v1/reports/resource-utilization', () => {
    return HttpResponse.json([
      { resourceName: 'Alice', utilizationPct: 80 },
    ])
  }),
  http.get('http://localhost:8080/api/v1/reports/release-timeline', () => {
    return HttpResponse.json([
      { identifier: '2025-001', name: 'R25Q1', startDate: '2025-01-01', endDate: '2025-03-31' },
    ])
  }),
  http.get('http://localhost:8080/api/v1/reports/export', () => {
    return new HttpResponse(new Blob(['excel']), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  }),
  // Dashboard dependent endpoints
  http.get('http://localhost:8080/api/v1/resources', ({ request }) => {
    // Return minimal pageable shape
    return HttpResponse.json({ content: [], totalElements: 2, totalPages: 2, number: 0, size: 1 })
  }),
  http.get('http://localhost:8080/api/v1/releases/active', () => {
    return HttpResponse.json(3)
  }),
] 