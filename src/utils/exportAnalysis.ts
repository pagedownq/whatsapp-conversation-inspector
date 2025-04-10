
import { ChatStats, ParticipantStats } from './analyzeChat';
import { getManipulationTypeLabel } from './sentimentAnalysis';

interface ExportData {
  generalStats: string;
  participantStats: string;
  sentimentAnalysis: string;
  relationshipAnalysis: string;
  wordAnalysis: string;
}

export const exportAnalysisToCSV = (stats: ChatStats): ExportData => {
  // Genel İstatistikler
  const generalStats = [
    'Metrik,Değer',
    `Toplam Mesaj,${stats.totalMessages}`,
    `Toplam Kelime,${stats.totalWords}`,
    `Toplam Emoji,${stats.totalEmojis}`,
    `Toplam Medya,${stats.mediaStats.total || stats.mediaStats.images + stats.mediaStats.videos + stats.mediaStats.documents + stats.mediaStats.links + stats.mediaStats.stickers + stats.mediaStats.gifs + stats.mediaStats.audio}`,
    `Ortalama Mesaj Uzunluğu,${stats.totalWords / stats.totalMessages}`,
    `Başlangıç Tarihi,${stats.startDate}`,
    `Bitiş Tarihi,${stats.endDate}`,
  ].join('\n');

  // Katılımcı İstatistikleri
  const participantHeaders = [
    'Katılımcı',
    'Mesaj Sayısı',
    'Kelime Sayısı',
    'Emoji Sayısı',
    'Ortalama Mesaj Uzunluğu',
    'Fotoğraf',
    'Video',
    'Belge',
    'Link',
    'Çıkartma',
    'GIF',
    'Ses',
  ].join(',');

  const participantRows = Object.entries(stats.participantStats).map(([name, data]) => [
    name,
    data.messageCount,
    data.wordCount,
    data.emojiCount,
    data.averageMessageLength,
    data.mediaStats.images,
    data.mediaStats.videos,
    data.mediaStats.documents,
    data.mediaStats.links,
    data.mediaStats.stickers,
    data.mediaStats.gifs,
    data.mediaStats.audio,
  ].join(','));

  const participantStats = [participantHeaders, ...participantRows].join('\n');

  // Duygu Analizi
  const sentimentHeaders = [
    'Katılımcı',
    'Ortalama Duygu Puanı',
    'Pozitif Mesaj Sayısı',
    'Negatif Mesaj Sayısı',
    'Nötr Mesaj Sayısı',
    'Manipülasyon Puanı',
  ].join(',');

  const sentimentRows = Object.entries(stats.participantStats).map(([name, data]) => [
    name,
    data.sentiment.averageScore,
    data.sentiment.positiveMsgCount,
    data.sentiment.negativeMsgCount,
    data.sentiment.neutralMsgCount,
    data.manipulation.averageScore,
  ].join(','));

  const sentimentAnalysis = [sentimentHeaders, ...sentimentRows].join('\n');

  // İlişki Analizi
  const relationshipHeaders = [
    'Katılımcı',
    'Sevgi İfadeleri',
    'Seni Seviyorum Sayısı',
    'Özür Dileme Sayısı',
  ].join(',');

  const relationshipRows = Object.entries(stats.participantStats).map(([name, data]) => [
    name,
    data.loveExpressions.count,
    data.loveExpressions.iLoveYouCount,
    data.apologies.count,
  ].join(','));

  const relationshipAnalysis = [relationshipHeaders, ...relationshipRows].join('\n');

  // Kelime Analizi
  const wordHeaders = [
    'Kelime',
    'Kullanım Sayısı',
    'Katılımcı',
  ].join(',');

  const wordRows = Object.entries(stats.participantStats).flatMap(([name, data]) =>
    data.topWords.slice(0, 10).map(word => [
      word.text,
      word.count,
      name,
    ].join(','))
  );

  const wordAnalysis = [wordHeaders, ...wordRows].join('\n');

  return {
    generalStats,
    participantStats,
    sentimentAnalysis,
    relationshipAnalysis,
    wordAnalysis,
  };
};

export const downloadCSV = (data: ExportData) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `whatsapp-analiz-${timestamp}.csv`;

  // Tüm bölümleri birleştir
  const sections = [
    '\n--- GENEL İSTATİSTİKLER ---\n',
    data.generalStats,
    '\n\n--- KATILIMCI İSTATİSTİKLERİ ---\n',
    data.participantStats,
    '\n\n--- DUYGU ANALİZİ ---\n',
    data.sentimentAnalysis,
    '\n\n--- İLİŞKİ ANALİZİ ---\n',
    data.relationshipAnalysis,
    '\n\n--- KELİME ANALİZİ ---\n',
    data.wordAnalysis
  ];

  const combinedContent = sections.join('\n');
  const blob = new Blob([`\uFEFF${combinedContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
