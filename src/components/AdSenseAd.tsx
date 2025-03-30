
import React, { useEffect } from 'react';

interface AdSenseAdProps {
  className?: string;
  style?: React.CSSProperties;
  adSlot?: string;
  isInArticle?: boolean;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  className = '', 
  style = {}, 
  adSlot = "7771145390",
  isInArticle = false
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
      {isInArticle ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-3777090766109762"
          data-ad-slot={adSlot}
        ></ins>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3777090766109762"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      )}
    </div>
  );
};

export default AdSenseAd;
