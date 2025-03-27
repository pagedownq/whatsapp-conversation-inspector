
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

// Intimacy analysis patterns
const intimacyPatterns = [
  { pattern: /(?:seni seviyorum|aşkım|sevgilim|canım|hayatım|tatlım|özledim|öpüyorum)/i, weight: 0.9, type: 'affection' },
  { pattern: /(?:güveniyorum sana|inanıyorum|yanındayım|destekliyorum|her zaman|yanında olacağım)/i, weight: 0.8, type: 'trust' },
  { pattern: /(?:bizim|beraber|birlikte|paylaşmak|geleceğimiz|planlarımız|hayallerimiz)/i, weight: 0.7, type: 'commitment' },
  { pattern: /(?:anlıyorum|dinliyorum|hissediyorum|empati|nasıl hissettiğini)/i, weight: 0.6, type: 'empathy' }
];

// Communication style patterns
const communicationPatterns = {
  assertive: [
    /(?:bence|düşünüyorum ki|hissediyorum|istiyorum|ihtiyacım var|tercihim)/i
  ],
  aggressive: [
    /(?:saçmalama|aptalsın|sus|dinle beni|hemen|şimdi|zorunda|mecbursun)/i
  ],
  passive: [
    /(?:sanırım|galiba|belki|olabilir mi acaba|rahatsız etmezsem|sorun olmazsa|bence ama)/i
  ],
  passiveAggressive: [
    /(?:her neyse|boşver|önemli değil|nasıl istersen|neyse|sana göre|senin dediğin gibi olsun)/i
  ]
};

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

export interface CommunicationStyleResult {
  primary: 'assertive' | 'aggressive' | 'passive' | 'passive-aggressive' | 'mixed';
  assertiveScore: number;
  aggressiveScore: number;
  passiveScore: number;
  passiveAggressiveScore: number;
  formality: number;
  directness: number;
}

