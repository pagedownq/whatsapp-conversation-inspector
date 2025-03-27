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

// New patterns for apology detection
const apologyPatterns = [
  { pattern: /(?:özür dilerim|üzgünüm|kusura bakma|affet|pardon|beni affet|af dilerim|özür|pişmanım|hata yaptım)/i, type: 'apology' },
  { pattern: /(?:sorry|apologize|forgive me|my bad|my fault|I was wrong)/i, type: 'apology' }
];

// New patterns for love expressions
const loveExpressionPatterns = [
  { pattern: /(?:seni seviyorum|aşkım|sevgilim|canım|hayatım|seni çok seviyorum|aşk|sevgi|kalp|kalbin|gönlün)/i, type: 'love' },
  { pattern: /(?:I love you|love you|my love|my heart|darling|sweetheart|honey)/i, type: 'love' }
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

export interface ApologyResult {
  found: boolean;
  instances: Array<{
    text: string;
  }>;
}

export interface LoveExpressionResult {
  found: boolean;
  instances: Array<{
    text: string;
  }>;
  containsILoveYou: boolean;
}

// Communication style analysis
export interface CommunicationStyleResult {
  primary: 'direct' | 'passive' | 'aggressive' | 'passive-aggressive' | 'assertive' | 'mixed';
  assertiveScore: number;  // 0 to 1
  aggressiveScore: number; // 0 to 1
  passiveScore: number;    // 0 to 1
  passiveAggressiveScore: number; // 0 to 1
  formality: number;       // 0 to 1 (informal to formal)
  directness: number;      // 0 to 1 (indirect to direct)
}

// Intimacy analysis
export interface IntimacyAnalysisResult {
  level: 'low' | 'medium' | 'high';
  score: number; // 0 to 1
  indicators: string[];
  consistency: number; // 0 to 1
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
 * Detect apologies in a given text
 */
export function detectApologies(text: string): ApologyResult {
  let instances: Array<{ text: string }> = [];
  
  // Check for apology patterns
  apologyPatterns.forEach(pattern => {
    const matches = text.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        instances.push({
          text: match
        });
      });
    }
  });
  
  return {
    found: instances.length > 0,
    instances
  };
}

/**
 * Detect love expressions in a given text
 */
export function detectLoveExpressions(text: string): LoveExpressionResult {
  let instances: Array<{ text: string }> = [];
  let containsILoveYou = false;
  
  // Check for love expression patterns
  loveExpressionPatterns.forEach(pattern => {
    const matches = text.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        instances.push({
          text: match
        });
        
        // Check for specific "I love you" expressions
        if (/seni seviyorum|I love you/i.test(match)) {
          containsILoveYou = true;
        }
      });
    }
  });
  
  return {
    found: instances.length > 0,
    instances,
    containsILoveYou
  };
}

/**
 * Analyze communication style in a message
 */
