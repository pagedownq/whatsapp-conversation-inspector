
/**
 * Simple sentiment analysis utility for detecting emotions and manipulative language
 */

// Basic emotion word dictionaries
const emotionDictionaries = {
  positive: [
    'mutlu', 'harika', 'güzel', 'iyi', 'sevgi', 'aşk', 'teşekkür', 'muhteşem', 'harikasın',
    'seviyorum', 'güzelsin', 'müthiş', 'eğlenceli', 'keyifli', 'gülümseme', 'sevinç', 'güleç',
    'başarı', 'bravo', 'mükemmel', 'sevgili', 'tatlı', 'canım', 'memnun', 'gurur', 'şanslı',
    'neşeli', 'minnettar', 'heyecanlı', 'coşkulu', 'aferin', 'sağol', 'sağ ol', 'süper',
    'tamam', 'olumlu', 'doğru', 'evet', 'olur', 'rahat', 'kolay', 'güven', 'happy', 'great', 'good'
  ],
  negative: [
    'üzgün', 'kötü', 'berbat', 'kızgın', 'sinirli', 'mutsuz', 'nefret', 'korku', 'endişe',
    'nefret ediyorum', 'kırgın', 'bıktım', 'sıkıldım', 'yoruldum', 'şikayet', 'korkuyorum',
    'endişeliyim', 'acı', 'ağlamak', 'ağrı', 'rahatsız', 'üzülmek', 'kaygı', 'öfke', 'yalnız',
    'sorun', 'problem', 'sıkıntı', 'kriz', 'stres', 'gergin', 'pişman', 'üzülüyorum', 'olmaz',
    'yok', 'hayır', 'istemiyorum', 'zor', 'imkansız', 'olmadı', 'yapamıyorum', 'sad', 'bad', 'angry'
  ],
  neutral: [
    'tamam', 'belki', 'olabilir', 'bilmiyorum', 'anladım', 'görüyorum', 'bakacağım', 
    'düşüneceğim', 'öyle', 'şöyle', 'ne', 'kim', 'nasıl', 'neden', 'nerede', 'ne zaman',
    'peki', 'şey', 'aslında', 'herhalde', 'galiba', 'sanırım', 'normal', 'olağan',
    'var', 'yok', 'evet', 'hayır', 'ok', 'ok'
  ]
};

// Manipulative language patterns
const manipulationPatterns = [
  // Guilt-tripping patterns
  { pattern: /(?:beni üzüyorsun|üzülüyorum senin yüzünden|neden bunu bana yapıyorsun|değer vermiyorsun|umursamıyorsun)/i, weight: 0.8, type: 'guilt-tripping' },
  
  // Gaslighting patterns
  { pattern: /(?:öyle bir şey söylemedim|öyle bir şey olmadı|yanlış hatırlıyorsun|saçmalıyorsun|kafanda kuruyorsun|hayal görüyorsun|paranoyaksın)/i, weight: 0.9, type: 'gaslighting' },
  
  // Emotional blackmail
  { pattern: /(?:beni sevmiyorsan|sevsen yapardın|umursasan|ilgilenseydin|istemiyorsan ben giderim|yapmazsan biter|ayrılırım|terk ederim)/i, weight: 0.7, type: 'emotional-blackmail' },
  
  // Silent treatment
  { pattern: /(?:konuşmuyorum artık|cevap vermeyeceğim|seninle konuşmak istemiyorum)/i, weight: 0.6, type: 'silent-treatment' },
  
  // Commanding/controlling language
  { pattern: /(?:yapmalısın|etmelisin|zorundasın|mecbursun|yapmak zorundasın|bana sormadan|izin vermiyorum|yasak|olmaz|yapamazsın)/i, weight: 0.6, type: 'controlling' },
  
  // Victimhood
  { pattern: /(?:ben hep mağdurum|bana hep kötü davranılıyor|kimse beni anlamıyor|herkes bana karşı|hep ben mi)/i, weight: 0.7, type: 'victimhood' },
  
  // Jealousy/possessiveness
  { pattern: /(?:kiminle konuştun|neredeydin|neden cevap vermedin|telefonunu görebilir miyim|kiminleydin|aldatıyorsun)/i, weight: 0.6, type: 'possessiveness' },
  
  // Passive aggression
  { pattern: /(?:nasıl istersen|senin bileceğin iş|sen bilirsin|önemli değil zaten|boşver|fark etmez|hiç önemli değilim|umursamıyorsun zaten)/i, weight: 0.5, type: 'passive-aggression' },
  
  // Egocentric expressions
  { pattern: /(?:ben ben ben|hep benim dediğim|sadece beni düşün|bana ne|sen benim için)/i, weight: 0.6, type: 'egocentric' }
];

