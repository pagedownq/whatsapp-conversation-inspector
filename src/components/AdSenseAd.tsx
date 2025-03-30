
import React, { useEffect } from 'react';

interface AdSenseAdProps {
  className?: string;
  style?: React.CSSProperties;
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  className = '', 
  style = {}, 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true
}) => {
  useEffect(() => {
    try {
      // AdSense kodunu yükledikten sonra reklamları yenilemek için
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense reklamı yüklenirken hata oluştu:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      ></ins>
    </div>
  );
};

export default AdSenseAd;
