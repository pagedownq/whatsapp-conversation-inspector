
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Rejected = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-6">Erişim Reddedildi</h1>
        <p className="mb-8">
          Bu siteyi kullanabilmek için çerez ve veri kullanım koşullarını kabul etmeniz gerekmektedir. 
          Bu koşulları kabul etmeden siteyi kullanmanız mümkün değildir.
        </p>
        <Button onClick={() => navigate('/')}>
          Tekrar Dene
        </Button>
      </div>
    </div>
  );
};

export default Rejected;
