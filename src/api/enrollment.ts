// entities/enrollment로 이전됨 — 하위 호환을 위해 re-export 유지
export {
  postEnrollment,
  cancelEnrollment,
  getEnrollments,
  getLastViewed,
  putLastViewed,
  rejectEnrollment,
  acceptEnrollment,
} from '@/entities/enrollment';
