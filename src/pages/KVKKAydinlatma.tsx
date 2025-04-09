import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const KVKKAydinlatma = () => {
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
          <h1 className="text-3xl font-bold text-purple-800 mb-6">KVKK Aydınlatma Metni</h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-700 mb-4">
              Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla hareket eden Mehmet Gülhan tarafından hazırlanmıştır.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">1. Veri Sorumlusu</h2>
            <p className="text-gray-700 mb-4">
              Ad-Soyad: Mehmet Gülhan<br />
              E-posta: mehmetirem305@gmail.com<br />
              Telefon: 05456962060<br />
              Adres: Antalya, Türkiye
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">2. İşlenen Kişisel Veriler</h2>
            <p className="text-gray-700 mb-4">
              WhatsApp Conversation Inspector hizmeti kapsamında işlenen kişisel veriler:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>WhatsApp sohbet içerikleri</li>
              <li>Kullanıcı kimlik bilgileri</li>
              <li>İletişim bilgileri</li>
              <li>Ödeme bilgileri</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">3. Kişisel Verilerin İşlenme Amacı</h2>
            <p className="text-gray-700 mb-4">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Sohbet analizi hizmetinin sağlanması</li>
              <li>Kullanıcı hesabının oluşturulması ve yönetimi</li>
              <li>Premium üyelik işlemlerinin gerçekleştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">4. Kişisel Verilerin Aktarılması</h2>
            <p className="text-gray-700 mb-4">
              Kişisel verileriniz, hizmetin sağlanması amacıyla gerekli olduğu ölçüde ve yasal yükümlülükler kapsamında üçüncü taraflarla paylaşılabilir.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">5. Kişisel Veri Sahibinin Hakları</h2>
            <p className="text-gray-700 mb-4">
              KVKK'nın 11. maddesi uyarınca sahip olduğunuz haklar:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Kişisel verilerinizin düzeltilmesini veya silinmesini isteme</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">6. İletişim</h2>
            <p className="text-gray-700 mb-4">
              KVKK kapsamındaki haklarınızı kullanmak için yukarıda belirtilen iletişim bilgilerinden bize ulaşabilirsiniz.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KVKKAydinlatma;