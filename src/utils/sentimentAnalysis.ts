
/**
 * Enhanced sentiment analysis utility for detecting emotions and manipulative language
 */

// Basic emotion word dictionaries
const emotionDictionaries = {
  positive: [
    'mutlu', 'harika', 'güzel', 'iyi', 'sevgi', 'aşk', 'teşekkür', 'muhteşem', 'harikasın',
    'seviyorum', 'güzelsin', 'müthiş', 'eğlenceli', 'keyifli', 'gülümseme', 'sevinç', 'güleç',
    'başarı', 'bravo', 'mükemmel', 'sevgili', 'tatlı', 'canım', 'memnun', 'gurur', 'şanslı',
    'neşeli', 'minnettar', 'heyecanlı', 'coşkulu', 'aferin', 'sağol', 'sağ ol', 'süper',
    'tamam', 'olumlu', 'doğru', 'evet', 'olur', 'rahat', 'kolay', 'güven', 'happy', 'great', 'good',
    // New positive terms
    'başardın', 'gurur duyuyorum', 'destekliyorum', 'yanındayım', 'sevgiler', 'öpüyorum',
    'cesursun', 'akıllısın', 'zekisin', 'yeteneklisin', 'özelsin', 'değerlisin', 'saygı',
    'takdir', 'alkış', 'gülümse', 'kahkaha', 'eğlen', 'kutlarım', 'başarılar', 'tebrikler'
  ],
  negative: [
    'üzgün', 'kötü', 'berbat', 'kızgın', 'sinirli', 'mutsuz', 'nefret', 'korku', 'endişe',
    'nefret ediyorum', 'kırgın', 'bıktım', 'sıkıldım', 'yoruldum', 'şikayet', 'korkuyorum',
    'endişeliyim', 'acı', 'ağlamak', 'ağrı', 'rahatsız', 'üzülmek', 'kaygı', 'öfke', 'yalnız',
    'sorun', 'problem', 'sıkıntı', 'kriz', 'stres', 'gergin', 'pişman', 'üzülüyorum', 'olmaz',
    'yok', 'hayır', 'istemiyorum', 'zor', 'imkansız', 'olmadı', 'yapamıyorum', 'sad', 'bad', 'angry',
    // New negative terms
    'kızıyorum', 'sinirlendim', 'deliriyorum', 'çıldırıyorum', 'kahretsin', 'lanet olsun',
    'iğrenç', 'tiksiniyorum', 'yetersiz', 'başarısız', 'beceriksiz', 'hayal kırıklığı',
    'umutsuz', 'çaresiz', 'mahvoldum', 'mahvettim', 'yalnızım', 'terk edilmiş', 'dışlanmış',
    'kaybolmuş', 'incinmiş', 'yaralanmış', 'acı çekiyorum', 'ağlıyorum', 'yakınıyorum'
  ],
  neutral: [
    'tamam', 'belki', 'olabilir', 'bilmiyorum', 'anladım', 'görüyorum', 'bakacağım', 
    'düşüneceğim', 'öyle', 'şöyle', 'ne', 'kim', 'nasıl', 'neden', 'nerede', 'ne zaman',
    'peki', 'şey', 'aslında', 'herhalde', 'galiba', 'sanırım', 'normal', 'olağan',
    'var', 'yok', 'evet', 'hayır', 'ok', 'ok',
    // New neutral terms
    'düşünüyorum', 'sanıyorum', 'tahmin ediyorum', 'fark ettim', 'gördüm', 'duydum',
    'söylüyorum', 'anlatıyorum', 'gösteriyorum', 'açıklıyorum', 'hatırlıyorum', 'unutuyorum',
    'durum', 'olay', 'şekil', 'biçim', 'tarz', 'tip', 'çeşit', 'tür', 'sınıf', 'kategori'
  ]
};

