import React from 'react';

export type IconName =
  | 'home'
  | 'group'
  | 'payment'
  | 'more'
  | 'check'
  | 'close'
  | 'alert'
  | 'info'
  | 'error'
  | 'user'
  | 'users'
  | 'settings'
  | 'table'
  | 'meal'
  | 'cup'
  | 'download'
  | 'search'
  | 'filter'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'calendar'
  | 'ticket'
  | 'clock'
  | 'bell'
  | 'external-link'
  | 'refresh'
  | 'wifi-off'
  | 'building'
  | 'bar-chart'
  | 'lock'
  | 'mail'
  | 'phone';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  ...props
}) => {
  const iconSize = typeof size === 'number' ? `${size}px` : size;

  const renderPath = () => {
    switch (name) {
      case 'home':
        return <path d="M3 9.5L12 2.5L21 9.5V20.5C21 21.0523 20.5523 21.5 20 21.5H4C3.44772 21.5 3 21.0523 3 20.5V9.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'group':
      case 'users':
        return (
          <>
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'payment':
        return (
          <>
            <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10H22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 15H10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'more':
        return (
          <>
            <circle cx="12" cy="12" r="1.5" strokeWidth="2" />
            <circle cx="19" cy="12" r="1.5" strokeWidth="2" />
            <circle cx="5" cy="12" r="1.5" strokeWidth="2" />
          </>
        );
      case 'check':
        return <path d="M20 6L9 17L4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
      case 'close':
        return <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'alert':
        return (
          <>
            <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81442 19.9905C1.98733 20.2939 2.23675 20.5467 2.53771 20.7239C2.83867 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15449C12.6817 2.98587 12.3438 2.89746 12 2.89746C11.6562 2.89746 11.3183 2.98587 11.0188 3.15449C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9V13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 17H12.01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'info':
        return (
          <>
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 16V12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8H12.01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'error':
        return (
          <>
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M15 9L9 15M9 9L15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'user':
        return (
          <>
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeWidth="2" />
          </>
        );
      case 'settings':
        return (
          <>
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
            <path d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L20.08 17.43A2 2 0 0 1 17.43 20.08L16.82 19.73A1.65 1.65 0 0 0 15 19.4A1.65 1.65 0 0 0 13.35 21H10.65A1.65 1.65 0 0 0 9 19.4A1.65 1.65 0 0 0 7.18 19.73L6.57 20.08A2 2 0 0 1 3.92 17.43L4.27 16.82A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3 13.35V10.65A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4.27 7.18L3.92 6.57A2 2 0 0 1 6.57 3.92L7.18 4.27A1.65 1.65 0 0 0 9 4.6A1.65 1.65 0 0 0 10.65 3H13.35A1.65 1.65 0 0 0 15 4.6A1.65 1.65 0 0 0 16.82 4.27L17.43 3.92A2 2 0 0 1 20.08 6.57L19.73 7.18A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 21 10.65V13.35A1.65 1.65 0 0 0 19.4 15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'table':
        return (
          <>
            <circle cx="12" cy="12" r="7" strokeWidth="2" />
            <circle cx="12" cy="2" r="1.5" strokeWidth="2" />
            <circle cx="12" cy="22" r="1.5" strokeWidth="2" />
            <circle cx="2" cy="12" r="1.5" strokeWidth="2" />
            <circle cx="22" cy="12" r="1.5" strokeWidth="2" />
          </>
        );
      case 'meal':
        return (
          <>
            <path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8H18Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 14H22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 14V17C5 18.6569 6.34315 20 8 20H16C17.6569 20 19 18.6569 19 17V14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'cup':
        return (
          <>
            <path d="M17 8H19C19.7956 8 20.5587 8.31607 21.1213 8.87868C21.6839 9.44129 22 10.2044 22 11C22 11.7956 21.6839 12.5587 21.1213 13.1213C20.5587 13.6839 19.7956 14 19 14H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 8H17V17C17 18.6569 15.6569 20 14 20H8C6.34315 20 5 18.6569 5 17V8Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 2V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 2V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'download':
        return (
          <>
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10L12 15L17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'search':
        return (
          <>
            <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21L16.65 16.65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'filter':
        return <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'plus':
        return <path d="M12 5V19M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'edit':
        return (
          <>
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'trash':
        return (
          <>
            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'chevron-down':
        return <path d="M6 9L12 15L18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'chevron-right':
        return <path d="M9 18L15 12L9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'chevron-left':
        return <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'chevron-up':
        return <path d="M18 15L12 9L6 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'calendar':
        return (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 2V6M8 2V6M3 10H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'ticket':
        return (
          <>
            <path d="M2 9C3.65685 9 5 7.65685 5 6H19C19 7.65685 20.3431 9 22 9V15C20.3431 15 19 16.3431 19 18H5C5 16.3431 3.65685 15 2 15V9Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 6V18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 3" />
          </>
        );
      case 'clock':
        return (
          <>
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'bell':
        return (
          <>
            <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21A2 2 0 0 1 10.27 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'external-link':
        return (
          <>
            <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 3H21V9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 14L21 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'refresh':
        return (
          <>
            <path d="M23 4V10H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 20V14H7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9A9 9 0 0 1 19.36 5.36L23 10M1 14L4.64 18.64A9 9 0 0 0 20.49 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'wifi-off':
        return (
          <>
            <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12.55A10.94 10.94 0 0 1 9.5 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.42 9A15.91 15.91 0 0 1 7.29 5.86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'building':
        return (
          <>
            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 22V18H15V22M8 6H8.01M16 6H16.01M8 10H8.01M16 10H16.01M8 14H8.01M16 14H16.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'bar-chart':
        return (
          <>
            <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'lock':
        return (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'mail':
        return (
          <>
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="22 6 12 13 2 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'phone':
        return <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4741 21.8325 20.7293C21.7209 20.9845 21.5573 21.2137 21.3524 21.4019C21.1475 21.5901 20.906 21.733 20.6436 21.8213C20.3812 21.9096 20.1035 21.9413 19.828 21.9142C16.7428 21.5794 13.787 20.5273 11.19 18.84C8.77382 17.2928 6.72533 15.2443 5.178 12.828C3.48496 10.2188 2.43231 7.24838 2.102 4.148C2.07494 3.87321 2.10651 3.59623 2.19468 3.33451C2.28285 3.07279 2.4256 2.83204 2.61337 2.62768C2.80113 2.42332 3.02967 2.25997 3.28424 2.1484C3.53881 2.03683 3.81373 1.97951 4.092 1.98H7.092C7.5739 1.97523 8.04018 2.14674 8.40578 2.4632C8.77138 2.77965 9.01168 3.21973 9.083 3.704C9.21556 4.61864 9.43899 5.51688 9.749 6.384C9.88876 6.77255 9.90793 7.19363 9.80436 7.59296C9.7008 7.99229 9.47879 8.3516 9.167 8.624L7.897 9.894C9.33644 12.4243 11.4177 14.5056 13.948 15.945L15.218 14.675C15.4904 14.3632 15.8497 14.1412 16.249 14.0376C16.6484 13.9341 17.0695 13.9532 17.458 14.093C18.3251 14.403 19.2234 14.6264 20.138 14.759C20.6275 14.8311 21.0717 15.0754 21.3888 15.4468C21.7059 15.8182 21.8741 16.2907 21.862 16.777L22 16.92Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      default:
        return <circle cx="12" cy="12" r="10" strokeWidth="2" />;
    }
  };

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {renderPath()}
    </svg>
  );
};
