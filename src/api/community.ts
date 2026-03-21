// entities/community로 이전됨 — 하위 호환을 위해 re-export 유지
export {
  getCommunities,
  getMyCommunities,
  getCommunity,
  postCommunity,
  updateCommunity,
  deleteCommunity,
  likeCommunity,
  unlikeCommunity,
  getImages,
  uploadImage,
  updateImage,
  postImage,
} from '@/entities/community';
