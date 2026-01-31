"use client";

/**
 * Indeterminate progress bar shown during client-side navigation.
 * Renders a thin bar at the top; use with fixed positioning inside the main content area.
 */
export function NavigationLoadingBar({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-64 right-0 h-1 bg-gray-100 z-[60] overflow-hidden"
      role="progressbar"
      aria-valuetext="Memuat halaman"
      aria-hidden={!show}
    >
      <div
        className="h-full w-1/3 min-w-[120px] bg-[#3B9ECF] animate-navigation-loading"
        style={{
          boxShadow: "0 0 10px rgba(59, 158, 207, 0.5)",
        }}
      />
    </div>
  );
}
