
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

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
        // If it's a direct text file, read it
        const content = await readTextFile(selectedFile);
        onFileProcessed(content);
        toast.success("Dosya başarıyla işlendi");
      } else if (selectedFile.name.endsWith('.zip')) {
        // If it's a zip, extract and find txt file
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(selectedFile);
        
        // Find all text files in the zip
        const textFiles = Object.keys(zipContent.files).filter(filename => 
          filename.endsWith('.txt') && !zipContent.files[filename].dir
        );
        
        if (textFiles.length === 0) {
          throw new Error("Zip dosyasında WhatsApp sohbet metni bulunamadı");
        }
        
        // Use the first text file (usually there's only one)
        const textFile = textFiles[0];
        const content = await zipContent.files[textFile].async('string');
        
        // Some encoding fixes for Turkish characters if needed
        const processedContent = content
          .replace(/Ã¼/g, 'ü')
          .replace(/Ã§/g, 'ç')
          .replace(/ÅŸ/g, 'ş')
          .replace(/Ä±/g, 'ı')
          .replace(/Ã¶/g, 'ö')
          .replace(/ÄŸ/g, 'ğ')
          .replace(/Ä°/g, 'İ');
        
        onFileProcessed(processedContent);
        toast.success("WhatsApp sohbeti başarıyla işlendi");
      } else {
        throw new Error("Desteklenmeyen dosya formatı");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Dosya işlenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
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
        accept=".zip,.txt"
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
                Sohbetinizin .zip veya .txt dosyasını sürükleyip bırakın veya bilgisayarınızdan seçin
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
