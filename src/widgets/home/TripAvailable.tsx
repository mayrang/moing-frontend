"use client";
import TitleContainer from "@/widgets/home/ContentTitleContainer";
import { useTripList } from "@/hooks/useTripList";
import HorizonBoxLayout from "@/components/HorizonBoxLayout";
import dayjs from "dayjs";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from "next/dynamic";

const ThreeRowCarousel = dynamic(() => import("@/components/ThreeRowCarousel"), {
  ssr: false,
  loading: () => <div className="h-[270px]" />,
});
import { IMyTripList } from "@/model/myTrip";
import { daysAgo } from "@/utils/time";
import { useRouter } from "next/navigation";
import { useBackPathStore } from "@/store/client/backPathStore";

const TripAvailable = () => {
  const { data } = useTripList("recent");
  const router = useRouter();
  const { setTravelDetail } = useBackPathStore();
  const trips = (data?.pages[0].content as IMyTripList["content"]) ?? [];
  const cutTrips = trips?.length > 9 ? trips.slice(0, 9) : trips;
  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/`);

    router.push(`/trip/detail/${travelNumber}`);
  };

  return (
    <div className="mt-8 w-full">
      <TitleContainer
        detailLink={`/trip/list?sort=recent`}
        linkText="참가 가능한 여행 "
        text={
          <>
            지금 참가 가능한 <br /> 여행을 소개해요.
          </>
        }
        minWidth="143px"
      />

      <ThreeRowCarousel>
        {cutTrips &&
          cutTrips?.map((post, idx) => {
            return (
              <div key={post.travelNumber}>
                <div
                  className=" h-[90px] box-content mx-4 py-[10px] border-amber-50"
                  style={
                    (idx + 1) % 3 === 0 || cutTrips.length === idx + 1
                      ? { borderBottom: 0 }
                      : {
                          borderBottomWidth: "1px",
                          borderBottomStyle: "solid",
                        }
                  }
                >
                  <div onClick={() => clickTrip(post.travelNumber)}>
                    <HorizonBoxLayout
                      travelNumber={post.travelNumber}
                      location={post.location}
                      bookmarked={post.bookmarked}
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
            );
          })}
      </ThreeRowCarousel>
    </div>
  );
};
export default TripAvailable;
