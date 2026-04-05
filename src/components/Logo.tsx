import { type ImgHTMLAttributes } from 'react';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<LogoSize, { img: string; text: string }> = {
  sm: { img: 'h-7 w-7', text: 'text-sm' },
  md: { img: 'h-9 w-9', text: 'text-base' },
  lg: { img: 'h-12 w-12', text: 'text-lg' },
  xl: { img: 'h-16 w-16', text: 'text-xl' },
};

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  imgSrc?: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

export function Logo({
  size = 'md',
  showText = true,
  className = '',
  imgSrc = '/logos/Nigeria_Police_logo_white_bg.jpg',
  imgProps,
}: LogoProps) {
  const s = sizeMap[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={imgSrc}
        alt="Nigeria Police Force crest"
        className={`${s.img} object-contain`}
        {...imgProps}
      />
      {showText && (
        <span className={`${s.text} font-bold leading-tight tracking-tight`}>
          <span className="text-primary-700">SPCAP</span>
        </span>
      )}
    </span>
  );
}