export interface IntimacyAnalysisResult {
  level: 'low' | 'medium' | 'high';
  score: number;
  indicators: Array<string>;
  consistency: number;
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
 * Analyze communication style of a given text
 */
export function analyzeCommunicationStyle(text: string): CommunicationStyleResult {
  const normalizedText = text.toLowerCase();
  
  let assertiveScore = 0;
  let aggressiveScore = 0;
  let passiveScore = 0;
  let passiveAggressiveScore = 0;
  
  // Check for assertion patterns
  communicationPatterns.assertive.forEach(pattern => {
    if (pattern.test(normalizedText)) assertiveScore += 0.2;
  });
  
  // Check for aggressive patterns
  communicationPatterns.aggressive.forEach(pattern => {
    if (pattern.test(normalizedText)) aggressiveScore += 0.2;
  });
  
  // Check for passive patterns
  communicationPatterns.passive.forEach(pattern => {
    if (pattern.test(normalizedText)) passiveScore += 0.2;
  });
  
  // Check for passive-aggressive patterns
  communicationPatterns.passiveAggressive.forEach(pattern => {
    if (pattern.test(normalizedText)) passiveAggressiveScore += 0.2;
  });
  
  // Determine primary style
  const scores = [
    { style: 'assertive', score: assertiveScore },
    { style: 'aggressive', score: aggressiveScore },
    { style: 'passive', score: passiveScore },
    { style: 'passive-aggressive', score: passiveAggressiveScore }
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  // Determine primary style
  let primary: 'assertive' | 'aggressive' | 'passive' | 'passive-aggressive' | 'mixed' = 'mixed';
  if (scores[0].score > 0 && scores[0].score > scores[1].score * 1.5) {
    primary = scores[0].style as 'assertive' | 'aggressive' | 'passive' | 'passive-aggressive';
  }
  
  // Calculate formality based on text characteristics
  const formality = calculateFormality(text);
  
  // Calculate directness based on text characteristics
  const directness = calculateDirectness(text);
  
  return {
    primary,
    assertiveScore: Math.min(assertiveScore, 1),
    aggressiveScore: Math.min(aggressiveScore, 1),
    passiveScore: Math.min(passiveScore, 1),
    passiveAggressiveScore: Math.min(passiveAggressiveScore, 1),
    formality,
    directness
  };
}

/**
 * Analyze intimacy level in a given text
 */
export function analyzeIntimacy(text: string): IntimacyAnalysisResult {
  const normalizedText = text.toLowerCase();
  
  let totalScore = 0;
  const indicators: string[] = [];
  
  // Check for intimacy patterns
  intimacyPatterns.forEach(pattern => {
    const matches = normalizedText.match(pattern.pattern);
    if (matches) {
      matches.forEach(() => {
        totalScore += pattern.weight;
        if (!indicators.includes(pattern.type)) {
          indicators.push(pattern.type);
        }
      });
    }
  });
  
  // Determine intimacy level
  let level: 'low' | 'medium' | 'high' = 'low';
  if (totalScore > 0.7) {
    level = 'high';
  } else if (totalScore > 0.3) {
    level = 'medium';
  }
  
  // For consistency, we would typically analyze multiple messages
  // For a single message, we'll set a default value
  const consistency = 0.5;
  
  return {
    level,
    score: Math.min(totalScore, 1),
    indicators,
    consistency
  };
}

/**
 * Calculate formality level of text
 */
function calculateFormality(text: string): number {
  // Simple heuristics for formality
  let formalityScore = 0.5; // Start at neutral
  
  // Informal indicators
  if (text.includes('...')) formalityScore -= 0.1;
  if (text.match(/!{2,}/)) formalityScore -= 0.1;
  if (text.match(/\?\?\??/)) formalityScore -= 0.1;
  if (text.match(/haha|hehe|lol|ahah/i)) formalityScore -= 0.2;
  
  // Formal indicators
  if (text.match(/saygılarımla|merhaba|iyi günler|rica ederim|teşekkür ederim/i)) formalityScore += 0.2;
  if (text.match(/\b[A-Z][a-z]+ Bey\b|\b[A-Z][a-z]+ Hanım\b/)) formalityScore += 0.2;
  if (!text.match(/[\!\?]{2,}/)) formalityScore += 0.1;
  
  return Math.max(0, Math.min(1, formalityScore));
}

/**
 * Calculate directness level of text
 */
function calculateDirectness(text: string): number {
  // Simple heuristics for directness
  let directnessScore = 0.5; // Start at neutral
  
  // Indirect indicators
  if (text.match(/sanırım|galiba|belki|muhtemelen|olabilir/i)) directnessScore -= 0.15;
  if (text.match(/acaba|rica etsem|mümkün müdür|mümkün mü/i)) directnessScore -= 0.15;
  
  // Direct indicators
  if (text.match(/kesinlikle|mutlaka|şüphesiz|elbette|tabii ki/i)) directnessScore += 0.15;
  if (text.match(/^\w+\.$/)) directnessScore += 0.1; // Short, one-word sentences
  if (text.match(/yap|git|gel|ver|al/i)) directnessScore += 0.15;
  
  return Math.max(0, Math.min(1, directnessScore));
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
 * Get intimacy level description in Turkish
 */
export function getIntimacyLevelLabel(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'high': return 'Yüksek';
    case 'medium': return 'Orta';
    case 'low': return 'Düşük';
    default: return 'Belirsiz';
  }
}

/**
 * Get communication style label in Turkish
 */
export function getCommunicationStyleLabel(style: string): string {
  switch (style) {
    case 'assertive': return 'Yapıcı/İddialı';
    case 'aggressive': return 'Agresif';
    case 'passive': return 'Pasif';
    case 'passive-aggressive': return 'Pasif-Agresif';
    case 'mixed': return 'Karma';
    default: return 'Belirsiz';
  }
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
