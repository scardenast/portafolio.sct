
import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
  const wrapperClasses = fullScreen 
    ? "fixed inset-0 bg-black flex items-center justify-center z-[100]"
    : "w-full min-h-[40vh] flex items-center justify-center p-8";

  return (
    <div className={wrapperClasses}>
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="stroke-gray-800"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
          />
          <circle
            className="animate-loader-spin stroke-[#39f8b1]"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
            strokeDasharray="283"
            strokeDashoffset="212"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold tracking-wider text-white">
          SC
        </span>
      </div>
    </div>
  );
};

export default Loader;