"use client";
import CommunityComment from "@/components/community/CommunityComment";
import CommunityPost from "@/components/community/CommunityPost";

const DetailCommunity = () => {
  return (
    <div className="px-6 bg-[#f5f5f5]">
      <CommunityPost />
      <CommunityComment />
    </div>
  );
};

export default DetailCommunity;
