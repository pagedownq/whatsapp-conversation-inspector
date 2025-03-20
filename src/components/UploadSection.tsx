
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadSectionProps {
  onFileProcessed: (content: string) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    let zipFile: File | null = null;
    
    // Check for zip files
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const item = items[i].getAsFile();
        if (item && item.name.endsWith('.zip')) {
          zipFile = item;
          break;
        }
      }
    }
    
    if (zipFile) {
      processFile(zipFile);
    } else {
      toast.error("Lütfen .zip uzantılı dosya yükleyin");
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.zip')) {
      toast.error("Lütfen .zip uzantılı dosya yükleyin");
      return;
    }
    
    setIsLoading(true);
    setFile(selectedFile);
    
    try {
      // For demonstration, we'll just read the file
      // In a real app, we would extract the zip and find the .txt file
      // For now, just simulate reading the file
      setTimeout(() => {
        // Simulate chat content (this would actually come from the zip extraction)
        const simulatedContent = `23.05.2023 15:30 - Ahmet: Merhaba, nasılsın?
23.05.2023 15:32 - Mehmet: İyiyim, sen nasılsın?
23.05.2023 15:33 - Ahmet: Ben de iyiyim, teşekkürler!
23.05.2023 15:35 - Mehmet: Bugün planların neler?
23.05.2023 15:38 - Ahmet: Akşam bir film izleyeceğim 🎬
23.05.2023 15:40 - Mehmet: Hangi film? 🤔
23.05.2023 15:42 - Ahmet: Inception düşünüyorum
23.05.2023 15:45 - Mehmet: Harika bir seçim! 👍`;
        
        onFileProcessed(simulatedContent);
        setIsLoading(false);
        toast.success("Dosya başarıyla işlendi");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Dosya işlenirken bir hata oluştu");
      setIsLoading(false);
    }
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

  return (
    <motion.div 
      className="w-full max-w-xl mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".zip"
        className="hidden"
        aria-label="Dosya yükle"
      />
      
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload-area"
            className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-secondary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-display font-medium text-lg mb-2">WhatsApp Sohbet Dosyanızı Yükleyin</h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-md">
                Sohbetinizin .zip dosyasını sürükleyip bırakın veya bilgisayarınızdan seçin
              </p>
              
              <button
                className="bg-primary rounded-full px-5 py-2.5 text-primary-foreground font-medium shadow-soft hover:shadow-lg btn-transition"
                onClick={handleButtonClick}
              >
                Dosya Seç
              </button>
              
              <p className="mt-4 text-xs text-muted-foreground">
                WhatsApp &gt; Sohbet &gt; Dışa Aktar &gt; Medya olmadan
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            className="bg-card rounded-2xl p-6 shadow-soft"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
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
              
              <button 
                onClick={handleRemoveFile} 
                className="p-1.5 text-muted-foreground hover:text-destructive btn-transition rounded-full hover:bg-destructive/10"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center text-muted-foreground">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Dosya işleniyor...
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Dosya yüklendi, işleniyor...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadSection;
