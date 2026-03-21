export interface IUserProfileInfo {
  name: string;
  userRegDate: string;
  preferredTags: string[];
  profileImageUrl: string;
  createdTravelCount: number;
  participatedTravelCount: number;
  travelDistance: number;
  visitedCountryCount: number;
  travelBadgeCount: number;
  recentlyReported: boolean;
  totalReportCount: number;
  recentReportCount: number;
  ageGroup: string;
}

export interface IUserRelatedTravel {
  travelNumber: number;
  title: string;
  location: string;
  userNumber: number;
  userName: string;
  tags: string[];
  nowPerson: number;
  maxPerson: number;
  createdAt: string;
  bookmarked: boolean;
}

interface Page {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface IUserRelatedTravelList {
  content: IUserRelatedTravel[];
  page: Page;
}
