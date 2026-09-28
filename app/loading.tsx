import { KpiSkeletonRow, ChartSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-lg mb-6" />
      <KpiSkeletonRow />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartSkeleton height="h-80" />
        <ChartSkeleton height="h-80" />
      </div>
    </div>
  );
}
