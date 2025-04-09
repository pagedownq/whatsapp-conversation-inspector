import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GizlilikPolitikasi = () => {
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
          <h1 className="text-3xl font-bold text-purple-800 mb-6">Gizlilik Politikası</h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-700 mb-4">
              Analizore olarak, kişisel verilerinizin güvenliği ve gizliliği bizim için önemli bir husustur. Bu Gizlilik Politikası, hizmetlerimizi kullanırken kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır. Lütfen bu politikayı dikkatlice inceleyin.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">1. Toplanan Bilgiler</h2>
            <p className="text-gray-700 mb-4">
              Hizmetimiz kapsamında aşağıdaki kişisel verileri toplayabiliriz:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>WhatsApp sohbet içerikleri (kullanıcı tarafından yüklenen)</li>
              <li>Kullanıcı hesap bilgileri</li>
              <li>Ödeme bilgileri</li>
              <li>Kullanım istatistikleri</li>
              <li>Cihaz ve tarayıcı bilgileri</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">2. Bilgilerin Kullanımı</h2>
            <p className="text-gray-700 mb-4">
              Topladığımız kişisel verileri aşağıdaki amaçlarla kullanıyoruz:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Sohbet analizi hizmetinin sağlanması</li>
              <li>Kullanıcı deneyiminin iyileştirilmesi</li>
              <li>Teknik sorunların çözülmesi</li>
              <li>Güvenlik önlemlerinin uygulanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">3. Veri Güvenliği</h2>
            <p className="text-gray-700 mb-4">
              Verilerinizi korumak için endüstri standartlarına uygun güvenlik önlemleri uygulamaktayız:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>SSL şifreleme</li>
              <li>Güvenli veri depolama</li>
              <li>Düzenli güvenlik güncellemeleri</li>
              <li>Erişim kontrolü ve yetkilendirme</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">4. Çerezler ve İzleme</h2>
            <p className="text-gray-700 mb-4">
              Hizmetimizde çerezler ve benzer izleme teknolojileri kullanmaktayız. Bu teknolojiler, kullanıcı deneyimini iyileştirmek ve hizmet kalitesini artırmak için kullanılmaktadır. Çerezlerin kullanımına ilişkin daha fazla bilgi için Çerez Politikamızı inceleyebilirsiniz.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">5. Üçüncü Taraf Hizmetler</h2>
            <p className="text-gray-700 mb-4">
              Hizmetimiz, ödeme işlemleri ve analitik gibi amaçlarla üçüncü taraf hizmetleri kullanabilir. Bu hizmetlerin gizlilik politikaları ve uygulamaları kendi yükümlülüklerine tabidir. Kullanıcılar, bu üçüncü taraf hizmetlerinin koşullarını kabul etmekle yükümlüdür.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">6. Veri Saklama ve Silme</h2>
            <p className="text-gray-700 mb-4">
              Kişisel verilerinizi yalnızca gerekli olduğu sürece saklarız. Hesabınızı sildiğinizde veya talep ettiğinizde, verileriniz güvenli bir şekilde silinir ve herhangi bir şekilde saklanmaz.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">7. Kullanıcı Hakları</h2>
            <p className="text-gray-700 mb-4">
              Kullanıcılar aşağıdaki haklara sahiptir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Verilerine erişim talep etme hakkına sahiptir.</li>
              <li>Yanlış veya eksik verilerinin düzeltilmesini isteme hakkına sahiptir.</li>
              <li>Verilerinin silinmesini talep etme hakkına sahiptir.</li>
              <li>Veri işlemeye itiraz etme hakkına sahiptir.</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">8. İletişim</h2>
<p className="text-gray-700 mb-4">
  Gizlilik politikamız hakkında sorularınız veya talepleriniz için bizimle iletişime geçebilirsiniz:
  <br />
  <a href="https://analizore.netlify.app/" className="text-blue-500 hover:underline">Web site: https://analizore.netlify.app/</a>
  <br />
  <a href="mailto:mehmetirem305@gmail.com" className="text-blue-500 hover:underline">E-posta: mehmetirem305@gmail.com</a>
  <br />
  <a href="tel:+905456962060" className="text-blue-500 hover:underline">Telefon: 05456962060</a>
  <br />
  Adres: Antalya, Türkiye
</p>


            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">9. Güncellemeler</h2>
            <p className="text-gray-700 mb-4">
              Bu gizlilik politikası periyodik olarak güncellenebilir. Önemli değişiklikler olduğunda kullanıcılarımızı bilgilendireceğiz.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GizlilikPolitikasi;