// Extended emotion categories
const advancedEmotions = {
  joy: ['sevinç', 'mutluluk', 'neşe', 'keyif', 'haz', 'eğlence', 'kahkaha', 'coşku', 'memnuniyet'],
  love: ['sevgi', 'aşk', 'tutku', 'şefkat', 'yakınlık', 'bağlılık', 'sadakat', 'adanmışlık'],
  surprise: ['şaşkınlık', 'hayret', 'şok', 'şaşırtıcı', 'beklenmedik', 'inanılmaz', 'vay'],
  anger: ['öfke', 'kızgınlık', 'sinir', 'hiddet', 'gazap', 'hışım', 'kin', 'nefret'],
  sadness: ['üzüntü', 'hüzün', 'keder', 'acı', 'melankoli', 'dert', 'gam', 'kasvet', 'çöküntü'],
  fear: ['korku', 'endişe', 'kaygı', 'tedirginlik', 'dehşet', 'panik', 'fobi', 'ürküntü'],
  disgust: ['iğrenme', 'tiksinti', 'hoşnutsuzluk', 'nefret', 'tahammülsüzlük'],
  shame: ['utanç', 'mahcubiyet', 'rezillik', 'küçük düşme', 'sıkılganlık', 'çekingenlik'],
  guilt: ['suçluluk', 'pişmanlık', 'vicdan azabı', 'kendini suçlama', 'sorumluluk hissi']
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
  { pattern: /(?:ben ben ben|hep benim dediğim|sadece beni düşün|bana ne|sen benim için)/i, weight: 0.6, type: 'egocentric' },

  // New: Deception patterns
  { pattern: /(?:yalan söylemiyorum|yemin ederim|inan bana|gerçekten|vallahi|billahi|aslında öyle değil)/i, weight: 0.7, type: 'deception' },
  
  // New: Deflection patterns
  { pattern: /(?:konuyu değiştirme|asıl senin|sen de yapmıştın|ama sen|seninkisi daha kötü|senin yaptıklarını unutma)/i, weight: 0.7, type: 'deflection' },
  
  // New: Projection patterns
  { pattern: /(?:aslında sen|sen öylesin|senin problemin|sen benden daha)/i, weight: 0.8, type: 'projection' },
  
  // New: Triangulation patterns
  { pattern: /(?:başkaları da aynısını söylüyor|herkes öyle düşünüyor|arkadaşlarım da|x de öyle diyor|x seni sevmiyor|x de beni haklı buluyor)/i, weight: 0.8, type: 'triangulation' },
  
  // New: Love bombing patterns
  { pattern: /(?:hayatımın aşkısın|kimseyi bu kadar sevmedim|sensiz yaşayamam|sen bambaşkasın|sen mükemmelsin|seninle çok mutluyum)/i, weight: 0.6, type: 'love-bombing' }
];

// Communication style indicators
const communicationStyles = {
  assertive: [
    'düşünüyorum', 'hissediyorum', 'istiyorum', 'tercih ederim', 'gereksinim duyuyorum',
    'bence', 'bana göre', 'anladığım kadarıyla', 'saygı duyuyorum', 'anlıyorum',
    'think', 'feel', 'want', 'prefer', 'need', 'in my opinion', 'understand', 'respect'
  ],
  aggressive: [
    'yapmalısın', 'zorundasın', 'mecbursun', 'saçmalama', 'aptalca', 'hemen', 'şimdi',
    'asla', 'her zaman', 'kesinlikle', 'must', 'have to', 'stupid', 'ridiculous', 'always', 'never'
  ],
  passive: [
    'belki', 'sanırım', 'galiba', 'olabilir', 'bilmiyorum', 'özür dilerim', 'rahatsız ettiysem',
    'maybe', 'perhaps', 'guess', 'sorry', 'if it's okay', 'don't know', 'whatever you want'
  ],
  passiveAggressive: [
    'nasıl istersen', 'sen bilirsin', 'önemli değil zaten', 'neyse', 'fine', 'whatever', 
    'doesn't matter', 'don't care', 'if you say so', 'sure, do what you want'
  ]
};

// Intimacy language patterns
const intimacyPatterns = {
  high: [
    'seviyorum', 'aşkım', 'canım', 'hayatım', 'bebeğim', 'meleğim', 'biricik', 'özledim',
    'sarılmak', 'öpmek', 'love', 'miss', 'honey', 'baby', 'hug', 'kiss'
  ],
  medium: [
    'hoşlanıyorum', 'değer veriyorum', 'önemsiyorum', 'düşünüyorum', 'merak ediyorum',
    'like', 'care', 'think about', 'wonder', 'appreciate'
  ],
  low: [
    'iyi', 'tamam', 'peki', 'görüşürüz', 'sonra', 'belki', 'bilmiyorum',
    'ok', 'fine', 'later', 'see you', 'perhaps', 'don\'t know'
  ]
};

export interface SentimentResult {
  score: number;  // -1 to 1 (negative to positive)
  dominant: 'positive' | 'negative' | 'neutral';
  positiveWordCount: number;
  negativeWordCount: number;
  neutralWordCount: number;
  // New fields
  emotionBreakdown: Record<string, number>;
  emotionTrend: 'increasing' | 'decreasing' | 'stable';
  intensityLevel: 'low' | 'medium' | 'high';
}

export interface ManipulationResult {
  score: number;  // 0 to 1 (higher means more manipulative)
  instances: Array<{
    text: string;
    type: string;
    weight: number;
  }>;
  dominantType: string;
  severity: 'low' | 'medium' | 'high';
}

export interface CommunicationStyleResult {
  primary: 'assertive' | 'aggressive' | 'passive' | 'passive-aggressive' | 'mixed';
  assertiveScore: number;
  aggressiveScore: number;
  passiveScore: number;
  passiveAggressiveScore: number;
  formality: number; // 0-1 scale, higher is more formal
  directness: number; // 0-1 scale, higher is more direct
}

