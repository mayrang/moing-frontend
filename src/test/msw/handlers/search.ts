import { http, HttpResponse } from 'msw';

const mockSearchResult = {
  resultType: 'SUCCESS',
  success: {
    content: [
      {
        travelNumber: 1,
        title: '유럽 여행',
        userName: '테스터',
        tags: ['유럽', '배낭여행'],
        location: '프랑스',
        maxPerson: 4,
        nowPerson: 2,
        bookmarked: false,
        createdAt: '2024-01-01T00:00:00',
        registerDue: '2024-12-31',
      },
    ],
    page: {
      number: 0,
      totalPages: 1,
      totalElements: 1,
    },
  },
  error: null,
};

export const searchHandlers = [
  http.get('/api/travels/search', () => {
    return HttpResponse.json(mockSearchResult);
  }),

  http.get('/api/autocomplete', ({ request }) => {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') ?? '';
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        suggestions: location
          ? [`${location}서울`, `${location}부산`, `${location}제주`]
          : [],
      },
      error: null,
    });
  }),
];
