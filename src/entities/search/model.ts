export interface IContent {
  travelNumber: number;
  title: string;
  summary: string;
  userNumber: number;
  createdAt: string;
  registerDue: string;
  postStatus: string;
  tags: string[];
  maxPerson: number;
  nowPerson: number;
  location: string;
  userName: string;
  bookmarked: boolean;
}

export interface ISearchData {
  content: IContent[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface Filters {
  tags: string[];
  location: string[];
  gender: string[];
  sorting: string;
  person: string[];
  period: string[];
}
