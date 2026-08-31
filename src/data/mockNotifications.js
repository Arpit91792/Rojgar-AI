// DEVELOPMENT ONLY — Replace with API calls to /api/notifications before production

export const mockNotifications = [
      {
            id: 'notif-1',
            title: 'UPSC Prelims 2024 Admit Card Released',
            message: 'Admit cards are now available for download from the official website.',
            date: '2024-06-01',
            priority: 'high',
            status: 'PUBLISHED',
            createdAt: '2024-06-01T00:00:00.000Z',
      },
      {
            id: 'notif-2',
            title: 'SSC CGL Tier-I Result Expected Soon',
            message: 'Results are expected to be announced by end of this month.',
            date: '2024-06-14',
            priority: 'medium',
            status: 'PUBLISHED',
            createdAt: '2024-06-14T00:00:00.000Z',
      },
      {
            id: 'notif-3',
            title: 'New Government Job: 1000 Vacancies in Railways',
            message: 'Apply before the deadline for these exciting opportunities.',
            date: '2024-06-13',
            priority: 'high',
            status: 'PUBLISHED',
            createdAt: '2024-06-13T00:00:00.000Z',
      },
      {
            id: 'notif-4',
            title: 'Scholarship Application Deadline Extended',
            message: 'The scholarship application deadline has been extended by 15 days.',
            date: '2024-06-12',
            priority: 'medium',
            status: 'DRAFT',
            createdAt: '2024-06-12T00:00:00.000Z',
      },
]
