import React, { useEffect, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useTheme, useThemeClasses } from '../context/ThemeContext';
import styles from './QRCodeDisplay.module.css';

interface QRCodeDisplayProps {
  eventId: string;
  venueName: string;
  onClose: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ eventId, venueName, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentTheme } = useTheme();
  const themeClasses = useThemeClasses();

  // Phase 7: Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError('');
        const deepLink = `beatmatchme://event/${eventId}`;
        console.log('Generating QR code for:', deepLink);
        
        const url = await QRCode.toDataURL(deepLink, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        console.log('QR code generated successfully');
        setQrCodeUrl(url);
      } catch (err) {
        console.error('QR code generation failed:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [eventId]);

  // Phase 4: Add ESC key listener for dismissing the panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // Phase 7: Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isRightSwipe) {
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${venueName}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div 
      className={styles.overlay}
      onClick={onClose}
    >
      <div 
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div 
          className={styles.header}
          style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})` }}
        >
          <h2 className={styles.headerTitle}>Event QR Code</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* QR Code */}
          <div className={styles.qrContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div 
                  className={styles.spinner}
                  style={{ borderColor: currentTheme.primary }}
                ></div>
                <p className={styles.loadingText}>Generating QR code...</p>
              </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p className={styles.errorText}>❌ {error}</p>
              <p className={styles.errorSubtext}>Event ID: {eventId}</p>
            </div>
          ) : qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Event QR Code" className={styles.qrImage} />
          ) : null}
        </div>

          {/* Info */}
          <div className={styles.infoSection}>
            <h3 className={styles.venueName}>{venueName}</h3>
            <p className={styles.scanInstruction}>Scan to join this event</p>
            <p className={styles.eventId}>Event ID: {eventId}</p>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={handleDownload}
              className={`${styles.downloadButton} ${themeClasses.gradientPrimary}`}
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`beatmatchme://event/${eventId}`);
                alert('Event link copied to clipboard!');
              }}
              className={styles.copyButton}
            >
              <Share2 className="w-5 h-5" />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
