import { getTripDetail, getTripEnrollmentCount } from "@/entities/tripDetail";
import { TripDetailPage } from "@/page-views/trip";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ travelNumber: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const travelNumber = (await params).travelNumber;

  const tripDetail: any = await getTripDetail(parseInt(travelNumber), null);

  return {
    title: tripDetail?.title || "여행 상세보기",
    openGraph: {
      title: tripDetail?.title || "여행 상세",
      locale: "ko_KR",
      type: "website",
      images: {
        url: "/images/logo_moing_white_bg.png",
        width: 1200,
        height: 630,
      },
    },
  };
}

const Page = async ({
  params,
}: {
  params: { travelNumber: string };
}) => {
  const travelNumber = parseInt(params.travelNumber);
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["tripDetail", travelNumber],
      queryFn: () => getTripDetail(travelNumber, null),
    }),
    queryClient.prefetchQuery({
      queryKey: ["tripEnrollment", travelNumber],
      queryFn: () => getTripEnrollmentCount(travelNumber, null),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TripDetailPage />
    </HydrationBoundary>
  );
};

export default Page;
