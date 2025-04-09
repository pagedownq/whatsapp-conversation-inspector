import React from 'react';
import { ChatMessage } from '@/utils/parseChat';
import WhatsAppView from './WhatsAppView';
import SubscriptionCheck from './SubscriptionCheck';

interface PremiumWhatsAppViewProps {
  messages: ChatMessage[];
  onBack: () => void;
}

const PremiumWhatsAppView: React.FC<PremiumWhatsAppViewProps> = ({ messages, onBack }) => {
  return (
    <SubscriptionCheck>
      <WhatsAppView messages={messages} onBack={onBack} />
    </SubscriptionCheck>
  );
};

export default PremiumWhatsAppView;