export interface SentimentResult {
  score: number;  // -1 to 1 (negative to positive)
  dominant: 'positive' | 'negative' | 'neutral';
  positiveWordCount: number;
  negativeWordCount: number;
  neutralWordCount: number;
}

export interface ManipulationResult {
  score: number;  // 0 to 1 (higher means more manipulative)
  instances: Array<{
    text: string;
    type: string;
    weight: number;
  }>;
}

/**
 * Analyze sentiment of a given text
 */
export function analyzeSentiment(text: string): SentimentResult {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  
  let positiveWordCount = 0;
  let negativeWordCount = 0;
  let neutralWordCount = 0;
  
  words.forEach(word => {
    // Clean the word from punctuation
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    
    if (emotionDictionaries.positive.some(term => cleanWord.includes(term))) {
      positiveWordCount++;
    } else if (emotionDictionaries.negative.some(term => cleanWord.includes(term))) {
      negativeWordCount++;
    } else if (emotionDictionaries.neutral.some(term => cleanWord.includes(term))) {
      neutralWordCount++;
    }
  });
  
  // Calculate sentiment score (-1 to 1)
  const totalEmotionalWords = positiveWordCount + negativeWordCount;
  const score = totalEmotionalWords > 0 
    ? (positiveWordCount - negativeWordCount) / totalEmotionalWords 
    : 0;
  
  // Determine dominant sentiment
  let dominant: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveWordCount > negativeWordCount && positiveWordCount > neutralWordCount) {
    dominant = 'positive';
  } else if (negativeWordCount > positiveWordCount && negativeWordCount > neutralWordCount) {
    dominant = 'negative';
  }
  
  return {
    score,
    dominant,
    positiveWordCount,
    negativeWordCount,
    neutralWordCount
  };
}

/**
 * Detect manipulative language in a given text
 */
export function detectManipulation(text: string): ManipulationResult {
  let instances: Array<{text: string, type: string, weight: number}> = [];
  let totalWeight = 0;
  
  // Check for manipulation patterns
  manipulationPatterns.forEach(pattern => {
    const matches = text.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        instances.push({
          text: match,
          type: pattern.type,
          weight: pattern.weight
        });
        totalWeight += pattern.weight;
      });
    }
  });
  
  // Normalize score between 0 and 1
  const score = Math.min(totalWeight, 1);
  
  return {
    score,
    instances
  };
}

/**
 * Get color based on sentiment score
 */
export function getSentimentColor(score: number): string {
  if (score > 0.3) return '#2ed573'; // Positive - green
  if (score < -0.3) return '#ff4757'; // Negative - red
  return '#ffa502'; // Neutral - amber
}

/**
 * Get manipulation level description
 */
export function getManipulationLevel(score: number): string {
  if (score > 0.7) return 'Yüksek';
  if (score > 0.4) return 'Orta';
  if (score > 0.1) return 'Hafif';
  return 'Düşük';
}

/**
 * Get manipulation type label in Turkish
 */
export function getManipulationTypeLabel(type: string): string {
  switch (type) {
    case 'guilt-tripping':
      return 'Suçluluk Yaratma';
    case 'gaslighting':
      return 'Gaslighting';
    case 'emotional-blackmail':
      return 'Duygusal Şantaj';
    case 'silent-treatment':
      return 'Sessiz Muamele';
    case 'controlling':
      return 'Kontrol Etme';
    case 'victimhood':
      return 'Mağduriyet';
    case 'possessiveness':
      return 'Kıskançlık/Sahiplenme';
    case 'passive-aggression':
      return 'Pasif Agresiflik';
    case 'egocentric':
      return 'Benmerkezcilik';
    default:
      return 'Diğer';
  }
}
