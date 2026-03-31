"use client";
import TitleContainer from "@/widgets/home/ContentTitleContainer";
import { useTripList } from "@/hooks/useTripList";
import ThreeRowCarousel from "@/components/ThreeRowCarousel";
import HorizonBoxLayout from "@/components/HorizonBoxLayout";
import dayjs from "dayjs";
import { IMyTripList } from "@/model/myTrip";
import { daysAgo } from "@/utils/time";
import { useRouter } from "next/navigation";
import { useBackPathStore } from "@/store/client/backPathStore";

const TripRecommendation = () => {
  const { data } = useTripList("recommend");
  const router = useRouter();
  const { setTravelDetail } = useBackPathStore();
  const trips = (data?.pages[0].content as IMyTripList["content"]) ?? [];
  const cutTrips = trips?.length > 9 ? trips.slice(0, 9) : trips;
  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/`);

    router.push(`/trip/detail/${travelNumber}`);
  };

  return (
    <div className="mt-8">
      <TitleContainer
        detailLink={`/trip/list?sort=recommend`}
        linkText="여행 추천"
        text={
          <>
            이런 여행은 <br /> 어떠세요?
          </>
        }
        minWidth="102px"
      />

      <ThreeRowCarousel>
        {cutTrips &&
          cutTrips?.map((post, idx) => (
            <div key={post.travelNumber}>
              <div
                className="border-[var(--color-muted4)] h-[90px] box-content mx-4 py-[10px]"
                style={
                  (idx + 1) % 3 === 0 || cutTrips.length === idx + 1
                    ? { borderBottom: 0 }
                    : { borderBottomWidth: "1px", borderBottomStyle: "solid" }
                }
              >
                <div onClick={() => clickTrip(post.travelNumber)}>
                  <HorizonBoxLayout
                    bookmarked={post.bookmarked}
                    location={post.location}
                    travelNumber={post.travelNumber}
                    showTag={false}
                    bookmarkPosition="middle"
                    userName={post.userName}
                    tags={post.tags}
                    daysAgo={daysAgo(post?.createdAt)}
                    daysLeft={dayjs(post.registerDue, "YYYY-MM-DD").diff(
                      dayjs().startOf("day"),
                      "day",
                    )}
                    title={post.title}
                    recruits={post.nowPerson}
                    total={post.maxPerson}
                  />
                </div>
              </div>
            </div>
          ))}
      </ThreeRowCarousel>
    </div>
  );
};
export default TripRecommendation;
