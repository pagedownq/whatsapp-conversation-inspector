
import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdSenseAd from '@/components/AdSenseAd';

const PrivacyPolicy = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background px-4 md:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header />
      
      <main className="container mx-auto max-w-4xl py-8 pb-16">
        <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
        
        {/* Üst Reklam */}
        <div className="my-6">
          <AdSenseAd isInArticle={true} />
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-6 pr-4">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Giriş</h2>
              <p>
                Bu gizlilik politikası, WhatsApp Analyzer uygulamasının kullanıcılarının gizliliğini nasıl koruduğunu ve veri toplama, kullanma ve açıklama 
                uygulamalarını açıklamaktadır. Bu politika, KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (Genel Veri Koruma Yönetmeliği) ilkelerine uygun olarak 
                hazırlanmıştır.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Topladığımız Bilgiler</h2>
              <p>
                <strong>WhatsApp Analyzer</strong>, analiz için yüklediğiniz WhatsApp sohbet verilerinizi <strong>yalnızca tarayıcınızda ve yerel olarak</strong> işler.
                Hiçbir sohbet verisini sunucularımıza aktarmaz veya saklamaz. Aşağıdaki veriler yalnızca yerel olarak (cihazınızda) işlenir:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>WhatsApp sohbet dökümlerindeki mesajlar</li>
                <li>Mesaj istatistikleri ve analizleri</li>
                <li>Konuşmaya katılan kişilerin isimleri</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Çerez Kullanımı</h2>
              <p>
                Sitemiz, aşağıdaki amaçlar için çerez teknolojisini kullanmaktadır:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Temel işlevsellik için gerekli çerezler (örn: kullanıcı tercihlerini hatırlamak)</li>
                <li>Google AdSense tarafından kullanılan reklamcılık çerezleri</li>
              </ul>
              <p className="mt-2">
                Google AdSense, size gösterilen reklamları kişiselleştirmek için çerezleri kullanabilir. Bu çerezler, Google ve üçüncü taraf reklam 
                sağlayıcıları tarafından yerleştirilir. Google'ın reklam çerezlerini nasıl kullandığı hakkında daha fazla bilgi için 
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google'ın Reklam Politikalarını
                </a> inceleyebilirsiniz.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Veri Saklama</h2>
              <p>
                Siz tercih etmediğiniz sürece, hiçbir veri sunucularımızda saklanmaz. Analizlerinizi kaydetmeyi seçerseniz, bu veriler yalnızca 
                <strong>kendi tarayıcınızın yerel depolamasında (localStorage)</strong> tutulur ve sunucularımıza gönderilmez.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Üçüncü Taraf Hizmetleri</h2>
              <p>
                Sitemiz, Google AdSense gibi üçüncü taraf hizmetleri kullanmaktadır. Bu hizmetler kendi çerezlerini kullanabilir ve kendi gizlilik 
                politikalarına sahiptir. Kullanıcılar, bu üçüncü taraf hizmetlerin gizlilik uygulamaları hakkında bilgi almak için ilgili gizlilik 
                politikalarını incelemelidir.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google AdSense Politikası
                  </a>
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Haklarınız</h2>
              <p>
                KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Verilerinizin işlenip işlenmediğini öğrenme hakkı</li>
                <li>Verilerinize erişim hakkı</li>
                <li>Verilerinizin düzeltilmesini isteme hakkı</li>
                <li>Verilerinizin silinmesini isteme hakkı</li>
                <li>Verilerinizin işlenmesine itiraz etme hakkı</li>
              </ul>
              <p className="mt-2">
                WhatsApp Analyzer, tüm veri işleme faaliyetlerini yerel olarak gerçekleştirdiği için, bu hakları uygulamak doğrudan sizin 
                kontrolünüzdedir. Yerel depolamayı (localStorage) temizleyerek kaydedilmiş tüm analizleri silebilirsiniz.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Politika Değişiklikleri</h2>
              <p>
                Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişikliklerde kullanıcıları bilgilendirmek için makul çabalar 
                göstereceğiz. Kullanıcıların düzenli olarak bu sayfayı kontrol etmeleri önerilir.
              </p>
              <p className="mt-2">
                Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">İletişim</h2>
              <p>
                Bu gizlilik politikası hakkında sorularınız varsa, lütfen bize ulaşın:
              </p>
              <p className="mt-2">
                WhatsApp Analyzer <br />
                E-posta: mehmetirem305@gmail.com <br />
                Web: https://whatsapp-conversation-inspector.lovable.app
              </p>
            </section>
          </div>
        </ScrollArea>
        
        {/* Alt Reklam */}
        <div className="mt-8">
          <AdSenseAd isInArticle={true} />
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>WhatsApp Analyzer &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </motion.div>
  );
};

export default PrivacyPolicy;
