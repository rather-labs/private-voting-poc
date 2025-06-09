import { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'bottom-right' | 'top-left';
  showIcon?: boolean;
}

export default function Tooltip({ text, children, position = 'bottom', showIcon = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full right-0 mb-2',
    bottom: 'top-full right-0 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    'top-right': 'bottom-full left-0 mb-2',
    'bottom-right': 'top-full left-0 mt-2',
    'top-left': 'bottom-full right-0 mb-2',
  };

  const arrowClasses = {
    top: 'bottom-[-4px] right-1',
    bottom: 'top-[-4px] right-1',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2',
    'top-right': 'bottom-[-4px] left-1',
    'bottom-right': 'top-[-4px] left-1',
    'top-left': 'bottom-[-4px] right-1',
  };

  return (
    <div className="relative inline-flex items-center">
      {children}
      {showIcon && (
        <div 
          className="relative inline-flex items-center ml-1"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="inline-flex items-center">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-help transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          {isVisible && (
            <div
              className={`absolute z-50 px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg w-max border border-gray-700 dark:border-gray-600 ${positionClasses[position]}`}
              role="tooltip"
            >
              <div 
                className="whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: text }}
              />
              <div
                className={`absolute w-2 h-2 bg-gray-100 dark:bg-gray-800 transform rotate-45 border-l border-t border-gray-700 dark:border-gray-600 ${arrowClasses[position]}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 