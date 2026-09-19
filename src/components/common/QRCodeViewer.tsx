import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeViewerProps {
  value: string;
  size?: number;
  includeMargin?: boolean;
  caption?: string;
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  value,
  size = 160,
  includeMargin = true,
  caption,
}) => {
  return (
    <div className="inline-flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={includeMargin}
        className="rounded-md"
      />
      {caption && (
        <span className="mt-2 text-xs font-mono font-semibold tracking-wider text-slate-600 uppercase">
          {caption}
        </span>
      )}
    </div>
  );
};
