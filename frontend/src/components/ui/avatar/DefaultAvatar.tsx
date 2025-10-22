import React from 'react';

interface DefaultAvatarProps {
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";
  className?: string;
}

const sizeClasses = {
  xsmall: "h-6 w-6",
  small: "h-8 w-8",
  medium: "h-10 w-10",
  large: "h-12 w-12",
  xlarge: "h-14 w-14",
  xxlarge: "h-16 w-16",
};

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ 
  size = "medium",
  className = ""
}) => {
  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
      <svg 
        className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  );
};

export default DefaultAvatar; 