interface LoadingSkeletonProps {
  rows?: number;
}

export function LoadingSkeleton({ rows = 4 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-[#E8E0D8] bg-white p-6">
          <div className="h-4 w-3/4 rounded-full bg-[#E8E0D8]" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="h-3 rounded-full bg-[#E8E0D8]" />
            <div className="h-3 rounded-full bg-[#E8E0D8]" />
          </div>
        </div>
      ))}
    </div>
  );
}
