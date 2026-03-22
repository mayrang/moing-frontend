"use client";
import Spacing from "@/components/Spacing";
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import InputField from "@/components/designSystem/input/InputField";

import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { createTripStore } from "@/store/client/createTripStore";
import SearchItem from "./SearchItem";
import { useRouter, useSearchParams } from "next/navigation";
import { tripPlanStore } from "@/store/client/tripPlanStore";

const SearchPlace = () => {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const { locationName } = createTripStore();
  const { addIsChange } = tripPlanStore();
  const [ref, inView] = useInView();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const map = useMap();
  useEffect(() => {
    if (keyword.trim() === "") {
      setDebouncedKeyword("");
      return;
    }

    const handler: NodeJS.Timeout = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  const placesLib = useMapsLibrary("places");
  useEffect(() => {
    if (!placesLib || debouncedKeyword === "") return;

    let script: HTMLScriptElement | null = null;
    let isMounted = true;

    async function fetchPlacePredictions() {
      try {
        // @ts-ignore
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

        let request = {
          input: debouncedKeyword,
          language: "ko-KR",
        };

        const token = new AutocompleteSessionToken();
        // @ts-ignore
        request.sessionToken = token;

        const { suggestions } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        const mappedSuggestions = await Promise.all(
          suggestions.map(async (suggestion) => {
            try {
              const place = await suggestion.placePrediction.toPlace();
              await place.fetchFields({
                fields: ["displayName", "primaryTypeDisplayName", "location"],
              });

              const regionParts =
                suggestion.placePrediction.text.text.split(" ");
              const region = regionParts.length > 1 ? regionParts[1] : "N/A";

              return {
                placeId: suggestion.placePrediction.placeId,
                place: suggestion.placePrediction.mainText.text,
                type: place.primaryTypeDisplayName || "N/A",
                region: region,
                lat: place.location?.lat() || 0,
                lng: place.location?.lng() || 0,
              };
            } catch (error) {
              console.error("Error processing suggestion:", error);
              return null;
            }
          })
        );

        const validSuggestions = mappedSuggestions.filter(Boolean);
        const uniqueSuggestions = validSuggestions.filter(
          (suggestion, index, self) =>
            index === self.findIndex((t) => t.placeId === suggestion.placeId)
        );

        if (isMounted) {
          setSuggestions(uniqueSuggestions);
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
          function placesSearchCB(data, status, pagination) {
            if (!isMounted) return;

            if (status === window.kakao.maps.services.Status.OK) {
              const mappedSuggestions: any[] = [];
              const seenIds = new Set();

              for (const item of data) {
                if (!seenIds.has(item.id)) {
                  mappedSuggestions.push({
                    placeId: item.id,
                    place: item.place_name,
                    type: item.category_group_name,
                    region: item.address_name.split(" ")[0],
                    lat: item.y,
                    lng: item.x,
                  });
                  seenIds.add(item.id);
                }
              }
              setSuggestions(mappedSuggestions);
            } else if (
              status === window.kakao.maps.services.Status.ZERO_RESULT
            ) {
              return;
            } else if (status === window.kakao.maps.services.Status.ERROR) {
              alert("검색 결과 중 오류가 발생했습니다.");
              return;
            }
          }

          var ps = new window.kakao.maps.services.Places();
          var infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
          ps.keywordSearch(debouncedKeyword, placesSearchCB);
        });
      });
    }

    return () => {
      isMounted = false;
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, [placesLib, map, debouncedKeyword, locationName.mapType]);

  const handleRemoveValue = () => {
    setKeyword("");
  };

  const changeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && debouncedKeyword !== "") {
      e.preventDefault();
    }
  };

  return (
    <div>
      <header className="flex px-6 pt-[52px] pb-4 h-[116px] items-center sticky top-0 bg-[var(--color-bg)] z-[1000] justify-between w-full">
        <div
          className="w-12 cursor-pointer h-12 flex items-center justify-center"
          onClick={() => {
            addIsChange(true);
            router.back();
          }}
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
              stroke="#343434"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-[22px] text-[var(--color-text-base)] leading-[26px] font-semibold">장소추가</div>
        <div className="w-12 h-12"></div>
      </header>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API || ""}>
        <Map
          style={{ height: 0, width: 0 }}
          defaultZoom={13}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || ""}
          disableDefaultUI
          defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
        />
        <div className="px-6">
          <InputField
            value={keyword}
            onChange={changeKeyword}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력해주세요"
            handleRemoveValue={handleRemoveValue}
          />
          <Spacing size={16} />
          <div className="text-sm font-medium leading-[16.71px] tracking-[-0.025em]">
            총&nbsp;
            <span className="text-[#3e8d00] font-bold">{suggestions.length}건</span>
          </div>
          <Spacing size={15} />
          <div className="bg-[#e7e7e7] w-full h-[1px]" />
          <>
            {suggestions.map((suggestion, index) => (
              <SearchItem
                key={suggestion.placeId}
                id={suggestion.placeId}
                title={suggestion.place}
                type={suggestion.type}
                lat={suggestion.lat}
                lng={suggestion.lng}
                location={suggestion.region}
              />
            ))}

            <div ref={ref} style={{ height: 80 }} />
          </>
        </div>
      </APIProvider>
    </div>
  );
};

export default SearchPlace;
