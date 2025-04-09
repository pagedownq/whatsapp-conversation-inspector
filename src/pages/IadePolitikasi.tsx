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
              Analizore olarak, kullanıcılarımıza şeffaf ve adil bir iade ve iptal politikası sunmayı taahhüt ediyoruz. Dijital hizmet sunduğumuz için, 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında cayma hakkı bulunmamaktadır.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">1. İade Hakkı</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik satın alan kullanıcılarımız, dijital bir ürün ve hizmet sunduğumuz için 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında cayma hakkına sahip değildir. Bu nedenle, satın alma işleminden sonra iade talebi yapılamaz.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">2. İade Talep Süreci</h2>
            <p className="text-gray-700 mb-4">
              Dijital ürün ve hizmet sunduğumuz için iade talebi kabul edilmemektedir. Bu nedenle, abonelik ve ödeme sonrasında geri ödeme yapılması mümkün değildir.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">3. Abonelik İptali</h2>
            <p className="text-gray-700 mb-4">
              Dijital ürün olduğu için abonelik iptal edilmez. Premium üyelik aboneliğiniz, satın alma işleminden sonra aktif olur ve ödeme anında sağlanan hizmeti hemen alırsınız. Bu nedenle, abonelik iptali ve iade talebi kabul edilmez.
            </p>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">4. Dijital Ürün Teslimi</h2>
            <p className="text-gray-700 mb-4">
              Premium üyelik satın alındığında:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Ödeme sonrası anında erişim sağlanır</li>
              <li>Hizmet dijital olarak teslim edilir</li>
              <li>Tek seferlik ödeme ile kalıcı erişim sağlanır</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">5. İade ve İptal Politikası</h2>
            <p className="text-gray-700 mb-4">
              Dijital ürün satışı yaptığımız için:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Satın alma sonrası iade yapılmaz</li>
              <li>Abonelik iptali mümkün değildir</li>
              <li>Anında teslimat sağlandığından cayma hakkı bulunmamaktadır</li>
            </ul>

            <h2 className="text-xl font-semibold text-purple-700 mt-6 mb-4">6. İletişim</h2>
            <p className="text-gray-700 mb-4">
              İade ve iptal işlemleri için bize ulaşın:
              <br />
              Web site: https://analizore.netlify.app/
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
