import { useState, useEffect } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import ReactMarkdown from 'react-markdown';

type Position = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: Position;
  showIcon?: boolean;
  mobilePosition?: Position;
}

export default function Tooltip({ text, children, position = 'bottom', showIcon = false, mobilePosition }: TooltipProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Use mobile position if specified and on mobile, otherwise use default position
  const currentPosition = isMobile && mobilePosition ? mobilePosition : position;
  
  // Generate unique ID for this tooltip
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center">
      {children}
      {showIcon && (
        <>
          <div 
            className="relative inline-flex items-center ml-1"
            data-tooltip-id={tooltipId}
            data-tooltip-place={currentPosition}
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
          </div>
          <ReactTooltip
            id={tooltipId}
            place={currentPosition}
            clickable={true}
            style={{
              backgroundColor: 'rgb(243 244 246)', // gray-100
              color: 'rgb(17 24 39)', // gray-900
              border: '1px solid rgb(55 65 81)', // gray-700
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              lineHeight: '1.25rem',
              maxWidth: isMobile ? '300px' : '500px',
              minWidth: isMobile ? '200px' : '250px',
              zIndex: 50,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            className="react-tooltip-custom"
            render={({ content, activeAnchor }) => (
              <div className="break-words prose prose-xs sm:prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-900">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            )}
            offset={2}
            delayShow={100}
            delayHide={100}
          />
        </>
      )}
    </div>
  );
} 