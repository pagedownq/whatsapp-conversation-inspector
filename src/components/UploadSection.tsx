import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, X, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Smartphone, Archive, MessageCircle, Crown } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface UploadSectionProps {
  onFileProcessed: (content: string) => void;
}
const UploadSection: React.FC<UploadSectionProps> = ({
  onFileProcessed
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user,
    subscription
  } = useAuth();
  const navigate = useNavigate();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    let droppedFile: File | null = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const item = items[i].getAsFile();
        if (item && (item.name.endsWith('.zip') || item.name.endsWith('.txt'))) {
          droppedFile = item;
          break;
        }
      }
    }
    if (droppedFile) {
      processFile(droppedFile);
    } else {
      toast.error("Lütfen .zip veya .txt uzantılı dosya yükleyin");
    }
  };
  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    setFile(selectedFile);
    try {
      if (selectedFile.name.endsWith('.txt')) {
        const content = await readTextFile(selectedFile);
        onFileProcessed(content);
        toast.success("Dosya başarıyla işlendi");
      } else if (selectedFile.name.endsWith('.zip')) {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(selectedFile);
        const textFiles = Object.keys(zipContent.files).filter(filename => filename.endsWith('.txt') && !zipContent.files[filename].dir);
        if (textFiles.length === 0) {
          throw new Error("Zip dosyasında WhatsApp sohbet metni bulunamadı");
        }
        const textFile = textFiles[0];
        const content = await zipContent.files[textFile].async('string');
        const processedContent = content.replace(/Ã¼/g, 'ü').replace(/Ã§/g, 'ç').replace(/ÅŸ/g, 'ş').replace(/Ä±/g, 'ı').replace(/Ã¶/g, 'ö').replace(/ÄŸ/g, 'ğ').replace(/Ä°/g, 'İ');
        console.log("Processed ZIP content length:", processedContent.length);
        if (processedContent.trim() === '') {
          throw new Error("Zip içindeki dosya boş veya okunamadı");
        }
        onFileProcessed(processedContent);
        toast.success("WhatsApp sohbeti başarıyla işlendi");
      } else {
        throw new Error("Desteklenmeyen dosya formatı");
      }
    } catch (error) {
      console.error("File processing error:", error);
      toast.error(error instanceof Error ? error.message : "Dosya işlenirken bir hata oluştu");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Dosya okunamadı"));
        }
      };
      reader.onerror = () => reject(new Error("Dosya okuma hatası"));
      reader.readAsText(file);
    });
  };
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };
  const GuideSteps = () => <div className="mt-6 bg-secondary/70 rounded-xl p-4">
      <h3 className="font-display font-medium text-lg mb-4 flex items-center gap-2 text-primary">
        <Smartphone className="h-5 w-5" />
        WhatsApp Sohbeti Nasıl Dışa Aktarılır?
      </h3>
      
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1" className="border-b border-border/50">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-sm">1</div>
              <span>WhatsApp uygulamasında sohbeti açın</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-9">
            <div className="rounded-lg overflow-hidden shadow-sm border border-border/50 bg-white">
              <div className="bg-[#075E54] text-white p-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <div className="text-sm font-medium">WhatsApp Sohbet</div>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div className="bg-[#DCF8C6] p-2 rounded-lg text-xs self-end max-w-[80%]">
                  Merhaba, nasılsın?
                </div>
                <div className="bg-white border border-gray-200 p-2 rounded-lg text-xs self-start max-w-[80%]">
                  İyiyim, teşekkür ederim. Sen nasılsın?
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border-b border-border/50">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-sm">2</div>
              <span>Sohbetin sağ üst köşesindeki menü butonuna tıklayın</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-9">
            <div className="rounded-lg overflow-hidden shadow-sm border border-border/50 bg-white">
              <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <div className="text-sm font-medium">WhatsApp Sohbet</div>
                </div>
                <div className="flex items-center font-bold">⋮</div>
              </div>
              <div className="absolute right-10 top-[160px] bg-white shadow-lg rounded-md border border-gray-200 z-10">
                <div className="py-2 px-4 text-xs hover:bg-gray-100">Kişiyi görüntüle</div>
                <div className="py-2 px-4 text-xs hover:bg-gray-100">Medya, bağlantılar, ve belgeler</div>
                <div className="py-2 px-4 text-xs hover:bg-gray-100">Ara</div>
                <div className="py-2 px-4 text-xs hover:bg-gray-100">Bildirileri sessize al</div>
                <div className="py-2 px-4 text-xs hover:bg-gray-100">Duvar kağıdı</div>
                <div className="py-2 px-4 text-xs font-medium text-primary">Daha fazla</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border-b border-border/50">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-sm">3</div>
              <span>"Daha fazla" ve ardından "Sohbeti dışa aktar" seçeneğini seçin</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-9">
            <div className="rounded-lg overflow-hidden shadow-sm border border-border/50 bg-white">
              
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="border-b border-border/50">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-sm">4</div>
              <span>"Medya olmadan" seçeneğini seçin</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-9">
            <div className="rounded-lg overflow-hidden shadow-sm border border-border/50 bg-white">
              <div className="p-4 flex flex-col items-center gap-3">
                <div className="text-sm font-medium">Sohbeti dışa aktar</div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="p-3 border border-gray-200 rounded-md text-xs flex items-center justify-between">
                    <span>Medya ile</span>
                    <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                  </div>
                  <div className="p-3 border border-primary rounded-md text-xs flex items-center justify-between bg-primary/5">
                    <span className="font-medium">Medya olmadan</span>
                    <div className="h-4 w-4 rounded-full border border-primary bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="mt-2 w-full">Dışa Aktar</Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-sm">5</div>
              <span>Oluşturulan ZIP dosyasını bu sayfaya yükleyin</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-9">
            <div className="rounded-lg bg-white border border-border/50 p-4 flex flex-col items-center gap-3">
              <Archive className="h-10 w-10 text-primary opacity-70" />
              <div className="text-sm font-medium">WhatsApp Chat XXX.zip</div>
              <div className="text-xs text-muted-foreground">
                WhatsApp, sohbet geçmişinizi bir ZIP dosyası olarak dışa aktaracaktır. Bu dosyayı kaydedin ve yukarıdaki yükleme alanına sürükleyip bırakın.
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                <div className="text-xs text-primary font-medium">
                  İşte bu sohbet analizine hazırsınız!
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>;
  return <motion.div className="w-full max-w-xl mx-auto mb-8" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip,.txt" className="hidden" aria-label="Dosya yükle" />
      
      <AnimatePresence mode="wait">
        {!file ? <motion.div key="upload-area" className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-secondary/50'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} exit={{
        opacity: 0,
        scale: 0.95
      }}>
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-display font-medium text-lg mb-2">WhatsApp Sohbet Dosyanızı Yükleyin</h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-md">
                Sohbetinizin .zip veya .txt dosyasını sürükleyip bırakın veya bilgisayarınızdan seçin
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="rounded-full shadow-soft hover:shadow-lg btn-transition" onClick={handleButtonClick}>
                  <Upload className="mr-1 h-4 w-4" />
                  Dosya Seç
                </Button>

                <Button variant="outline" className="rounded-full hover:bg-secondary btn-transition" onClick={toggleGuide}>
                  {showGuide ? 'Kılavuzu Gizle' : 'Nasıl Yapılır?'}
                </Button>

                <div className="flex items-center justify-center mt-3 sm:mt-0">
                  {!user ? <Button variant="outline" onClick={() => navigate('/auth')} className="rounded-full">
                      Giriş Yap
                    </Button> : subscription?.isActive ? <Badge className="bg-gradient-to-r from-amber-200 to-amber-500/80 text-purple-800 font-medium border-amber-300 backdrop-blur-sm animate-pulse-slow px-3 py-1.5">
                      <Crown className="h-3 w-3 mr-1 text-amber-800" /> Premium
                    </Badge> : <Button variant="outline" onClick={() => navigate('/pricing')} className="rounded-full bg-gradient-to-r from-amber-200/20 to-amber-500/20 text-purple-800 border-amber-300/50 hover:bg-amber-200/30 hover:text-purple-900">
                      <Crown className="h-4 w-4 mr-1 text-amber-500" />
                      Premium Özellikler
                    </Button>}
                </div>
              </div>
              
              <p className="mt-4 text-xs text-muted-foreground">
                WhatsApp &gt; Sohbet &gt; Dışa Aktar &gt; Medya olmadan
              </p>
            </div>
            
            {showGuide && <GuideSteps />}
          </motion.div> : <motion.div key="file-preview" className="bg-card rounded-2xl p-6 shadow-soft" initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-medium truncate max-w-[200px]">{file.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <button onClick={handleRemoveFile} className="p-1.5 text-muted-foreground hover:text-destructive btn-transition rounded-full hover:bg-destructive/10" disabled={isLoading}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              {isLoading ? <div className="flex items-center text-muted-foreground">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Dosya işleniyor...
                </div> : <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Dosya yüklendi, işleniyor...</span>
                </div>}
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
};
export default UploadSection;