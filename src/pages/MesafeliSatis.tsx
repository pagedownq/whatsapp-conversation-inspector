import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MesafeliSatis = () => {
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
          <h1 className="text-3xl font-bold text-purple-800 mb-6">Mesafeli Satış Sözleşmesi</h1>
          
          <div className="prose prose-purple max-w-none">
            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">1. Taraflar</h2>
            <p className="text-gray-700 mb-4">
              <strong>SATICI:</strong><br />
              Ad-Soyad: Mehmet Gülhan<br />
              Adres: Antalya, Türkiye<br />
              Telefon: 05456962060<br />
              E-posta: mehmetirem305@gmail.com<br />
              <br />
              <strong>ALICI:</strong><br />
              Siteye üye olan kullanıcı
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">2. Sözleşmenin Konusu</h2>
            <p className="text-gray-700 mb-4">
              İşbu sözleşmenin konusu, Analizore Premium hizmetinin kullanım şartları ve tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">3. Hizmet Detayları</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik paketi aşağıdaki özellikleri içerir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Duygu Analizi ve Görselleştirme</li>
              <li>Manipülasyon Tespiti</li>
              <li>İlişki Dinamikleri Analizi</li>
              <li>Detaylı Raporlama</li>
              <li>Gelişmiş İstatistikler</li>
              <li>Sınırsız Sohbet Analizi</li>
              <li>Öncelikli Destek</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">4. Ücret ve Ödeme</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik ücreti aylık 49,99 TL'dir. Ödeme, kredi kartı ile yapılır ve abonelik otomatik olarak yenilenir.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">5. Cayma Hakkı ve İade Politikası</h2>
            <p className="text-gray-700 mb-4">
              Dijital ürün ve hizmet sunduğumuz için, 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında cayma hakkı bulunmamaktadır. Satın alma işlemi sonrası anında erişim sağlandığından dolayı iade ve iptal talepleri kabul edilmemektedir.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">6. Ödeme ve Teslimat</h2>
            <p className="text-gray-700 mb-4">
              Ödeme işlemi tamamlandıktan sonra dijital hizmetimize anında erişim sağlanmaktadır. Dijital ürün olması sebebiyle abonelik iptali ve para iadesi yapılmamaktadır.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">7. Hizmet Kalitesi</h2>
            <p className="text-gray-700 mb-4">
              Satıcı, hizmetin kesintisiz ve hatasız olacağını taahhüt etmez, ancak hizmet kalitesini en üst düzeyde tutmak için gerekli özeni gösterir.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">8. Gizlilik</h2>
            <p className="text-gray-700 mb-4">
              Kullanıcı bilgileri ve analiz edilen sohbet içerikleri gizlilik politikası kapsamında korunur ve üçüncü taraflarla paylaşılmaz.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">9. Uyuşmazlık Çözümü</h2>
            <p className="text-gray-700 mb-4">
              İşbu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır ve Türkiye Cumhuriyeti Mahkemeleri yetkilidir.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MesafeliSatis;