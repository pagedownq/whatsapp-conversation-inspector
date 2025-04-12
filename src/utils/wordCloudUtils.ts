
export function exportWordCloudData(
  wordFrequencies: Record<string, { [word: string]: number }>
): void {
  // Word cloud veri dışa aktarma işlemi buraya gelecek
  console.log("Word cloud data exported", wordFrequencies);
}
