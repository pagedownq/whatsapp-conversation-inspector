
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsentDialogProps {
  isOpen: boolean;
  onAccept: () => void;
}

const ConsentDialog: React.FC<ConsentDialogProps> = ({ isOpen, onAccept }) => {
  const navigate = useNavigate();

  const handleReject = () => {
    // Navigate to a blank page or display a rejection message
    navigate('/rejected');
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[50vh] md:max-h-[60vh]">
        <AlertDialogHeader>
          <AlertDialogTitle>Çerez ve Veri Kullanım Bilgilendirmesi</AlertDialogTitle>
        </AlertDialogHeader>
        
        <ScrollArea className="flex-1 h-[30vh] md:h-[40vh] pr-4">
          <AlertDialogDescription className="text-left space-y-4">
            <p>
              Bu web sitesi, WhatsApp sohbet analizlerini gerçekleştirmek için tasarlanmıştır. Size en iyi deneyimi sunabilmek için aşağıdaki bilgilendirmeyi lütfen okuyun:
            </p>
            
            <h3 className="text-md font-semibold">Veri Saklama Politikamız:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bu web sitesi <strong>hiçbir şekilde</strong> yüklediğiniz WhatsApp sohbet verilerini sunucuda saklamaz veya depolamaz.</li>
              <li>Tüm analiz işlemleri <strong>tamamen yerel olarak</strong> tarayıcınızda gerçekleştirilir.</li>
              <li>Verileriniz hiçbir üçüncü tarafla paylaşılmaz.</li>
              <li>Sohbet analizleriniz yalnızca siz tercih ederseniz <strong>cihazınızın yerel depolama alanında (localStorage)</strong> saklanır.</li>
              <li>İstediğiniz zaman yerel kayıtlı analizlerinizi silebilirsiniz.</li>
            </ul>
            
            <h3 className="text-md font-semibold">Çerez Kullanımı:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bu site, sadece gerekli temel işlevsellik için çerez kullanır (örn: kullanıcı tercihlerini hatırlamak için).</li>
              <li>Analitik veya pazarlama amaçlı çerezler kullanılmamaktadır.</li>
              <li>Hiçbir kişisel veri çerezlerde saklanmaz.</li>
            </ul>
            
            <h3 className="text-md font-semibold">Reklam Kullanımı:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bu site, Google AdSense reklamlarını göstermek için çerezler kullanabilir.</li>
              <li>Google ve diğer üçüncü taraf reklam sunucuları, bu site üzerindeki davranışlarınıza dayalı olarak reklamlar sunmak için çerezler kullanabilir.</li>
              <li>Reklam çerezleri kişiselleştirilmiş reklamlar sunmak için kullanılabilir.</li>
              <li>Google AdSense, yeniden hedefleme çerezleri kullanabilir.</li>
            </ul>
            
            <h3 className="text-md font-semibold">Yasal Dayanak:</h3>
            <p>
              Bu uygulama, KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (Genel Veri Koruma Yönetmeliği) ilkelerine uygun olarak tasarlanmıştır. 
              Yüklediğiniz veriler sunuculara gönderilmediği ve sadece yerel olarak işlendiği için, KVKK ve GDPR kapsamında veri işleme gereksinimlerini minimum 
              düzeyde tutmaktadır.
            </p>
            
            <p className="font-medium mt-4">
              Bu siteyi kullanabilmek için lütfen yukarıdaki bilgilendirmeyi kabul edin. Kabul etmezseniz siteyi kullanamayacaksınız.
            </p>
          </AlertDialogDescription>
        </ScrollArea>
        
        <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel 
            onClick={handleReject} 
            className="w-full sm:w-auto"
          >
            Reddet
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onAccept} 
            className="w-full sm:w-auto"
          >
            Kabul Ediyorum
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConsentDialog;
