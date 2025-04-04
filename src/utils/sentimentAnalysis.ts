
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

// Expanded emotion categories
const detailedEmotions = {
  joy: ['mutlu', 'sevinçli', 'neşeli', 'keyifli', 'eğlenceli', 'gülümseme', 'kahkaha', 'coşku', 'happy', 'excited'],
  love: ['sevgi', 'aşk', 'seviyorum', 'sevgilim', 'aşkım', 'canım', 'tatlım', 'love', 'darling', 'dear'],
  gratitude: ['teşekkür', 'minnettarım', 'sağol', 'memnunum', 'thanks', 'grateful', 'appreciate'],
  optimism: ['umut', 'inanç', 'umutlu', 'iyimser', 'hopeful', 'optimistic', 'positive'],
  sadness: ['üzgün', 'kederli', 'acı', 'hüzün', 'ağlamak', 'üzülüyorum', 'sad', 'depressed', 'hurt'],
  anger: ['kızgın', 'öfkeli', 'sinirli', 'sinir', 'kızıyorum', 'öfke', 'angry', 'furious', 'mad'],
  fear: ['korku', 'endişe', 'tedirginlik', 'korkuyorum', 'endişeliyim', 'scared', 'afraid', 'worried'],
  disgust: ['iğrenç', 'tiksiniyorum', 'nefret ediyorum', 'nefret', 'disgusting', 'hate', 'gross'],
  surprise: ['şaşkın', 'şaşırtıcı', 'inanamıyorum', 'vay', 'oha', 'wow', 'surprised', 'shocked'],
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

// Expanded manipulation patterns with more detail
const detailedManipulationPatterns = [
  // Guilt-tripping - expanded
  { pattern: /(?:yüzünden üzülüyorum|beni hayal kırıklığına uğrattın|bana bunu yapmaya hakkın yok|ben senin için neler yaptım|sen ise|nankör)/i, weight: 0.8, type: 'guilt-tripping' },
  
  // Gaslighting - expanded
  { pattern: /(?:deli misin|abartıyorsun|çok hassassın|her şeye alınıyorsun|öyle hissetmiş olamazsın|yanlış anlamışsın)/i, weight: 0.9, type: 'gaslighting' },
  
  // Stonewalling - new category
  { pattern: /(?:seninle konuşmak istemiyorum|cevap vermeyeceğim|sessizlik|suskunluk|konuyu değiştirme|görmezden gelme)/i, weight: 0.7, type: 'stonewalling' },
  
  // Threatening - new category
  { pattern: /(?:yaparsan|yapmazsan|söylersem|anlatırsam|gösterirsem|söylemezsem)/i, weight: 0.8, type: 'threatening' },
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

// Relationship quality indicators - NEW
const relationshipQualityIndicators = {
  positive: [
    { pattern: /(?:birlikte|beraber|paylaş|seninle olmak|yanında olmak)/i, weight: 0.6, type: 'togetherness' },
    { pattern: /(?:teşekkür ederim|minnettarım|takdir ediyorum|değer veriyorum)/i, weight: 0.7, type: 'gratitude' },
    { pattern: /(?:ben de seni seviyorum|ben de özledim|benim de canım)/i, weight: 0.8, type: 'reciprocity' },
    { pattern: /(?:seni anlıyorum|haklısın|doğru söylüyorsun)/i, weight: 0.6, type: 'understanding' },
    { pattern: /(?:seninle konuşmak güzel|seni dinlemek|seni duymak)/i, weight: 0.7, type: 'communication' }
  ],
  negative: [
    { pattern: /(?:beni anlamıyorsun|dinlemiyorsun|umursamıyorsun)/i, weight: 0.7, type: 'lack-understanding' },
    { pattern: /(?:her zaman aynısını yapıyorsun|sürekli|hiçbir zaman|hep sen)/i, weight: 0.6, type: 'generalizing' },
    { pattern: /(?:sen olmadan|ayrılmak|bırakmak|terk etmek)/i, weight: 0.8, type: 'separation-threat' },
    { pattern: /(?:sessiz kalma|cevap ver|konuş benimle)/i, weight: 0.6, type: 'communication-issues' },
    { pattern: /(?:kıskanç|güvenmiyorum|aldatma|aldattın mı|şüpheleniyorum)/i, weight: 0.7, type: 'trust-issues' }
  ]
};

export interface SentimentResult {
  score: number;  // -1 to 1 (negative to positive)
  dominant: 'positive' | 'negative' | 'neutral';
  positiveWordCount: number;
  negativeWordCount: number;
  neutralWordCount: number;
  detailedEmotions?: Record<string, number>; // New field for detailed emotions
  emotionalVariability?: number; // New field for emotional range
}

export interface ManipulationResult {
  score: number;  // 0 to 1 (higher means more manipulative)
  instances: Array<{
    text: string;
    type: string;
    weight: number;
  }>;
  breakdownByType?: Record<string, number>; // New field for detailed breakdown
}

export interface ApologyResult {
  found: boolean;
  instances: Array<{
    text: string;
  }>;
  sincerity?: number; // New field to estimate sincerity (0-1)
  context?: string; // New field for context analysis
}

export interface LoveExpressionResult {
  found: boolean;
  instances: Array<{
    text: string;
  }>;
  containsILoveYou: boolean;
  intensity?: number; // New field for intensity measurement (0-1)
  frequency?: number; // New field for frequency relative to message count
}

// New interface for relationship health
export interface RelationshipHealthResult {
  score: number; // -1 to 1 (negative to positive)
  positiveIndicators: Array<{text: string, type: string, weight: number}>;
  negativeIndicators: Array<{text: string, type: string, weight: number}>;
  communicationBalance: number; // 0-1 where 0.5 is balanced
  intimacyLevel: number; // 0-1 scale
  conflictLevel: number; // 0-1 scale
  stabilityScore: number; // 0-1 scale
  growthTrend: 'improving' | 'stable' | 'declining' | 'fluctuating';
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
  expressiveness?: number; // 0 to 1 (reserved to expressive) - new field
  emotionalOpenness?: number; // 0 to 1 (closed to open) - new field
}

// Intimacy analysis
export interface IntimacyAnalysisResult {
  level: 'low' | 'medium' | 'high';
  score: number; // 0 to 1
  indicators: string[];
  consistency: number; // 0 to 1
  emotionalDepth?: number; // 0 to 1 (surface to deep) - new field
  vulnerabilitySharing?: number; // 0 to 1 (closed to open) - new field
  reciprocity?: number; // 0 to 1 (one-sided to mutual) - new field
}

/**
 * Analyze sentiment of a given text with detailed emotion breakdown
 */
export function analyzeSentiment(text: string): SentimentResult {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  
  let positiveWordCount = 0;
  let negativeWordCount = 0;
  let neutralWordCount = 0;
  
  // For detecting detailed emotions
  const detailedEmotionCounts: Record<string, number> = {};
  Object.keys(detailedEmotions).forEach(emotion => {
    detailedEmotionCounts[emotion] = 0;
  });
  
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
    
    // Check for detailed emotions
    Object.entries(detailedEmotions).forEach(([emotion, terms]) => {
      if (terms.some(term => cleanWord.includes(term))) {
        detailedEmotionCounts[emotion]++;
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
  
  // Calculate emotional variability
  const emotionValues = Object.values(detailedEmotionCounts);
  const nonZeroEmotions = emotionValues.filter(count => count > 0);
  const emotionalVariability = nonZeroEmotions.length > 0 
    ? nonZeroEmotions.length / Object.keys(detailedEmotions).length 
    : 0;
  
  return {
    score,
    dominant,
    positiveWordCount,
    negativeWordCount,
    neutralWordCount,
    detailedEmotions: detailedEmotionCounts,
    emotionalVariability
  };
}

/**
 * Detect manipulative language in a given text with detailed breakdown
 */
export function detectManipulation(text: string): ManipulationResult {
  let instances: Array<{text: string, type: string, weight: number}> = [];
  let totalWeight = 0;
  
  // Track manipulation by type
  const typeCount: Record<string, number> = {};
  
  // Check for manipulation patterns
  const allPatterns = [...manipulationPatterns, ...detailedManipulationPatterns];
  allPatterns.forEach(pattern => {
    const matches = text.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        instances.push({
          text: match,
          type: pattern.type,
          weight: pattern.weight
        });
        
        // Increment the count for this type
        typeCount[pattern.type] = (typeCount[pattern.type] || 0) + 1;
        
        totalWeight += pattern.weight;
      });
    }
  });
  
  // Normalize score between 0 and 1
  const score = Math.min(totalWeight, 1);
  
  return {
    score,
    instances,
    breakdownByType: typeCount
  };
}

/**
 * Detect apologies in a given text with sincerity estimation
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
  
  // Estimate sincerity based on words like "really", "very", "truly" and context
  const sincerityCues = [/gerçekten/i, /cidden/i, /çok/i, /hakikaten/i, /kalbimle/i, /içtenlikle/i, /samimiyetle/i, /really/i, /truly/i, /sincerely/i];
  let sincerityScore = 0.5; // Start at neutral
  
  sincerityCues.forEach(cue => {
    if (cue.test(text)) {
      sincerityScore += 0.1; // Increase score for each sincerity cue
    }
  });
  
  // Check for minimizing words that reduce sincerity
  const minimizers = [/ama/i, /fakat/i, /lakin/i, /sadece/i, /yalnızca/i, /but/i, /just/i, /only/i];
  minimizers.forEach(cue => {
    if (cue.test(text)) {
      sincerityScore -= 0.1; // Decrease score for each minimizer
    }
  });
  
  // Clamp between 0 and 1
  sincerityScore = Math.min(Math.max(sincerityScore, 0), 1);
  
  // Determine context
  let context = 'general';
  if (/(?:geç kaldım|geciktim|beklettiğim)/i.test(text)) context = 'lateness';
  else if (/(?:kırdıysam|üzdüysem|incittiysem)/i.test(text)) context = 'emotional hurt';
  else if (/(?:yapamadım|edemedim|olmadı)/i.test(text)) context = 'failure to deliver';
  
  return {
    found: instances.length > 0,
    instances,
    sincerity: sincerityScore,
    context
  };
}

/**
 * Detect love expressions in a given text with intensity analysis
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
  
  // Calculate intensity based on modifiers and repetition
  let intensity = 0.5; // Start at medium intensity
  
  // Check for intensity modifiers
  const intensifiers = [/çok/i, /aşırı/i, /delicesine/i, /sonsuza dek/i, /çılgınca/i, /very/i, /so much/i, /deeply/i, /madly/i];
  intensifiers.forEach(intensifier => {
    if (intensifier.test(text)) {
      intensity += 0.1; // Increase intensity for each intensifier
    }
  });
  
  // Check for repetition of love words
  const loveWords = [/sev/ig, /aşk/ig, /love/ig];
  loveWords.forEach(word => {
    const matches = text.match(word);
    if (matches && matches.length > 1) {
      intensity += 0.1 * (matches.length - 1); // Increase intensity for repeated love words
    }
  });
  
  // Check for emojis that intensify
  const loveEmojis = /[❤️💕💗💓💘💖💝💞😍🥰]/g;
  const emojiMatches = text.match(loveEmojis);
  if (emojiMatches) {
    intensity += 0.05 * emojiMatches.length; // Add for each love emoji
  }
  
  // Clamp between 0 and 1
  intensity = Math.min(Math.max(intensity, 0), 1);
  
  return {
    found: instances.length > 0,
    instances,
    containsILoveYou,
    intensity,
    frequency: instances.length // Raw count, will be normalized later
  };
}

/**
 * Analyze communication style in a message with more details
 */
export function analyzeCommunicationStyle(text: string): CommunicationStyleResult {
  // Simple analysis based on keywords and patterns
  const assertivePatterns = /(?:düşünüyorum|hissediyorum|inanıyorum|bence|sanırım|yapabiliriz|öneririm|I think|I feel|I believe|in my opinion|we could)/i;
  const aggressivePatterns = /(?:yapmalısın|zorundasın|asla|hemen|kesinlikle|you must|you have to|always|never|immediately)/i;
  const passivePatterns = /(?:belki|sanırım|olabilir|bilmiyorum|olur mu|maybe|perhaps|possibly|I guess|do you think)/i;
  const passiveAggressivePatterns = /(?:nasıl istersen|önemli değil|boşver|whatever|fine|doesn't matter|never mind)/i;
  
  // New patterns for expressiveness
  const expressivePatterns = /(?:çok|aşırı|inanılmaz|muhteşem|harika|korkunç|berbat|so|very|extremely|amazing|incredible|awesome|terrible|awful)/i;
  
  // New patterns for emotional openness
  const emotionalOpennessPatterns = /(?:hissediyorum|üzgünüm|mutluyum|kızgınım|korkuyorum|I feel|I'm sad|I'm happy|I'm angry|I'm scared)/i;
  
  // Calculate scores based on pattern matches
  const assertiveScore = assertivePatterns.test(text) ? 0.7 : 0.2;
  const aggressiveScore = aggressivePatterns.test(text) ? 0.7 : 0.2;
  const passiveScore = passivePatterns.test(text) ? 0.7 : 0.2;
  const passiveAggressiveScore = passiveAggressivePatterns.test(text) ? 0.7 : 0.2;
  const expressiveness = expressivePatterns.test(text) ? 0.8 : 0.3;
  const emotionalOpenness = emotionalOpennessPatterns.test(text) ? 0.8 : 0.2;
  
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
    directness,
    expressiveness,
    emotionalOpenness
  };
}

/**
 * Analyze intimacy in a message with enhanced detail
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
  
  // New patterns for emotional depth
  const emotionalDepthIndicators = [
    /(?:hislerim|duygularım|derin|içimde|ruhum|kalbim|my feelings|emotions|deep inside|my soul|my heart)/i,
    /(?:açılmak istiyorum|anlatmak istiyorum|paylaşmak istiyorum|I want to share|I want to tell you|I need to express)/i
  ];
  
  // New patterns for vulnerability
  const vulnerabilityIndicators = [
    /(?:korkuyorum|endişeliyim|üzgünüm|yalnız hissediyorum|zayıf hissediyorum|I'm afraid|I'm worried|I'm sad|I feel alone|I feel weak)/i,
    /(?:yardımına ihtiyacım var|desteğine ihtiyacım var|need your help|need your support)/i
  ];
  
  // Count occurrences of intimacy indicators
  let highCount = 0;
  let mediumCount = 0;
  let emotionalDepthCount = 0;
  let vulnerabilityCount = 0;
  
  highIntimacyIndicators.forEach(pattern => {
    if (pattern.test(text)) highCount++;
  });
  
  mediumIntimacyIndicators.forEach(pattern => {
    if (pattern.test(text)) mediumCount++;
  });
  
  emotionalDepthIndicators.forEach(pattern => {
    if (pattern.test(text)) emotionalDepthCount++;
  });
  
  vulnerabilityIndicators.forEach(pattern => {
    if (pattern.test(text)) vulnerabilityCount++;
  });
  
  // Calculate intimacy score
  const score = (highCount * 0.2) + (mediumCount * 0.1);
  const normalizedScore = Math.min(score, 1);
  
  // Calculate emotional depth score
  const emotionalDepth = Math.min(emotionalDepthCount * 0.25, 1);
  
  // Calculate vulnerability score
  const vulnerabilitySharing = Math.min(vulnerabilityCount * 0.3, 1);
  
  // Check for reciprocity (both giving and receiving)
  const givingIndicators = /(?:sana|senin için|for you|to you|giving you)/i;
  const receivingIndicators = /(?:bana|benim için|for me|to me|give me)/i;
  
  const giverScore = givingIndicators.test(text) ? 0.6 : 0.3;
  const receiverScore = receivingIndicators.test(text) ? 0.6 : 0.3;
  
  // Balanced reciprocity is when both scores are similar
  const reciprocity = 1 - Math.abs(giverScore - receiverScore);
  
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
  if (emotionalDepthCount > 0) indicators.push('Emotional depth');
  if (vulnerabilityCount > 0) indicators.push('Vulnerability sharing');
  
  return {
    level,
    score: normalizedScore,
    indicators,
    consistency: 0.5, // This would ideally be calculated over time
    emotionalDepth,
    vulnerabilitySharing,
    reciprocity
  };
}

/**
 * Analyze relationship health between participants
 */
export function analyzeRelationshipHealth(text: string): RelationshipHealthResult {
  // Initial values
  let positiveScore = 0;
  let negativeScore = 0;
  const positiveIndicators: Array<{text: string, type: string, weight: number}> = [];
  const negativeIndicators: Array<{text: string, type: string, weight: number}> = [];
  
  // Check for positive relationship indicators
  relationshipQualityIndicators.positive.forEach(indicator => {
    const matches = text.match(indicator.pattern);
    if (matches) {
      matches.forEach(match => {
        positiveIndicators.push({
          text: match,
          type: indicator.type,
          weight: indicator.weight
        });
        positiveScore += indicator.weight;
      });
    }
  });
  
  // Check for negative relationship indicators
  relationshipQualityIndicators.negative.forEach(indicator => {
    const matches = text.match(indicator.pattern);
    if (matches) {
      matches.forEach(match => {
        negativeIndicators.push({
          text: match,
          type: indicator.type,
          weight: indicator.weight
        });
        negativeScore += indicator.weight;
      });
    }
  });
  
  // Calculate overall relationship health score (-1 to 1)
  const totalScore = positiveScore + negativeScore;
  const healthScore = totalScore > 0 
    ? (positiveScore - negativeScore) / totalScore
    : 0;
    
  // Communication balance (0-1 where 0.5 is balanced)
  const communicationRatio = positiveScore > 0 && negativeScore > 0
    ? Math.min(positiveScore, negativeScore) / Math.max(positiveScore, negativeScore)
    : 0.5;
  const communicationBalance = Math.min(communicationRatio * 0.5 + 0.25, 1);
  
  // Intimacy level based on expressions
  const intimacyIndicators = /(?:seviyorum|aşkım|canım|hayatım|özel|mahrem|love you|my love|intimate|personal|private)/i;
  const intimacyLevel = intimacyIndicators.test(text) ? 0.8 : 0.3;
  
  // Conflict level based on negative patterns
  const conflictLevel = Math.min(negativeScore, 1);
  
  // Stability score - higher when there's consistency
  const mixedSignals = (positiveScore > 0 && negativeScore > 0);
  const stabilityScore = mixedSignals ? 0.3 : 0.8;
  
  // Growth trend (would ideally be measured over time)
  // For a single message we can only make basic assumptions
  let growthTrend: 'improving' | 'stable' | 'declining' | 'fluctuating' = 'stable';
  if (positiveScore > negativeScore * 2) {
    growthTrend = 'improving';
  } else if (negativeScore > positiveScore * 2) {
    growthTrend = 'declining';
  } else if (positiveScore > 0 && negativeScore > 0) {
    growthTrend = 'fluctuating';
  }
  
  return {
    score: healthScore,
    positiveIndicators,
    negativeIndicators,
    communicationBalance,
    intimacyLevel,
    conflictLevel,
    stabilityScore,
    growthTrend
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
    case 'stonewalling':
      return 'İletişim Engelleme';
    case 'threatening':
      return 'Tehdit Etme';
    default:
      return 'Diğer';
  }
}

/**
 * Get relationship indicator type label in Turkish
 */
export function getRelationshipIndicatorLabel(type: string): string {
  switch (type) {
    case 'togetherness':
      return 'Birliktelik';
    case 'gratitude':
      return 'Minnettarlık';
    case 'reciprocity':
      return 'Karşılıklılık';
    case 'understanding':
      return 'Anlayış';
    case 'communication':
      return 'İletişim';
    case 'lack-understanding':
      return 'Anlayış Eksikliği';
    case 'generalizing':
      return 'Genelleme';
    case 'separation-threat':
      return 'Ayrılık Tehdidi';
    case 'communication-issues':
      return 'İletişim Sorunları';
    case 'trust-issues':
      return 'Güven Sorunları';
    default:
      return 'Diğer';
  }
}

/**
 * Get detailed description of emotional state based on detailed emotions
 */
export function getEmotionalStateDescription(detailedEmotions: Record<string, number>): string {
  const primaryEmotions = Object.entries(detailedEmotions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  
  if (primaryEmotions.length === 0) return "Nötr bir duygusal durum";
  
  const primaryEmotion = primaryEmotions[0][0];
  
  const emotionDescriptions: Record<string, string> = {
    joy: "Neşeli ve olumlu bir duygusal durum",
    love: "Sevgi ve bağlılık hissi",
    gratitude: "Minnettarlık ve takdir duygusu",
    optimism: "İyimser ve umutlu bir bakış açısı",
    sadness: "Üzüntü ve keder duyguları",
    anger: "Öfke ve kızgınlık ifadeleri",
    fear: "Korku ve endişe hissi",
    disgust: "Tiksinti ve hoşnutsuzluk",
    surprise: "Şaşkınlık ve hayret duygusu"
  };
  
  let description = emotionDescriptions[primaryEmotion] || "Belirsiz duygusal durum";
  
  // Add secondary emotion if present
  if (primaryEmotions.length > 1) {
    const secondaryEmotion = primaryEmotions[1][0];
    description += `, ${emotionDescriptions[secondaryEmotion]?.toLowerCase() || secondaryEmotion} ile karışım halinde`;
  }
  
  return description;
}

/**
 * Get relationship health description based on analysis
 */
export function getRelationshipHealthDescription(health: RelationshipHealthResult): string {
  if (health.score > 0.7) {
    return "Sağlıklı ve pozitif bir ilişki göstergesi. İyi iletişim ve karşılıklı saygı görülüyor.";
  } else if (health.score > 0.3) {
    return "Genel olarak olumlu bir ilişki, ancak gelişim alanları mevcut.";
  } else if (health.score > -0.3) {
    return "İlişkide bazı zorluklar yaşanıyor, iletişimin geliştirilmesi faydalı olabilir.";
  } else {
    return "İlişkide ciddi sorunlar gözleniyor, profesyonel destek düşünülebilir.";
  }
}

