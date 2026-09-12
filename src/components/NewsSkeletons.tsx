import React from 'react';

interface SkeletonProps {
  portal?: string;
}

export function ArticleDetailSkeleton({ portal = 'gnext' }: SkeletonProps) {
  const bgClass =
    portal === 'yoikijatim'
      ? 'bg-orange-50/40'
      : portal === 'lumajangtalks'
      ? 'bg-lumajang-50/40'
      : portal === 'gummah'
      ? 'bg-emerald-50/30'
      : 'bg-neutral-50';

  const accentBg =
    portal === 'yoikijatim'
      ? 'bg-orange-200/70'
      : portal === 'lumajangtalks'
      ? 'bg-lumajang-200/70'
      : portal === 'gummah'
      ? 'bg-emerald-200/70'
      : 'bg-neutral-200';

  return (
    <div className={`min-h-screen ${bgClass} pt-24 pb-20 px-4 sm:px-6 md:px-12`}>
      <div className="max-w-4xl mx-auto">
        {/* Category & Location Badges Skeleton */}
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className={`h-6 w-24 rounded-md ${accentBg}`} />
          <div className="h-6 w-20 rounded-md bg-neutral-200" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-3 mb-6 animate-pulse">
          <div className="h-8 sm:h-11 w-full bg-neutral-200 rounded-xl" />
          <div className="h-8 sm:h-11 w-3/4 bg-neutral-200 rounded-xl" />
        </div>

        {/* Author / Date Meta Skeleton */}
        <div className="flex items-center gap-4 pb-6 mb-8 border-b border-neutral-200/80 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-3 w-44 bg-neutral-200 rounded" />
          </div>
        </div>

        {/* Cover Image Skeleton */}
        <div className="w-full h-64 sm:h-[420px] bg-neutral-200/80 rounded-2xl mb-10 animate-pulse overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Layout Grid: Article Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Text Skeleton */}
          <div className="lg:col-span-8 space-y-4 animate-pulse">
            <div className="h-5 w-full bg-neutral-200 rounded" />
            <div className="h-5 w-[96%] bg-neutral-200 rounded" />
            <div className="h-5 w-[90%] bg-neutral-200 rounded" />
            <div className="h-5 w-[94%] bg-neutral-200 rounded" />
            <div className="h-5 w-[85%] bg-neutral-200 rounded" />

            <div className="pt-4 space-y-4">
              <div className="h-6 w-1/2 bg-neutral-300 rounded-lg mb-2" />
              <div className="h-5 w-full bg-neutral-200 rounded" />
              <div className="h-5 w-[92%] bg-neutral-200 rounded" />
              <div className="h-5 w-[88%] bg-neutral-200 rounded" />
            </div>

            <div className="pt-4 space-y-4">
              <div className="h-5 w-full bg-neutral-200 rounded" />
              <div className="h-5 w-[95%] bg-neutral-200 rounded" />
              <div className="h-5 w-[70%] bg-neutral-200 rounded" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6 animate-pulse">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 space-y-4 shadow-sm">
              <div className="h-4 w-28 bg-neutral-300 rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 pt-3 border-t border-neutral-100">
                  <div className="w-16 h-16 rounded-lg bg-neutral-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-full bg-neutral-200 rounded" />
                    <div className="h-3.5 w-2/3 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewsFeedSkeleton({ portal = 'gnext' }: SkeletonProps) {
  const bgClass =
    portal === 'yoikijatim'
      ? 'bg-orange-50/40'
      : portal === 'lumajangtalks'
      ? 'bg-lumajang-50/40'
      : portal === 'gummah'
      ? 'bg-emerald-50/20'
      : portal.startsWith('lentera')
      ? 'bg-[#FAF7F2]'
      : 'bg-neutral-100';

  return (
    <div className={`w-full ${bgClass} py-8 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8 animate-pulse`}>
      {/* Hero Skeleton Layout */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Hero Card */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="w-full h-64 sm:h-80 bg-neutral-200 rounded-xl" />
            <div className="h-6 w-24 bg-neutral-200 rounded" />
            <div className="h-8 w-full bg-neutral-200 rounded-lg" />
            <div className="h-4 w-3/4 bg-neutral-200 rounded" />
          </div>

          {/* Side Hero Cards */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="h-5 w-32 bg-neutral-200 rounded mb-2" />
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="w-24 h-20 bg-neutral-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-16 bg-neutral-200 rounded" />
                  <div className="h-4 w-full bg-neutral-200 rounded" />
                  <div className="h-3.5 w-2/3 bg-neutral-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 w-24 sm:w-28 bg-white rounded-full border border-neutral-200 shrink-0" />
        ))}
      </div>

      {/* Main News Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-sm">
            <div className="w-full h-48 bg-neutral-200 rounded-xl" />
            <div className="h-4 w-20 bg-neutral-200 rounded" />
            <div className="h-5 w-full bg-neutral-200 rounded" />
            <div className="h-5 w-4/5 bg-neutral-200 rounded" />
            <div className="h-3.5 w-full bg-neutral-100 rounded pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
