import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const IadePolitikasi = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 hover:scale-105 transition-transform"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-[8px] rounded-lg p-8 shadow-xl"
        >
          <h1 className="text-3xl font-bold text-purple-800 mb-6">İade ve İptal Politikası</h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-700 mb-4">
              Whatsapp Analiz olarak, kullanıcılarımıza şeffaf ve adil bir iade ve iptal politikası sunmayı taahhüt ediyoruz. Dijital hizmet sunduğumuz için, 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında cayma hakkı bulunmamaktadır.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">1. İade Hakkı</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik satın alan kullanıcılarımız:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Satın alma tarihinden itibaren 7 gün içinde herhangi bir sebep göstermeksizin iade talep edebilir</li>
              <li>İade talebi onaylandıktan sonra ödeme 14 iş günü içinde iade edilir</li>
              <li>İade süreci boyunca premium özelliklere erişim devam eder</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">2. İade Talep Süreci</h2>
            <p className="text-gray-700 mb-4">
              İade talebinde bulunmak için:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>E-posta: mehmetirem305@gmail.com adresine talep gönderin</li>
              <li>Telefon: 05456962060 numarasından bize ulaşın</li>
              <li>Talep formunu doldurun (hesap ayarlarından ulaşabilirsiniz)</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">3. Abonelik İptali</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik aboneliğinizi istediğiniz zaman iptal edebilirsiniz:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Hesap ayarlarından "Aboneliği İptal Et" seçeneğini kullanın</li>
              <li>Müşteri hizmetleri ile iletişime geçin</li>
              <li>İptal işlemi mevcut dönemin sonunda gerçekleşir</li>
              <li>İptal edilen abonelik dönem sonuna kadar aktif kalır</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">4. Otomatik Yenileme</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik aboneliği otomatik olarak yenilenir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Her ay sonunda otomatik ödeme alınır</li>
              <li>Ödeme günü öncesinde bilgilendirme e-postası gönderilir</li>
              <li>Otomatik yenilemeyi istediğiniz zaman kapatabilirsiniz</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">5. İade Edilemeyecek Durumlar</h2>
            <p className="text-gray-700 mb-4">
              Aşağıdaki durumlarda iade talebi kabul edilmeyebilir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>7 günlük cayma süresi geçtikten sonra</li>
              <li>Hizmetin kötüye kullanımı tespit edildiğinde</li>
              <li>Kullanım şartları ihlal edildiğinde</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">6. İletişim</h2>
            <p className="text-gray-700 mb-4">
              İade ve iptal işlemleri için bize ulaşın:
              <br />
              Web site: https://www.mehmetgulhan.xyz/
              <br />
              E-posta: mehmetirem305@gmail.com
              <br />
              Telefon: 05456962060
              <br />
              Adres: Antalya, Türkiye
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IadePolitikasi;