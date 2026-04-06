'use client';
import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@/shared/lib/logger';

/**
 * Web Vitals 수집 → Sentry breadcrumb/logger 전송
 *
 * 수집 지표:
 * - LCP (Largest Contentful Paint): 주요 콘텐츠 로딩 속도
 * - FCP (First Contentful Paint): 첫 콘텐츠 렌더링 시간
 * - CLS (Cumulative Layout Shift): 레이아웃 안정성 (0에 가까울수록 좋음)
 * - INP (Interaction to Next Paint): 상호작용 응답성
 * - TTFB (Time to First Byte): 서버 응답 속도
 *
 * Good 기준 (Core Web Vitals):
 * - LCP ≤ 2.5s | CLS ≤ 0.1 | INP ≤ 200ms
 */

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP:  { good: 2500,  poor: 4000  },
  FCP:  { good: 1800,  poor: 3000  },
  CLS:  { good: 0.1,   poor: 0.25  },
  INP:  { good: 200,   poor: 500   },
  TTFB: { good: 800,   poor: 1800  },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export default function WebVitals() {
  useReportWebVitals((metric) => {
    const rating = getRating(metric.name, metric.value);
    const context = {
      metric: metric.name,
      value: Math.round(metric.value),
      rating,
      id: metric.id,
    };

    if (rating === 'poor') {
      logger.warn(`[WebVitals] ${metric.name} poor: ${Math.round(metric.value)}`, context);
    } else {
      logger.breadcrumb(`[WebVitals] ${metric.name}: ${Math.round(metric.value)} (${rating})`, context);
    }
  });

  return null;
}
