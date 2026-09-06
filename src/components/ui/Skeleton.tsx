interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`block animate-pulse rounded-md bg-slate-200 ${className}`}
  />
);

export const DashboardSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading wallet dashboard"
    className="max-w-6xl mx-auto p-8 space-y-8"
  >
    <div className="flex justify-between items-center">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-11 w-32 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-8 rounded-3xl bg-indigo-300/60 h-48">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-28 bg-indigo-200/70" />
          <Skeleton className="h-6 w-20 rounded-full bg-indigo-200/70" />
        </div>
        <Skeleton className="h-10 w-48 mt-12 bg-indigo-200/70" />
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-7 w-14 rounded-full" />
      </div>
      <div className="p-6 space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
    <span className="sr-only">Loading wallet dashboard...</span>
  </div>
);
