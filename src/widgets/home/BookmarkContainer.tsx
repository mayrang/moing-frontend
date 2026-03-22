"use client";
import { useRouter } from "next/navigation";
import { useBookmark } from "@/hooks/bookmark/useBookmark";
import TitleContainer from "@/widgets/home/ContentTitleContainer";
import { daysAgo } from "@/utils/time";
import HorizonBoxLayout from "@/components/HorizonBoxLayout";
import dayjs from "dayjs";
import { IMyTripList } from "@/model/myTrip";
import { isGuestUser } from "@/utils/user";
import { useBackPathStore } from "@/store/client/backPathStore";

const BookmarkContainer = () => {
  const router = useRouter();
  const { setTravelDetail } = useBackPathStore();
  const { data } = useBookmark();
  const bookmarks = data?.pages[0].content as IMyTripList["content"];

  const handleClickEmpty = () => {
    if (isGuestUser()) {
      router.push("/login");
    } else {
      router.push("/search/travel");
    }
  };

  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/`);

    router.push(`/trip/detail/${travelNumber}`);
  };

  return (
    <div className="mt-8">
      <TitleContainer text="즐겨찾기" detailLink="/myTrip" linkText="즐겨찾기" />
      <div>
        {/* Empty는 북마크 한 것이 없을 때,로그인 안할 때. 보여줄 div */}
        {bookmarks === undefined && (
          <div className="flex w-full p-4 bg-white rounded-[20px]">
            <div className="flex items-center">
              <img
                // 클릭시,여행 찾기 페이지로 이동 예정
                onClick={handleClickEmpty}
                className="h-[62px] w-[62px]"
                src="/images/bookmarkPlus.png"
                alt="여행 찾기 페이지 이동 이미지"
              />
              {isGuestUser() ? (
                <span
                  className="ml-4 font-normal leading-[22.4px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  로그인 후 여행을 즐겨찾기
                  <br /> 해보세요.
                </span>
              ) : (
                <span className="ml-4 font-normal leading-[22.4px]">
                  여행을 즐겨찾기 해보세요!
                </span>
              )}
            </div>
          </div>
        )}
        {bookmarks &&
          (bookmarks.length === 0 ? (
            <div className="flex w-full p-4 bg-white rounded-[20px]">
              <div className="flex items-center">
                <img
                  // 클릭시,여행 찾기 페이지로 이동 예정
                  onClick={() => router.push("/search/travel")}
                  className="h-[62px] w-[62px]"
                  src="/images/bookmarkPlus.png"
                  alt=""
                />
                <span className="ml-4 font-normal leading-[22.4px]">
                  여행을 즐겨찾기 해보세요!
                </span>
              </div>
            </div>
          ) : (
            <div className="flex -mr-6 overflow-x-auto scroll-smooth no-scrollbar">
              {bookmarks.map(
                (post, idx) =>
                  post.bookmarked && (
                    <div
                      className="flex min-w-[250px] items-center rounded-[20px] p-4 pt-[11px] bg-white mr-4"
                      onClick={() => clickTrip(post.travelNumber)}
                      key={idx}
                    >
                      <HorizonBoxLayout
                        isBookmark={bookmarks.length > 1}
                        bookmarked={post.bookmarked}
                        travelNumber={post.travelNumber}
                        bookmarkNeed={false}
                        isBar={true}
                        bookmarkPosition="top"
                        userName={post.userName}
                        location={post.location}
                        tags={post.tags}
                        daysAgo={daysAgo(post?.createdAt)}
                        daysLeft={dayjs(post.registerDue, "YYYY-MM-DD").diff(
                          dayjs().startOf("day"),
                          "day"
                        )}
                        title={post.title}
                        recruits={post.nowPerson}
                        total={post.maxPerson}
                      />
                    </div>
                  )
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
export default BookmarkContainer;
