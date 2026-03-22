"use client";
import QueryClientBoundary from "@/context/QueryClientBoundary";
import ErrorCatcher from "@/context/ErrorCatcher";
import { ReactNode, Suspense } from "react";
import { GlobalErrorBoundary } from "@/components/errorHandling/GlobalErrorBoundary";
import { ViewTransitions } from "next-view-transitions";
import PageNavigationProvider from "@/context/PageNavigationProvider";
import { AnalyticsProvider } from "@/context/AnalyticsProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <Suspense>
        <AnalyticsProvider>
          <ViewTransitions>
            <PageNavigationProvider>
              <QueryClientBoundary>
                <ErrorCatcher />
                {children}
              </QueryClientBoundary>
            </PageNavigationProvider>
          </ViewTransitions>
        </AnalyticsProvider>
      </Suspense>
    </GlobalErrorBoundary>
  );
}
