"use client";

import { useState, useEffect, ReactNode } from "react";
import LoadingPage from "./LoadingPage";

interface MinimumLoadingWrapperProps {
  children: ReactNode;
}

export default function MinimumLoadingWrapper({ children }: MinimumLoadingWrapperProps) {
  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChildren(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showChildren) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-30">
        <LoadingPage />
      </div>
    );
  }

  return <>{children}</>;
}
