interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${sizes[size]} ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-2 border-white/20 border-t-emerald-400"></div>
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/5 animate-pulse">
      <div className="aspect-[2/3] bg-white/5"></div>
      <div className="p-3">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-white/5 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="h-6 bg-white/10 rounded w-48 mb-4 animate-pulse"></div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shrink-0 w-36 sm:w-44">
            <div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="relative h-[60vh] min-h-[400px] bg-white/5 animate-pulse"></div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-24 pb-10">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="shrink-0 w-44 sm:w-56 mx-auto sm:mx-0">
            <div className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse"></div>
          </div>
          <div className="flex-1 pt-4 sm:pt-24 space-y-4">
            <div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-white/10 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded w-48 animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-20 bg-white/5 rounded w-full animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-12 bg-emerald-500/20 rounded-xl w-36 animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded-xl w-32 animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded-xl w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[500px] bg-white/5 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 bg-white/10 rounded w-96 mx-auto animate-pulse"></div>
          <div className="h-6 bg-white/5 rounded w-72 mx-auto animate-pulse"></div>
          <div className="h-14 bg-white/10 rounded-2xl w-96 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