export interface IntimacyAnalysisResult {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-1 scale
  indicators: string[];
  consistency: number; // 0-1 scale, how consistent the intimacy level is
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
  
  // Emotion breakdown counter
  const emotionCount: Record<string, number> = {};
  Object.keys(advancedEmotions).forEach(emotion => {
    emotionCount[emotion] = 0;
  });
  
  words.forEach(word => {
    // Clean the word from punctuation
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    
    // Check basic sentiment
    if (emotionDictionaries.positive.some(term => cleanWord.includes(term))) {
      positiveWordCount++;
    } else if (emotionDictionaries.negative.some(term => cleanWord.includes(term))) {
      negativeWordCount++;
    } else if (emotionDictionaries.neutral.some(term => cleanWord.includes(term))) {
      neutralWordCount++;
    }
    
    // Check specific emotions
    Object.entries(advancedEmotions).forEach(([emotion, terms]) => {
      if (terms.some(term => cleanWord.includes(term))) {
        emotionCount[emotion]++;
      }
    });
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
  
  // Calculate intensity level
  let intensityLevel: 'low' | 'medium' | 'high' = 'low';
  const totalWords = words.length;
  const emotionalRatio = totalEmotionalWords / Math.max(totalWords, 1);
  
  if (emotionalRatio > 0.3) {
    intensityLevel = 'high';
  } else if (emotionalRatio > 0.15) {
    intensityLevel = 'medium';
  }
  
  // For this example, we're setting a static emotion trend
  // In a real application, this would be calculated by analyzing multiple messages over time
  const emotionTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  
  return {
    score,
    dominant,
    positiveWordCount,
    negativeWordCount,
    neutralWordCount,
    emotionBreakdown: emotionCount,
    emotionTrend,
    intensityLevel
  };
}

/**
 * Detect manipulative language in a given text
 */
export function detectManipulation(text: string): ManipulationResult {
  let instances: Array<{text: string, type: string, weight: number}> = [];
  let totalWeight = 0;
  const typeCount: Record<string, number> = {};
  
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
        
        // Count instances by type
        typeCount[pattern.type] = (typeCount[pattern.type] || 0) + 1;
      });
    }
  });
  
  // Normalize score between 0 and 1
  const score = Math.min(totalWeight, 1);
  
  // Determine dominant manipulation type
  let dominantType = 'none';
  let maxCount = 0;
  
  Object.entries(typeCount).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type;
    }
  });
  
  // Determine severity level
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (score > 0.7) {
    severity = 'high';
  } else if (score > 0.3) {
    severity = 'medium';
  }
  
  return {
    score,
    instances,
    dominantType,
    severity
  };
}

/**
 * Analyze communication style in text
 */
export function analyzeCommunicationStyle(text: string): CommunicationStyleResult {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  
  let assertiveScore = 0;
  let aggressiveScore = 0;
  let passiveScore = 0;
  let passiveAggressiveScore = 0;
  
  // Check for style indicators
  words.forEach(word => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    
    if (communicationStyles.assertive.some(term => cleanWord.includes(term))) {
      assertiveScore++;
    }
    
    if (communicationStyles.aggressive.some(term => cleanWord.includes(term))) {
      aggressiveScore++;
    }
    
    if (communicationStyles.passive.some(term => cleanWord.includes(term))) {
      passiveScore++;
    }
    
    if (communicationStyles.passiveAggressive.some(term => cleanWord.includes(term))) {
      passiveAggressiveScore++;
    }
  });
  
  // Calculate formality based on sentence structure, punctuation, and word choice
  const formalityIndicators = text.match(/[.,:;]|lütfen|rica|saygılar|please|sincerely|regards/gi)?.length || 0;
  const informalityIndicators = text.match(/[!?]|haha|ahaha|ya|yani|hey|hadi|abi|kanka|knk/gi)?.length || 0;
  
  const formality = calculateNormalizedRatio(formalityIndicators, informalityIndicators);
  
  // Calculate directness based on sentence structure and explicitness
  const directIndicators = text.match(/\b(doğrudan|açıkça|kesinlikle|net|specifically|clearly|definitely)\b/gi)?.length || 0;
  const indirectIndicators = text.match(/\b(belki|sanırım|galiba|olabilir|perhaps|maybe|possibly|might)\b/gi)?.length || 0;
  
  const directness = calculateNormalizedRatio(directIndicators, indirectIndicators);
  
  // Normalize scores
  const totalScore = assertiveScore + aggressiveScore + passiveScore + passiveAggressiveScore;
  if (totalScore > 0) {
    assertiveScore /= totalScore;
    aggressiveScore /= totalScore;
    passiveScore /= totalScore;
    passiveAggressiveScore /= totalScore;
  }
  
  // Determine primary communication style
  let primary: 'assertive' | 'aggressive' | 'passive' | 'passive-aggressive' | 'mixed' = 'mixed';
  const scores = [
    {style: 'assertive', score: assertiveScore},
    {style: 'aggressive', score: aggressiveScore},
    {style: 'passive', score: passiveScore},
    {style: 'passive-aggressive', score: passiveAggressiveScore}
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  // If the top score is significantly higher than the second, it's the primary style
  if (scores[0].score > 0 && scores[0].score > scores[1].score * 1.5) {
    primary = scores[0].style as any;
  }
  
  return {
    primary,
    assertiveScore,
    aggressiveScore,
    passiveScore,
    passiveAggressiveScore,
    formality,
    directness
  };
}

