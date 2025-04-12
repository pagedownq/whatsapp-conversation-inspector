
import { ChatData, ChatStats, ParticipantStats } from "@/types";
import { exportWordCloudData } from "./wordCloudUtils";

export function exportAnalysisToCSV(
  chatData: ChatData,
  stats: ChatStats,
  participantStats: Record<string, ParticipantStats>,
  uniqueParticipants: string[],
  wordFrequencies: Record<string, { [word: string]: number }>
): void {
  const rows = [
    ["Toplam Mesaj", stats.totalMessages.toString()],
    ["Toplam Katılımcı", stats.totalParticipants.toString()],
    ["İlk Mesaj Tarihi", stats.firstMessageDate?.toLocaleDateString() || "Bilinmiyor"],
    ["Son Mesaj Tarihi", stats.lastMessageDate?.toLocaleDateString() || "Bilinmiyor"],
    ["Toplam Medya", stats.mediaCount?.toString() || "0"],
    ["Ortalama Mesaj Uzunluğu", stats.avgMessageLength?.toFixed(2) || "0"],
    [""],
  ];

  // Katılımcı istatistikleri
  rows.push(["Katılımcı İstatistikleri"]);
  rows.push(["Katılımcı", "Mesaj Sayısı", "Ortalama Mesaj Uzunluğu", "Emoji Sayısı", "Medya Sayısı"]);

  uniqueParticipants.forEach((participant) => {
    const participantStat = participantStats[participant];
    if (!participantStat) return;

    rows.push([
      participant,
      participantStat.messageCount.toString(),
      (participantStat.totalCharacters / Math.max(1, participantStat.messageCount)).toFixed(2),
      participantStat.emojiCount.toString(),
      participantStat.mediaCount.toString(),
    ]);
  });

  // Boş satır ekleyelim
  rows.push([""]);

  // En çok kullanılan kelimeler
  rows.push(["En Çok Kullanılan Kelimeler"]);
  uniqueParticipants.forEach((participant) => {
    rows.push([participant]);
    rows.push(["Kelime", "Frekans"]);

    const participantWords = wordFrequencies[participant];
    if (participantWords) {
      const sortedWords = Object.entries(participantWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      sortedWords.forEach(([word, frequency]) => {
        rows.push([word, frequency.toString()]);
      });
    }
    rows.push([""]);
  });

  // CSV formatına dönüştür
  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((row) => row.join(",")).join("\n");

  // İndir
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "whatsapp_analiz.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
