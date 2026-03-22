"use client";
import Button from "@/components/designSystem/Buttons/Button";
import PlaceIcon from "@/components/icons/PlaceIcon";
import GoogleMap, { PoiMarkers } from "@/components/map/GoogleMap";
import KakaoMap from "@/components/map/KakaoMap";
import MapBottomModal from "@/components/MapBottomModal";
import Spacing from "@/components/Spacing";
import { createTripStore } from "@/store/client/createTripStore";
import { editTripStore } from "@/store/client/editTripStore";
import { tripPlanStore } from "@/store/client/tripPlanStore";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const SearchPlaceDetail = () => {
  const { placeId, planOrder } = useParams();
  const map = useMap();
  const [placeDetails, setPlaceDetails] = useState<{
    location: { lat: number; lng: number };
    name: string;
    address: string;
    region: string;
    type: string;
    openingHours: string;
  }>();
  const router = useRouter();
  const placesLib = useMapsLibrary("places");
  const [isClient, setIsClient] = useState(false);
  const { addIsChange } = tripPlanStore();
  const searchParams = useSearchParams();
  const paramsType = searchParams?.get("type") ?? "create";
  const travelNumber = searchParams?.get("travelNumber") ?? "";
  const { locationName, addPlans, plans } =
    paramsType === "create" ? createTripStore() : editTripStore();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let script: HTMLScriptElement | null = null;

    async function fetchPlacePredictions() {
      try {
        // @ts-ignore
        const { Place } = placesLib;
        const place = new Place({
          id: placeId,
          requestedLanguage: "ko",
        });

        await place.fetchFields({
          fields: [
            "displayName",
            "formattedAddress",
            "regularOpeningHours",
            "location",
            "primaryTypeDisplayName",
            "primaryType",
          ],
        });
        if (isMounted) {
          setPlaceDetails({
            name: place.displayName,
            address: place.formattedAddress,
            region: place.formattedAddress.split(" ")[1],
            type: place.primaryTypeDisplayName,
            openingHours: place.regularOpeningHours?.weekdayText || [],
            location: { lat: place.location.lat(), lng: place.location.lng() },
          });
        }
      } catch (error) {
        console.error("Error fetching place predictions:", error);
      }
    }

    if (locationName.mapType === "google") {
      fetchPlacePredictions();
    } else {
      script = document.createElement("script");
      script.async = true;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      document.head.appendChild(script);

      script.addEventListener("load", () => {
        window.kakao.maps.load(() => {
          function placesSearchCB(data, status) {
            if (!isMounted) return;

            if (status === window.kakao.maps.services.Status.OK) {
              setPlaceDetails({
                name: data[0].place_name,
                address:
                  data[0].address_name !== ""
                    ? data[0].address_name
                    : data[0].road_address_name,
                region: data[0].address_name.split(" ")[0],
                type: data[0].category_group_name,
                openingHours: "",
                location: { lat: Number(data[0].y), lng: Number(data[0].x) },
              });
            } else if (
              status === window.kakao.maps.services.Status.ZERO_RESULT
            ) {
              // zero result
            } else if (status === window.kakao.maps.services.Status.ERROR) {
              console.error("검색 결과 중 오류가 발생했습니다.");
            }
          }

          const ps = new window.kakao.maps.services.Places();
          const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
          ps.keywordSearch(
            decodeURIComponent(placeId as string),
            placesSearchCB
          );
        });
      });
    }

    return () => {
      isMounted = false;
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, [placeId, locationName.mapType, placesLib, map]);

  const handlePlans = () => {
    if (!planOrder) return;

    const targetPlanIndex = plans.findIndex(
      (plan) =>
        plan.planOrder ===
        (paramsType === "create" ? Number(planOrder) : Number(planOrder) + 1)
    );
    let newPlans: any[] = [];
    if (targetPlanIndex > -1) {
      newPlans = plans.map((plan) =>
        plan.planOrder ===
        (paramsType === "create" ? targetPlanIndex : targetPlanIndex + 1)
          ? {
              ...plan,
              spots: [
                ...plan.spots,
                {
                  id: uuidv4(),
                  name: placeDetails?.name,
                  category: placeDetails?.type,
                  region: placeDetails?.region,
                  latitude: placeDetails?.location.lat,
                  longitude: placeDetails?.location.lng,
                },
              ],
            }
          : { ...plan }
      );
    } else {
      newPlans = [
        ...plans,
        {
          planOrder:
            paramsType === "create" ? Number(planOrder) : Number(planOrder) + 1,
          spots: [
            {
              id: uuidv4(),
              name: placeDetails?.name,
              category: placeDetails?.type,
              region: placeDetails?.region,
              latitude: placeDetails?.location.lat,
              longitude: placeDetails?.location.lng,
            },
          ],
        },
      ];
    }
    addIsChange(true);
    addPlans(newPlans);
    if (paramsType === "create") {
      router.push("/create/trip/detail");
    } else {
      router.push(`/trip/edit/${travelNumber}`);
    }
  };

  if (typeof window === "undefined") {
    return <></>;
  }
  if (!isClient) {
    return null;
  }

  return (
    <>
      <div
        className="cursor-pointer fixed bg-white z-[1004] top-[52px] left-6 w-12 h-12 rounded-full flex shadow-[-2px_3px_5px_rgba(106,97,73,0.1)] items-center justify-center"
        onClick={() => router.back()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7782 2.22202L2.22183 17.7784M17.7782 17.7784L2.22183 2.22202"
            stroke="#1A1A1A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="w-full h-[calc(100svh-116px)]">
        {placeDetails?.location.lat &&
          (locationName.mapType === "google" ? (
            <GoogleMap
              zoom={17}
              lat={(placeDetails?.location.lat - 0.0015) as number}
              lng={placeDetails?.location.lng as number}
            >
              {placeDetails?.location && (
                <PoiMarkers
                  pois={[
                    {
                      key: (placeId as string) || "",
                      location: placeDetails?.location,
                    },
                  ]}
                />
              )}
            </GoogleMap>
          ) : (
            <KakaoMap
              positions={[
                {
                  lat: placeDetails?.location.lat,
                  lng: placeDetails?.location.lng,
                },
              ]}
              lat={placeDetails?.location.lat - 0.013}
              lng={placeDetails?.location.lng}
              zoom={6}
            />
          ))}
      </div>
      <MapBottomModal initialHeight={400}>
        <div className="flex flex-col h-full relative overflow-hidden">
          <div className="grow overflow-y-auto px-5 mt-[45px] pb-[104px] no-scrollbar">
            <div className="h-12 flex items-center pl-1 gap-2">
              <div className="leading-6 font-semibold text-xl text-[var(--color-text-base)]">{placeDetails?.name}</div>
              <div className="leading-[17px] text-sm font-normal text-[var(--color-text-muted)]">
                {placeDetails?.type}ㆍ{placeDetails?.region}
              </div>
            </div>
            <Spacing size={4} />
            <div className="flex items-center gap-2 h-8 text-xs font-normal">
              <div className="w-6 h-8 flex items-center justify-center">
                <svg
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6.54545C12 11.6364 6 16 6 16C6 16 0 11.6364 0 6.54545C2.37122e-08 4.80949 0.632141 3.14463 1.75736 1.91712C2.88258 0.689608 4.4087 0 6 0C7.5913 0 9.11742 0.689608 10.2426 1.91712C11.3679 3.14463 12 4.80949 12 6.54545Z"
                    fill="#CDCDCD"
                  />
                  <path
                    d="M5.99609 8.72741C7.10066 8.72741 7.99609 7.75057 7.99609 6.54559C7.99609 5.3406 7.10066 4.36377 5.99609 4.36377C4.89152 4.36377 3.99609 5.3406 3.99609 6.54559C3.99609 7.75057 4.89152 8.72741 5.99609 8.72741Z"
                    fill="#FEFEFE"
                  />
                </svg>
              </div>
              <div>{placeDetails?.address}</div>
            </div>
            {placeDetails?.openingHours !== "" && (
              <div className="flex items-center gap-2 h-8 text-xs font-normal">
                <div className="w-6 h-8 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                      stroke="black"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 3.80029V8.00029L10.8 9.40029"
                      stroke="black"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>{placeDetails?.openingHours}</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 absolute left-0 bottom-0 w-full min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 px-6 bg-[var(--color-bg)] h-[104px] pt-4 pb-10">
          <Button
            onClick={handlePlans}
            disabled={false}
            addStyle={
              false
                ? {
                    backgroundColor: "rgba(220, 220, 220, 1)",
                    color: "rgba(132, 132, 132, 1)",
                    boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                  }
                : undefined
            }
            text={"추가"}
          />
        </div>
      </MapBottomModal>
    </>
  );
};

export default SearchPlaceDetail;
