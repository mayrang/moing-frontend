import { http, HttpResponse } from 'msw';

const mockTripDetail = {
  travelNumber: 1,
  title: '유럽 배낭여행',
  location: '프랑스',
  locationName: '파리',
  details: '즐거운 유럽 여행입니다.',
  maxPerson: 4,
  nowPerson: 2,
  genderType: '모두',
  startDate: '2024-06-01',
  endDate: '2024-06-10',
  dueDate: '2024-05-31',
  periodType: 'WEEK',
  tags: ['유럽', '배낭여행'],
  completionStatus: false,
  bookmarkCount: 5,
  viewCount: 100,
  enrollCount: 3,
  hostUserCheck: false,
  enrollmentNumber: null,
  bookmarked: false,
  userName: '테스터',
  userNumber: 1,
  profileUrl: null,
  applySuccess: false,
};

export const tripDetailHandlers = [
  http.get('/api/travel/detail/:travelNumber', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: mockTripDetail,
      error: null,
    });
  }),

  http.get('/api/travel/:travelNumber/enrollmentCount', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { count: 2 },
      error: null,
    });
  }),

  http.get('/api/travel/:travelNumber/companions', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        companions: [
          { userNumber: 1, userName: '테스터', ageGroup: '20대' },
        ],
      },
      error: null,
    });
  }),

  http.put('/api/travel/:travelNumber', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { travelNumber: 1 },
      error: null,
    });
  }),

  http.delete('/api/travel/:travelNumber', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
