"use client";
import ArrowIcon from "@/components/icons/ArrowIcon";
import PlaceIcon from "@/components/icons/PlaceIcon";
import React, { useCallback, useEffect, useState } from "react";

import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import RegionModal from "@/components/RegionModal";

interface RegionInfo {
  country: string | null;
  adminArea: string | null;
}

const InnerMap = ({ locationNameStr, locationName, setRegionInfo, addInitGeometry, addLocationName, isLoad }) => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");

  const fetchPlaceInfo = useCallback(async () => {
    if (!map || !placesLib) return;

    const { PlacesService } = placesLib as google.maps.PlacesLibrary;
    const service = new PlacesService(map);

    const request: google.maps.places.FindPlaceFromQueryRequest = {
      query: locationNameStr,
      fields: ["name", "formatted_address", "geometry"],
    };

    service.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        if (results[0].geometry?.location?.lat() && results[0].geometry?.location?.lng()) {
          addInitGeometry({
            lat: results[0].geometry?.location?.lat(),
            lng: results[0].geometry?.location?.lng(),
          });
        }

        if (results[0]) {
          const parts = results[0].formatted_address?.split(",").map((part) => part.trim());
          setRegionInfo({
            country: parts ? parts[parts.length - 1] : null,
            adminArea: parts ? parts[parts.length - 2] : null,
          });
          addLocationName({
            locationName: locationName.locationName,
            mapType: "google",
            countryName: parts ? parts[parts.length - 1].split(" ")[0] : "",
          });
        }
      } else {
        setRegionInfo({
          country: locationNameStr,
          adminArea: locationNameStr,
        });
        addLocationName({
          locationName: locationName.locationName,
          mapType: "google",
          countryName: locationNameStr,
        });
      }
    });
  }, [map, placesLib, locationNameStr, addInitGeometry, setRegionInfo]);

  const handleKakaoInfo = useCallback(() => {
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(locationNameStr, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          if (result[0].x && result[0].y) {
            addInitGeometry({
              lat: Number(result[0].y),
              lng: Number(result[0].x),
            });
          }
          setRegionInfo({
            country: "대한민국",
            adminArea: result[0]?.address_name ?? locationNameStr,
          });
          addLocationName({
            locationName: locationName.locationName,
            mapType: "kakao",
            countryName: "대한민국",
          });
        } else {
          addInitGeometry(null);
        }
      });
    });
  }, [locationNameStr, addInitGeometry, setRegionInfo]);

  useEffect(() => {
    if (locationName.mapType === "google") {
      if (!map || !placesLib) return;
      fetchPlaceInfo();
    } else {
      if (!isLoad) return;
      handleKakaoInfo();
    }
  }, [locationName.mapType, map, placesLib, isLoad, fetchPlaceInfo, handleKakaoInfo]);

  return (
    <Map
      style={{
        height: 1,
        width: 1,
        position: "fixed",
        top: -99,
        left: -99,
        opacity: 1,
        visibility: "hidden",
      }}
      defaultZoom={13}
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || ""}
      disableDefaultUI
      defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
    />
  );
};

const RegionWrapper = ({
  locationName,
  addInitGeometry,
  addLocationName,
  location,
  isDetail = false,
}: {
  locationName: {
    locationName: string;
    mapType: "google" | "kakao";
    countryName: string;
  };
  addLocationName: ({
    locationName,
    mapType,
    countryName,
  }: {
    locationName: string;
    mapType: "google" | "kakao";
    countryName: string;
  }) => void;
  addInitGeometry: (obj: { lat: number; lng: number } | null) => void;
  location?: string;
  isDetail?: boolean;
}) => {
  const [regionInfo, setRegionInfo] = useState<RegionInfo | null>(null);
  const [isLoad, setIsLoad] = useState(false);
  const [isModalOPen, setIsModalOpen] = useState(false);
  const locationNameStr = location ?? locationName.locationName;

  useEffect(() => {
    const script: HTMLScriptElement = document.createElement("script");
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    document.head.appendChild(script);

    script.addEventListener("load", () => {
      setIsLoad(true);
    });

    return () => {
      script.removeEventListener("load", () => {
        setIsLoad(false);
      });
      document.head.removeChild(script);
    };
  }, []);

  if (isDetail) {
    return (
      <div className="flex flex-col gap-1">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API || ""}>
          <InnerMap
            locationNameStr={locationNameStr}
            locationName={locationName}
            setRegionInfo={setRegionInfo}
            addInitGeometry={addInitGeometry}
            addLocationName={addLocationName}
            isLoad={isLoad}
          />
        </APIProvider>
        <div className="text-base font-semibold text-[var(--color-text-base)] leading-4">{locationNameStr}</div>
        <div className="leading-4 text-xs text-[var(--color-text-muted)] font-normal">
          {regionInfo?.country} {regionInfo?.adminArea}
        </div>
      </div>
    );
  } else {
    return (
      <>
        <RegionModal
          locationName={locationName}
          addLocationName={addLocationName}
          isModalOpen={isModalOPen}
          setIsModalOpen={setIsModalOpen}
        />
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API || ""}>
          <InnerMap
            locationNameStr={locationNameStr}
            locationName={locationName}
            setRegionInfo={setRegionInfo}
            addInitGeometry={addInitGeometry}
            addLocationName={addLocationName}
            isLoad={isLoad}
          />
        </APIProvider>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-9 h-[42px]">
            <PlaceIcon width={21} height={24} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-base font-semibold text-[var(--color-text-base)] leading-4">{locationNameStr}</div>
            <div className="leading-4 text-xs text-[var(--color-text-muted)] font-normal">
              {regionInfo?.country} {regionInfo?.adminArea}
            </div>
          </div>
          <div
            className="flex items-center justify-center w-12 cursor-pointer h-12"
            onClick={() => setIsModalOpen(true)}
          >
            <ArrowIcon />
          </div>
        </div>
      </>
    );
  }
};

export default RegionWrapper;
