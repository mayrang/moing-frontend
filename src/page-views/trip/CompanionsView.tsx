"use client";
import BottomModal from "@/components/BottomModal";
import React, { useEffect, useState } from "react";
import Button from "@/components/designSystem/Buttons/Button";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";
import { tripDetailStore } from "@/store/client/tripDetailStore";
import useTripDetail from "@/hooks/tripDetail/useTripDetail";
import BoxLayoutTag from "@/components/designSystem/tag/BoxLayoutTag";
import { useParams, useRouter } from "next/navigation";

interface CompanionsViewProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
interface Companion {
  userNumber: number;
  userName: string;
  ageGroup: string;
  profileUrl: string;
}

export default function CompanionsView({ isOpen, setIsOpen }: CompanionsViewProps) {
  const handleCloseModal = () => {
    setIsOpen(false);
  };
  const duedateSubmitHandler = () => {
    setIsOpen(false);
    // zustand에 채용 인원 및 성별 저장 로직 필수.
  };
  const { travelNumber } = useParams<{ travelNumber: string }>();
  const router = useRouter();
  if (isNaN(parseInt(travelNumber))) {
    router.replace("/");
  }
  const { profileUrl, userName, userAgeGroup, nowPerson, maxPerson } = tripDetailStore();
  const { companions } = useTripDetail(parseInt(travelNumber));
  const allCompanions = (companions as any)?.data?.companions;
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 초기값 설정
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // resize 이벤트 핸들러
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);

    // 클린업
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // width가 390px 미만인 경우에도 버튼의 위치가 고정될 수 있도록. width값 조정.
  const newRightPosition = windowSize.width.toString() + "px";
  return (
    <>
      {isOpen && (
        <BottomModal
          initialHeight={windowSize.height <= 700 ? 75 : 65} // height 비율이 짧아 진다면 58%로 맞추기.
          closeModal={handleCloseModal}
        >
          <div className="pb-[calc(4.7svh+48px)]" style={{ marginTop: "6px" }}>
            <div style={{ padding: "0px 24px" }}>
              <div className="flex flex-col justify-center w-16">
                <div className="text-lg font-semibold leading-[25.2px] text-left flex items-center">주최자</div>

                <div>
                  <div>
                    <RoundedImage size={64} src={profileUrl} />
                  </div>
                  <div className="flex flex-col justify-center items-center mt-2">
                    <div className="text-base font-semibold leading-[19.09px] text-left text-[var(--color-text-base)] mb-1">{userName}</div>
                    <BoxLayoutTag
                      text={userAgeGroup}
                      addStyle={{
                        backgroundColor: "var(--color-keycolor-bg)",
                        color: "var(--color-keycolor)",
                        padding: "4px 10px 4px 10px",
                        height: "22px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full my-6 border border-[var(--color-muted4)]"></div>
              <div className="-mr-6">
                <div className="text-lg font-semibold leading-[25.2px] text-left flex items-center">
                  모집 인원{" "}
                  <p
                    style={{
                      marginLeft: "4px",
                      fontWeight: "500",
                      color: "var(--color-text-muted2)",
                    }}
                  >
                    ({nowPerson}/{maxPerson})
                  </p>
                </div>
                <div className="flex mt-4 pl-[6px] overflow-x-scroll no-scrollbar">
                  {allCompanions?.map((person: Companion) => (
                    <div key={person.userName} className="flex flex-col justify-center w-16" style={{ marginRight: "16px" }}>
                      <div>
                        <div>
                          <RoundedImage size={64} src={person?.profileUrl ? person?.profileUrl : ""} />
                        </div>
                        <div className="flex flex-col justify-center items-center mt-2">
                          <div className="text-base font-semibold leading-[19.09px] text-left text-[var(--color-text-base)] mb-1">{person.userName}</div>
                          <BoxLayoutTag
                            text={person.ageGroup}
                            addStyle={{
                              backgroundColor: "var(--color-keycolor-bg)",
                              color: "var(--color-keycolor)",
                              padding: "4px 10px 4px 10px",
                              height: "22px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            className="fixed bottom-[4.7svh] px-6 z-10"
            style={{ width: windowSize.width < 390 ? newRightPosition : "390px" }}
          >
            <div style={{ width: "100%" }}>
              <Button
                text="닫기"
                onClick={duedateSubmitHandler}
                addStyle={{
                  backgroundColor: "rgba(62, 141, 0, 1)",
                  color: "rgba(240, 240, 240, 1)",
                  boxShadow: "rgba(170, 170, 170, 0.1)",
                }}
              />
            </div>
          </div>
        </BottomModal>
      )}
    </>
  );
}
