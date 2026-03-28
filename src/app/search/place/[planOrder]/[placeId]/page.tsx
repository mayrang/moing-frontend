"use client";
import SearchPlaceDetail from "@/page/CreateTrip/CreateTripDetail/search/SearchPlaceDetail";
import { APIProvider } from "@vis.gl/react-google-maps";
import React from "react";

const SearchPlaceDetailPage = () => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API || ""}>
      <SearchPlaceDetail />
    </APIProvider>
  );
};

export default SearchPlaceDetailPage;
