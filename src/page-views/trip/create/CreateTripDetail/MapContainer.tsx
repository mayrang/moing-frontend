"use client";
import GoogleMap, { PoiMarkers } from "@/components/map/GoogleMap";
import KakaoMap from "@/components/map/KakaoMap";
import React from "react";

interface MapContainerProps {
  lat: number;
  lng: number;
  zoom: number;
  isMapFull: boolean;
  index?: null | number;
  locationName: {
    mapType: string;
    locationName: string;
  };
  plans: any[];
}

const MapContainer = (props: MapContainerProps) => {
  const currentPlan =
    props.index !== null && props.index !== undefined
      ? props.plans.find((plan) => plan.planOrder === props.index!)
      : null;

  const positions = currentPlan
    ? currentPlan.spots.map((spot) => ({
        lat: spot.latitude,
        lng: spot.longitude,
        title: spot.name,
      }))
    : [];

  const containerStyle: React.CSSProperties = {
    width: "100%",
    transform: `scaleX(${props.isMapFull ? "1.15" : "1"})`,
    height: props.isMapFull ? "300px" : "177px",
    transition: "all 0.2s ease-in-out",
    minHeight: "177px",
  };

  if (props.locationName.mapType === "google") {
    return (
      <div key={props.locationName.mapType} style={containerStyle}>
        <GoogleMap lat={props.lat} lng={props.lng} zoom={props.zoom} positions={positions}>
          <PoiMarkers
            pois={positions.map((pos, idx) => ({
              key: `${idx}`,
              location: { lat: pos.lat, lng: pos.lng },
              title: pos.title,
            }))}
          />
        </GoogleMap>
      </div>
    );
  } else {
    return (
      <div key={props.locationName.mapType} style={containerStyle}>
        <KakaoMap
          lat={props.lat}
          lng={props.lng}
          zoom={props.zoom}
          positions={positions}
        />
      </div>
    );
  }
};

export default MapContainer;
