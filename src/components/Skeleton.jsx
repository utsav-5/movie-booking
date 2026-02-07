import React from 'react';

const Skeleton = ({ className = '', variant = 'text', lines = 1 }) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  if (variant === 'text') {
    return (
      <div className={`${baseClass} ${className}`} style={{ height: '1em' }}>
        {lines > 1 && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="w-full">
                &nbsp;
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  if (variant === 'circular') {
    return (
      <div className={`${baseClass} rounded-full ${className}`} />
    );
  }
  
  if (variant === 'rectangular') {
    return (
      <div className={`${baseClass} ${className}`} />
    );
  }
  
  return null;
};

// Movie Card Skeleton
export const MovieCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Skeleton className="w-full h-full" variant="rectangular" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" variant="rectangular" />
        <Skeleton className="h-4 w-1/2" variant="rectangular" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" variant="rectangular" />
          <Skeleton className="h-4 w-12" variant="rectangular" />
        </div>
      </div>
    </div>
  );
};

// Movie Grid Skeleton
export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Hero Section Skeleton
export const HeroSkeleton = () => {
  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      <Skeleton className="w-full h-full" variant="rectangular" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 w-full max-w-2xl px-4">
          <Skeleton className="h-12 w-3/4 mx-auto" variant="rectangular" />
          <Skeleton className="h-6 w-1/2 mx-auto" variant="rectangular" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-32" variant="rectangular" />
            <Skeleton className="h-12 w-32" variant="rectangular" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Booking Summary Skeleton
export const BookingSummarySkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <Skeleton className="h-6 w-1/3" variant="rectangular" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" variant="rectangular" />
          <Skeleton className="h-4 w-24" variant="rectangular" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" variant="rectangular" />
          <Skeleton className="h-4 w-16" variant="rectangular" />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
          <Skeleton className="h-5 w-20" variant="rectangular" />
          <Skeleton className="h-5 w-24" variant="rectangular" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" variant="rectangular" />
    </div>
  );
};

// Profile Info Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-20 h-20 rounded-full" variant="circular" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" variant="rectangular" />
          <Skeleton className="h-4 w-32" variant="rectangular" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" variant="rectangular" />
        <Skeleton className="h-12 w-full" variant="rectangular" />
        <Skeleton className="h-12 w-full" variant="rectangular" />
      </div>
    </div>
  );
};

// Booking Card Skeleton
export const BookingCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-32 rounded-lg" variant="rectangular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" variant="rectangular" />
          <Skeleton className="h-4 w-1/2" variant="rectangular" />
          <Skeleton className="h-4 w-1/3" variant="rectangular" />
          <Skeleton className="h-4 w-1/4" variant="rectangular" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" variant="rectangular" />
        <Skeleton className="h-10 w-24" variant="rectangular" />
      </div>
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" variant="rectangular" />
        </td>
      ))}
    </tr>
  );
};

export default Skeleton;
