"use client";

import { useState, useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  bundleSize: number | null;
  loadTime: number | null;
}

interface PerformanceDashboardProps {
  showDetails?: boolean;
}

export default function PerformanceDashboard({
  showDetails = false,
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    bundleSize: null,
    loadTime: null,
  });

  const [isVisible, setIsVisible] = useState(showDetails);

  useEffect(() => {
    // Medir Core Web Vitals
    const measureWebVitals = () => {
      // LCP (Largest Contentful Paint)
      if (typeof window !== "undefined" && "PerformanceObserver" in window) {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            setMetrics(prev => ({
              ...prev,
              fid: (entry as any).processingStart - entry.startTime,
            }));
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          });
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });

        // FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          });
        });
        fcpObserver.observe({ entryTypes: ["paint"] });

        // TTFB (Time to First Byte)
        const navigationEntry = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          setMetrics(prev => ({
            ...prev,
            ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          }));
        }

        // Tiempo de carga total
        window.addEventListener("load", () => {
          const loadTime = performance.now();
          setMetrics(prev => ({ ...prev, loadTime }));
        });
      }
    };

    measureWebVitals();
  }, []);

  const getScoreColor = (
    value: number | null,
    thresholds: { good: number; needsImprovement: number }
  ) => {
    if (value === null) return "text-gray-500";
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.needsImprovement) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (
    value: number | null,
    thresholds: { good: number; needsImprovement: number }
  ) => {
    if (value === null) return "N/A";
    if (value <= thresholds.good) return "Good";
    if (value <= thresholds.needsImprovement) return "Needs Improvement";
    return "Poor";
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          📊 Performance
        </button>
        <SpeedInsights />
        <Analytics />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Performance Dashboard
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* LCP */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">LCP</span>
          <span
            className={`text-sm font-bold ${getScoreColor(metrics.lcp, { good: 2500, needsImprovement: 4000 })}`}
          >
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : "N/A"}
          </span>
        </div>

        {/* FID */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">FID</span>
          <span
            className={`text-sm font-bold ${getScoreColor(metrics.fid, { good: 100, needsImprovement: 300 })}`}
          >
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : "N/A"}
          </span>
        </div>

        {/* CLS */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">CLS</span>
          <span
            className={`text-sm font-bold ${getScoreColor(metrics.cls, { good: 0.1, needsImprovement: 0.25 })}`}
          >
            {metrics.cls ? metrics.cls.toFixed(3) : "N/A"}
          </span>
        </div>

        {/* FCP */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">FCP</span>
          <span
            className={`text-sm font-bold ${getScoreColor(metrics.fcp, { good: 1800, needsImprovement: 3000 })}`}
          >
            {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : "N/A"}
          </span>
        </div>

        {/* TTFB */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">TTFB</span>
          <span
            className={`text-sm font-bold ${getScoreColor(metrics.ttfb, { good: 800, needsImprovement: 1800 })}`}
          >
            {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : "N/A"}
          </span>
        </div>

        {/* Load Time */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Load Time</span>
          <span className="text-sm font-bold text-blue-600">
            {metrics.loadTime ? `${Math.round(metrics.loadTime)}ms` : "N/A"}
          </span>
        </div>

        {/* Overall Score */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Score</span>
            <span className="text-sm font-bold text-green-600">
              {(() => {
                const scores = [
                  metrics.lcp,
                  metrics.fid,
                  metrics.cls,
                  metrics.fcp,
                  metrics.ttfb,
                ];
                const validScores = scores.filter(score => score !== null);
                if (validScores.length === 0) return "N/A";

                const goodScores = validScores.filter((score, index) => {
                  const thresholds = [
                    { good: 2500, needsImprovement: 4000 }, // LCP
                    { good: 100, needsImprovement: 300 }, // FID
                    { good: 0.1, needsImprovement: 0.25 }, // CLS
                    { good: 1800, needsImprovement: 3000 }, // FCP
                    { good: 800, needsImprovement: 1800 }, // TTFB
                  ];
                  return score! <= thresholds[index].good;
                });

                const percentage = Math.round(
                  (goodScores.length / validScores.length) * 100
                );
                return `${percentage}%`;
              })()}
            </span>
          </div>
        </div>
      </div>

      <SpeedInsights />
      <Analytics />
    </div>
  );
}
