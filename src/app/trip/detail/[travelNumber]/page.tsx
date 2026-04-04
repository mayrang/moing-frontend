import { TripDetailPage } from "@/page-views/trip";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { travelNumber: string };
}): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/travel/detail/${params.travelNumber}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    const trip = data?.success;
    return {
      title: trip?.title ?? "여행 상세",
      description: trip?.details?.slice(0, 100) ?? "모잉에서 함께 떠날 동행을 찾고 있어요.",
      openGraph: {
        title: `${trip?.title ?? "여행 상세"} | 모잉`,
        description: trip?.details?.slice(0, 100) ?? "모잉에서 함께 떠날 동행을 찾고 있어요.",
      },
    };
  } catch {
    return {
      title: "여행 상세",
      description: "모잉에서 함께 떠날 동행을 찾고 있어요.",
    };
  }
}

export default function Page() {
  return <TripDetailPage />;
}
