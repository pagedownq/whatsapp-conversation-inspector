import React from 'react';

// This component is no longer in use, but we're keeping it in the codebase
// in case we need to add advertising back in the future
const AdSenseAd: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  adSlot?: string;
  isInArticle?: boolean;
}> = () => {
  return null;
};

export default AdSenseAd;