/**
 * Analyze intimacy level in text
 */
export function analyzeIntimacy(text: string): IntimacyAnalysisResult {
  const normalizedText = text.toLowerCase();
  
  let highIntimacyCount = 0;
  let mediumIntimacyCount = 0;
  let lowIntimacyCount = 0;
  const foundIndicators: string[] = [];
  
  // Check for intimacy patterns
  intimacyPatterns.high.forEach(term => {
    if (normalizedText.includes(term)) {
      highIntimacyCount++;
      foundIndicators.push(term);
    }
  });
  
  intimacyPatterns.medium.forEach(term => {
    if (normalizedText.includes(term)) {
      mediumIntimacyCount++;
      foundIndicators.push(term);
    }
  });
  
  intimacyPatterns.low.forEach(term => {
    if (normalizedText.includes(term)) {
      lowIntimacyCount++;
      foundIndicators.push(term);
    }
  });
  
  // Calculate total weighted score
  const totalScore = (highIntimacyCount * 3) + (mediumIntimacyCount * 2) + lowIntimacyCount;
  const maxPossibleScore = Math.max(
    (intimacyPatterns.high.length * 3),
    (intimacyPatterns.medium.length * 2),
    intimacyPatterns.low.length
  );
  
  // Normalize to 0-1 scale
  const score = Math.min(totalScore / maxPossibleScore, 1);
  
  // Determine level
  let level: 'low' | 'medium' | 'high' = 'low';
  if (score > 0.6) {
    level = 'high';
  } else if (score > 0.3) {
    level = 'medium';
  }
  
  // Calculate consistency (this is a simplification)
  // In a real app, this would be based on variance across multiple messages
  const consistency = calculateConsistency(highIntimacyCount, mediumIntimacyCount, lowIntimacyCount);
  
  return {
    level,
    score,
    indicators: foundIndicators.slice(0, 5), // Return top 5 indicators
    consistency
  };
}

/**
 * Calculate normalized ratio between two values
 */
function calculateNormalizedRatio(positive: number, negative: number): number {
  if (positive === 0 && negative === 0) return 0.5;
  return positive / (positive + negative);
}

/**
 * Calculate consistency based on variance of different levels
 */
function calculateConsistency(high: number, medium: number, low: number): number {
  const total = high + medium + low;
  if (total === 0) return 0.5;
  
  const highRatio = high / total;
  const mediumRatio = medium / total;
  const lowRatio = low / total;
  
  // Calculate variance
  const mean = (highRatio + mediumRatio + lowRatio) / 3;
  const variance = Math.sqrt(
    ((highRatio - mean) ** 2 + (mediumRatio - mean) ** 2 + (lowRatio - mean) ** 2) / 3
  );
  
  // Inverse of variance gives consistency (1 - normalized variance)
  return 1 - Math.min(variance * 2, 1);
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
    case 'deception':
      return 'Aldatma/Yalan';
    case 'deflection':
      return 'Saptırma';
    case 'projection':
      return 'Yansıtma';
    case 'triangulation':
      return 'Üçgenleme';
    case 'love-bombing':
      return 'Sevgi Bombardımanı';
    default:
      return 'Diğer';
  }
}

/**
 * Get communication style label in Turkish
 */
export function getCommunicationStyleLabel(style: string): string {
  switch (style) {
    case 'assertive':
      return 'Kendine Güvenli';
    case 'aggressive':
      return 'Agresif';
    case 'passive':
      return 'Pasif';
    case 'passive-aggressive':
      return 'Pasif-Agresif';
    case 'mixed':
      return 'Karma';
    default:
      return 'Belirsiz';
  }
}

/**
 * Get intimacy level label in Turkish
 */
export function getIntimacyLevelLabel(level: string): string {
  switch (level) {
    case 'high':
      return 'Yüksek';
    case 'medium':
      return 'Orta';
    case 'low':
      return 'Düşük';
    default:
      return 'Belirsiz';
  }
}