export function analyzeCommunicationStyle(text: string): CommunicationStyleResult {
  // Simple analysis based on keywords and patterns
  const assertivePatterns = /(?:düşünüyorum|hissediyorum|inanıyorum|bence|sanırım|yapabiliriz|öneririm|I think|I feel|I believe|in my opinion|we could)/i;
  const aggressivePatterns = /(?:yapmalısın|zorundasın|asla|hemen|kesinlikle|you must|you have to|always|never|immediately)/i;
  const passivePatterns = /(?:belki|sanırım|olabilir|bilmiyorum|olur mu|maybe|perhaps|possibly|I guess|do you think)/i;
  const passiveAggressivePatterns = /(?:nasıl istersen|önemli değil|boşver|whatever|fine|doesn't matter|never mind)/i;
  
  // Calculate scores based on pattern matches
  const assertiveScore = assertivePatterns.test(text) ? 0.7 : 0.2;
  const aggressiveScore = aggressivePatterns.test(text) ? 0.7 : 0.2;
  const passiveScore = passivePatterns.test(text) ? 0.7 : 0.2;
  const passiveAggressiveScore = passiveAggressivePatterns.test(text) ? 0.7 : 0.2;
  
  // Calculate formality based on text characteristics
  const formalIndicators = /(?:saygılar|rica ederim|lütfen|iyi günler|merhaba|regards|please|sincerely|good day)/i;
  const informalIndicators = /(?:selam|hey|n'aber|napıyon|he ya|evet ya|yok ya|hi|hey|what's up|yeah)/i;
  
  const formality = formalIndicators.test(text) ? 0.8 : (informalIndicators.test(text) ? 0.2 : 0.5);
  
  // Calculate directness
  const directIndicators = /(?:doğrudan|direk|açıkça|açık olmak gerekirse|directly|clearly|frankly|to be honest)/i;
  const indirectIndicators = /(?:belki|galiba|sanki|acaba|aslında|perhaps|maybe|wonder|just)/i;
  
  const directness = directIndicators.test(text) ? 0.8 : (indirectIndicators.test(text) ? 0.2 : 0.5);
  
  // Determine primary style
  let primary: 'direct' | 'passive' | 'aggressive' | 'passive-aggressive' | 'assertive' | 'mixed' = 'mixed';
  
  const scores = [
    { style: 'assertive', score: assertiveScore },
    { style: 'aggressive', score: aggressiveScore },
    { style: 'passive', score: passiveScore },
    { style: 'passive-aggressive', score: passiveAggressiveScore }
  ];
  
  const maxScore = Math.max(...scores.map(s => s.score));
  const dominantStyles = scores.filter(s => s.score === maxScore);
  
  if (dominantStyles.length === 1) {
    primary = dominantStyles[0].style as any;
  } else if (assertiveScore > 0.5 && directness > 0.6) {
    primary = 'direct';
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
 * Analyze intimacy in a message
 */
export function analyzeIntimacy(text: string): IntimacyAnalysisResult {
  // Intimacy indicators (keywords and patterns)
  const highIntimacyIndicators = [
    /(?:seni seviyorum|aşkım|canım|hayatım|özledim|özlüyorum|I love you|miss you|my love|my heart)/i,
    /(?:özel|mahrem|secret|intimate|personal|private)/i,
    /(?:yalnızca seninle|sadece senin|only with you|just you and me)/i
  ];
  
  const mediumIntimacyIndicators = [
    /(?:arkadaşım|dostum|friend|buddy|pal)/i,
    /(?:paylaşmak|share|birlikte|together)/i,
    /(?:güveniyorum|trust|believe in you)/i
  ];
  
  // Count occurrences of intimacy indicators
  let highCount = 0;
  let mediumCount = 0;
  
  highIntimacyIndicators.forEach(pattern => {
    if (pattern.test(text)) highCount++;
  });
  
  mediumIntimacyIndicators.forEach(pattern => {
    if (pattern.test(text)) mediumCount++;
  });
  
  // Calculate intimacy score
  const score = (highCount * 0.2) + (mediumCount * 0.1);
  const normalizedScore = Math.min(score, 1);
  
  // Determine intimacy level
  let level: 'low' | 'medium' | 'high' = 'low';
  if (normalizedScore > 0.5) level = 'high';
  else if (normalizedScore > 0.2) level = 'medium';
  
  // Collect indicators found
  const indicators: string[] = [];
  
  if (/(?:seni seviyorum|I love you)/i.test(text)) indicators.push('Love expressions');
  if (/(?:özledim|miss you)/i.test(text)) indicators.push('Missing expressions');
  if (/(?:güveniyorum|trust)/i.test(text)) indicators.push('Trust expressions');
  if (/(?:özel|secret|intimate)/i.test(text)) indicators.push('Sharing secrets');
  
  return {
    level,
    score: normalizedScore,
    indicators,
    consistency: 0.5 // This would ideally be calculated over time
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
