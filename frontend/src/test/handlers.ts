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
          { weekStarting: '2025-01-06', totalAllocation: 6.0, standardLoad: 4.5, overAllocation: 1.5 },
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
  // Notifications
  http.get('http://localhost:8080/api/v1/notifications', () => {
    return HttpResponse.json({
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, unsorted: false, empty: false },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      totalElements: 0,
      totalPages: 0,
      last: true,
      size: 20,
      number: 0,
      sort: { sorted: true, unsorted: false, empty: false },
      numberOfElements: 0,
      first: true,
      empty: true,
    })
  }),
  http.put('http://localhost:8080/api/v1/notifications/:id/read', () => {
    return HttpResponse.json({});
  }),
  http.put('http://localhost:8080/api/v1/notifications/read-all', () => {
    return HttpResponse.json({});
  }),
  http.delete('http://localhost:8080/api/v1/notifications/:id', () => {
    return HttpResponse.json({});
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