// 회원가입 타입 (model/auth.ts)
export interface IRegisterEmail {
  email: string;
  password: string;
  name: string;
  gender: string;
  sessionToken: string;
  agegroup: string;
  preferredTags: string[];
}

export interface IRegisterGoogle {
  userNumber: number;
  gender: string;
  agegroup: string;
  social: 'google' | 'kakao';
  preferredTags: string[];
}

export interface IRegisterKakao {
  userNumber: number;
  gender: string;
  email: string;
  agegroup: string;
  social: 'google' | 'kakao';
  preferredTags: string[];
}

// 여행 기록 타입 (model/profile.ts)
type VisitLog = {
  countryName: string;
  visitDates: string[];
};

type InternationalLogs = {
  [region: string]: VisitLog[] | undefined;
};

type DomesticLog = {
  locationName: string;
  visitDates: string[];
};

export type TravelLog = {
  userNumber: number;
  visitedCountriesCount: number;
  internationalLogs: InternationalLogs;
  domesticLogs: DomesticLog[];
};
