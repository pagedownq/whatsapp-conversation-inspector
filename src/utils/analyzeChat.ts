
import { ChatMessage, getParticipants, formatDateTimeForParsing } from './parseChat';
import { 
  analyzeSentiment, 
  detectManipulation, 
  analyzeCommunicationStyle,
  analyzeIntimacy,
  SentimentResult, 
  ManipulationResult,
  CommunicationStyleResult,
  IntimacyAnalysisResult
} from './sentimentAnalysis';

// Media statistics interface
export interface MediaStats {
  total: number;
  images: number;
  videos: number;
  documents: number;
  links: number;
  stickers: number;
  gifs: number;
  audio: number;
}

// Conversation style analysis interface
export interface ConversationStyle {
  avgResponseTime: number | null;
  avgMessageLength: number;
  mostActiveTimeOfDay: number;
  consistency: number; // 0-1, how consistent the messaging pattern is
  initiationRate: number; // percentage of conversations started by this participant
  messageFrequency: Record<string, number>; // messages per day pattern
  topWordsUsed: Array<{word: string, count: number}>;
  questionFrequency: number; // how often the participant asks questions
}

// New personality insights interface
export interface PersonalityInsights {
  dominance: number; // 0-1, how dominant in conversations
  openness: number; // 0-1, openness to new topics
  attentiveness: number; // 0-1, how attentive to others' messages
  emotionalExpressiveness: number; // 0-1, level of emotional expression
  conversationStyle: 'direct' | 'analytical' | 'relational' | 'expressive' | 'mixed';
  communicationStrengths: string[];
  communicationWeaknesses: string[];
}

// Enhanced relationship dynamics interface
export interface RelationshipDynamics {
  powerBalance: number; // -1 to 1, negative means other person has more power
  emotionalInvestment: number; // 0-1, how emotionally invested
  conflictFrequency: number; // 0-1, how often conflicts occur
  conflictResolution: number; // 0-1, ability to resolve conflicts
  supportiveness: number; // 0-1, level of support shown
  reciprocity: number; // 0-1, balance of give and take
  topicAlignment: number; // 0-1, how often on the same topic
  intimacyLevel: number; // 0-1, level of intimacy in communication
  communicationCompatibility: number; // 0-1, how compatible communication styles are
  trustIndicators: number; // 0-1, indicators of trust in communication
}

// Participant statistics with enhanced analytics
export interface ParticipantStats {
  name: string;
  messageCount: number;
  wordCount: number;
  characterCount: number;
  emojiCount: number;
  uniqueEmojis: Set<string>;
  topEmojis: Array<{emoji: string, count: number}>;
  averageMessageLength: number;
  longestMessage: {
    content: string;
    length: number;
  };
  mediaCount: number;
  mediaStats: MediaStats;
  responseTime: {
    average: number | null;
    fastest: number | null;
    slowest: number | null;
  };
  sentiment: {
    averageScore: number;
    positiveMsgCount: number;
    neutralMsgCount: number;
    negativeMsgCount: number;
    mostPositiveMessage: {
      content: string;
      score: number;
    };
    mostNegativeMessage: {
      content: string;
      score: number;
    };
  };
  manipulation: {
    averageScore: number;
    messageCount: number;
    examples: Array<{
      content: string;
      score: number;
      instances: Array<{text: string, type: string, weight: number}>;
    }>;
  };
  conversationStyle: ConversationStyle;
  personalityInsights: PersonalityInsights;
  vocabularyComplexity: number; // 0-1, complexity of vocabulary used
  topSubjects: string[]; // main topics discussed
  questionTypes: {
    total: number;
    open: number; // open-ended questions
    closed: number; // yes/no questions
    rhetorical: number; // rhetorical questions
  };
  // New analytics
  communicationStyle: CommunicationStyleResult;
  intimacyAnalysis: IntimacyAnalysisResult;
  replySpeed: {
    average: number; // in minutes
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  emotionalIntelligence: number; // 0-1, ability to recognize and respond to emotions
  conversationInfluence: number; // 0-1, how much they direct conversation topics
}

// Enhanced Chat Statistics interface
export interface ChatStats {
  totalMessages: number;
  totalWords: number;
  totalCharacters: number;
  totalEmojis: number;
  uniqueEmojis: Set<string>;
  participantStats: Record<string, ParticipantStats>;
  startDate: string;
  endDate: string;
  duration: number; // in days
  mostActiveDate: string;
  mostActiveHour: number;
  messagesByDate: Record<string, number>;
  messagesByHour: Record<number, number>;
  mediaStats: MediaStats;
  sentiment: {
    overallScore: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  manipulation: {
    mostManipulative: string;
    averageScore: number;
    messagesByType: Record<string, number>;
  };
  relationshipDynamics: Record<string, Record<string, RelationshipDynamics>>;
  conversationFlow: {
    topicChanges: number;
    avgTopicDuration: number;
    mostDiscussedTopics: string[];
    leastRespondedTopics: string[];
  };
  conversationQuality: {
    engagement: number; // 0-1, overall engagement level
    depth: number; // 0-1, depth of conversations
    balance: number; // 0-1, how balanced the conversation is
    growth: number; // -1 to 1, trend of relationship growth
  };
  // New extended analytics
  groupDynamics: {
    dominantParticipants: string[];
    peripheralParticipants: string[];
    subgroups: Array<{
      participants: string[];
      interactionStrength: number;
    }>;
    cohesion: number; // 0-1, group cohesion
  };
  conversationPatterns: {
    peakTimes: number[];
    weekdayActivity: Record<string, number>;
    burstsVsSteady: number; // -1 to 1, negative is bursty, positive is steady
    cyclicalPatterns: Array<{
      period: string;
      confidence: number;
    }>;
  };
  languageComplexity: {
    averageComplexity: number;
    trendOverTime: 'increasing' | 'decreasing' | 'stable';
    participantComparison: Record<string, number>;
  };
}

/**
 * Count occurrences of emojis in messages
 */
function countEmojis(messages: ChatMessage[]): Map<string, number> {
  const emojiMap = new Map<string, number>();
  
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/ug;
  
  messages.forEach(message => {
    const matches = message.content.match(emojiRegex);
    if (matches) {
      matches.forEach(emoji => {
        emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1);
      });
    }
  });
  
  return emojiMap;
}

/**
 * Get top N emojis from an emoji count map
 */
function getTopEmojis(emojiMap: Map<string, number>, n: number = 5): Array<{emoji: string, count: number}> {
  return Array.from(emojiMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([emoji, count]) => ({emoji, count}));
}

/**
 * Calculate the duration between two dates in days
 */
function calculateDurationInDays(startDate: string, endDate: string): number {
  // Convert DD.MM.YYYY or DD/MM/YYYY to MM/DD/YYYY for proper parsing
  const formatDateForParsing = (dateStr: string) => {
    // First normalize separators to a standard format (.)
    const normalized = dateStr.replace(/[/\-]/g, '.');
    const parts = normalized.split('.');
    
    // Check if we have a 2-digit year and convert to 4-digit
    if (parts.length === 3 && parts[2].length === 2) {
      const year = parseInt(parts[2]);
      // Assume 20xx for years less than 50, 19xx for years 50+
      parts[2] = (year < 50 ? '20' : '19') + parts[2];
    }
    
    // Convert DD.MM.YYYY to MM/DD/YYYY format for Date parsing
    if (parts.length === 3) {
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
    
    return dateStr; // Return original if we can't parse it
  };
  
  try {
    const start = new Date(formatDateForParsing(startDate));
    const end = new Date(formatDateForParsing(endDate));
    
    // Calculate the difference in milliseconds and convert to days
    const diffInMs = Math.abs(end.getTime() - start.getTime());
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    // Return at least 1 day if the chat happened on the same day
    return Math.max(diffInDays, 1);
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 1; // Return 1 day as fallback
  }
}

/**
 * Calculate response time between messages from different participants
 */
function calculateResponseTimes(messages: ChatMessage[]): Record<string, number[]> {
  const responseTimes: Record<string, number[]> = {};
  
  // Initialize response times array for each participant
  const participants = new Set<string>();
  messages.forEach(m => participants.add(m.sender));
  participants.forEach(p => {
    responseTimes[p] = [];
  });
  
  // Calculate response times
  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const prevMessage = messages[i - 1];
    
    // Only calculate if the sender is different (it's a response)
    if (currentMessage.sender !== prevMessage.sender) {
      try {
        const prevTime = new Date(formatDateTimeForParsing(prevMessage.date, prevMessage.time)).getTime();
        const currTime = new Date(formatDateTimeForParsing(currentMessage.date, currentMessage.time)).getTime();
        
        // Calculate difference in minutes
        const responseTime = (currTime - prevTime) / (1000 * 60);
        
        // Only include reasonable response times (less than 24 hours)
        if (responseTime > 0 && responseTime < 24 * 60) {
          responseTimes[currentMessage.sender].push(responseTime);
        }
      } catch (error) {
        console.error("Error calculating response time:", error);
      }
    }
  }
  
  return responseTimes;
}

/**
 * Analyze lexical complexity of messages
 */
function analyzeLexicalComplexity(messages: ChatMessage[]): number {
  if (messages.length === 0) return 0;
  
  // Calculate unique words ratio and average word length
  const allWords = messages
    .flatMap(m => m.content.toLowerCase().split(/\s+/))
    .filter(word => word.length > 0 && !word.match(/[^\w]/));
  
  const uniqueWords = new Set(allWords);
  const uniqueWordsRatio = allWords.length > 0 ? uniqueWords.size / allWords.length : 0;
  
  const avgWordLength = allWords.length > 0 
    ? allWords.reduce((sum, word) => sum + word.length, 0) / allWords.length 
    : 0;
  
  // Normalize to 0-1 scale (empirically derived thresholds)
  const normalizedRatio = Math.min(uniqueWordsRatio * 2, 1);
  const normalizedLength = Math.min(avgWordLength / 10, 1);
  
  return (normalizedRatio * 0.7) + (normalizedLength * 0.3);
}

/**
 * Extract most common topics from messages
 */
function extractTopics(messages: ChatMessage[], maxTopics: number = 5): string[] {
  // Common words to exclude
  const stopWords = new Set([
    'ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'bu', 'şu', 've', 'ile', 'için',
    'gibi', 'ama', 'fakat', 'ancak', 'çünkü', 'zira', 'eğer', 'ne', 'nasıl', 'neden',
    'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on',
    'tamam', 'evet', 'hayır', 'belki', 'olabilir', 'kesinlikle', 'var', 'yok',
    'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'about', 'against',
    'i', 'me', 'my', 'you', 'he', 'she', 'it', 'we', 'they', 'their', 'his', 'her'
  ]);
  
  // Get all words, filter out stopwords
  const allWords = messages
    .flatMap(m => m.content.toLowerCase().split(/\s+/))
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word) && 
      !word.match(/[^\wğüşıöçĞÜŞİÖÇ]/) &&
      !word.match(/^\d+$/)
    );
  
  // Count frequencies
  const wordFrequency: Record<string, number> = {};
  allWords.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort and take top N
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([word]) => word);
}

/**
 * Identify question types in messages
 */
function analyzeQuestions(messages: ChatMessage[]): {total: number, open: number, closed: number, rhetorical: number} {
  const result = {
    total: 0,
    open: 0,
    closed: 0,
    rhetorical: 0
  };
  
  // Question detection patterns
  const questionMark = /\?/;
  const openQuestionWords = /\b(ne|nerede|nasıl|neden|niçin|kim|hangi|kaç|what|where|how|why|who|which|when)\b/i;
  const closedQuestionPattern = /\b(mi|mı|mu|mü|değil mi|olur mu|var mı|ister misin|yapar mısın)\b|\b(is|are|was|were|do|does|did|have|has|had|will|would|should|could|can)\s+\w+/i;
  const rhetoricalPatterns = [
    /değil mi\?$/i,
    /\bsence de\b/i,
    /\bhep öyle değil mi\b/i,
    /\bne yani\b/i,
    /\bne gerek var\b/i,
    /\bkim bilir\b/i,
    /\bnasıl olabilir ki\b/i
  ];
  
  for (const message of messages) {
    if (questionMark.test(message.content)) {
      result.total++;
      
      // Determine question type
      if (openQuestionWords.test(message.content)) {
        result.open++;
      } else if (closedQuestionPattern.test(message.content)) {
        result.closed++;
      }
      
      // Check for rhetorical questions
      if (rhetoricalPatterns.some(pattern => pattern.test(message.content))) {
        result.rhetorical++;
      }
    }
  }
  
  return result;
}

/**
 * Determine communication style based on message patterns
 */
function determineCommunicationStyle(messages: ChatMessage[]): 'direct' | 'analytical' | 'relational' | 'expressive' | 'mixed' {
  // Style indicators
  let directScore = 0;
  let analyticalScore = 0;
  let relationalScore = 0;
  let expressiveScore = 0;
  
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/ug;
  
  // Style detection patterns
  const directPatterns = [
    /\b(yap|gel|git|ver|al|kesinlikle|hemen|şimdi|lütfen)\b/i,
    /\b(must|should|now|immediately|just|exactly)\b/i
  ];
  
  const analyticalPatterns = [
    /\b(düşünüyorum|sanırım|galiba|belki|neden|çünkü|eğer|ama|fakat|ancak)\b/i,
    /\b(think|analyze|perhaps|possibly|reason|because|if|but|however)\b/i
  ];
  
  const relationalPatterns = [
    /\b(nasılsın|iyi misin|özledim|seviyorum|teşekkür|rica|anlıyorum|hissediyorum)\b/i,
    /\b(feel|miss|love|thanks|appreciate|understand|care|relationship)\b/i
  ];
  
  // Count patterns in messages
  for (const message of messages) {
    // Direct style indicators
    if (message.content.length < 15 || message.content.endsWith('!')) {
      directScore++;
    }
    
    if (directPatterns.some(pattern => pattern.test(message.content))) {
      directScore++;
    }
    
    // Analytical style indicators
    if (message.content.length > 100 || message.content.includes(',')) {
      analyticalScore++;
    }
    
    if (analyticalPatterns.some(pattern => pattern.test(message.content))) {
      analyticalScore++;
    }
    
    // Relational style indicators
    if (relationalPatterns.some(pattern => pattern.test(message.content))) {
      relationalScore++;
    }
    
    if (message.content.includes('?')) {
      relationalScore += 0.5;
    }
    
    // Expressive style indicators
    const emojiCount = (message.content.match(emojiRegex) || []).length;
    if (emojiCount > 0) {
      expressiveScore += Math.min(emojiCount, 3);
    }
    
    if (message.content.includes('!')) {
      expressiveScore++;
    }
  }
  
  // Normalize scores by message count
  const totalMessages = Math.max(messages.length, 1);
  directScore /= totalMessages;
  analyticalScore /= totalMessages;
  relationalScore /= totalMessages;
  expressiveScore /= totalMessages;
  
  // Determine dominant style
  const scores = [
    { style: 'direct', score: directScore },
    { style: 'analytical', score: analyticalScore },
    { style: 'relational', score: relationalScore },
    { style: 'expressive', score: expressiveScore }
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  // Check if there's a clear dominant style or if it's mixed
  if (scores[0].score > scores[1].score * 1.5) {
    return scores[0].style as 'direct' | 'analytical' | 'relational' | 'expressive';
  }
  
  return 'mixed';
}

/**
 * Calculate relationship dynamics between participants
 */
function analyzeRelationshipDynamics(allMessages: ChatMessage[], participant1: string, participant2: string): RelationshipDynamics {
  // Filter messages between these two participants
  const relevantMessages = allMessages.filter(m => 
    m.sender === participant1 || m.sender === participant2
  );
  
  if (relevantMessages.length < 10) {
    // Not enough data for meaningful analysis
    return {
      powerBalance: 0,
      emotionalInvestment: 0,
      conflictFrequency: 0,
      conflictResolution: 0,
      supportiveness: 0,
      reciprocity: 0,
      topicAlignment: 0,
      intimacyLevel: 0,
      communicationCompatibility: 0,
      trustIndicators: 0
    };
  }
  
  // Group messages by sender
  const p1Messages = relevantMessages.filter(m => m.sender === participant1);
  const p2Messages = relevantMessages.filter(m => m.sender === participant2);
  
  // Power balance indicators
  const messageRatio = p1Messages.length / Math.max(p2Messages.length, 1);
  const avgLengthP1 = p1Messages.reduce((sum, m) => sum + m.messageLength, 0) / Math.max(p1Messages.length, 1);
  const avgLengthP2 = p2Messages.reduce((sum, m) => sum + m.messageLength, 0) / Math.max(p2Messages.length, 1);
  const lengthRatio = avgLengthP1 / Math.max(avgLengthP2, 1);
  
  // Emotional investment indicators
  const p1Emotions = p1Messages.map(m => analyzeSentiment(m.content));
  const p2Emotions = p2Messages.map(m => analyzeSentiment(m.content));
  
  const p1EmotionalVariance = calculateVariance(p1Emotions.map(e => e.score));
  const p2EmotionalVariance = calculateVariance(p2Emotions.map(e => e.score));
  
  // Conflict indicators
  const conflictWords = [
    'kızgın', 'sinirli', 'üzgün', 'nefret', 'bıktım', 'istemiyorum', 'saçmalık',
    'saçma', 'anlamsız', 'aptalca', 'olmaz', 'hayır', 'yapma', 'etme',
    'angry', 'upset', 'hate', 'tired of', 'don\'t want', 'stupid', 'nonsense', 'no'
  ];
  
  let conflictCount = 0;
  for (let i = 0; i < relevantMessages.length - 1; i++) {
    const currentMsg = relevantMessages[i];
    const nextMsg = relevantMessages[i + 1];
    
    if (currentMsg.sender !== nextMsg.sender) {
      const currentContent = currentMsg.content.toLowerCase();
      const nextContent = nextMsg.content.toLowerCase();
      
      if (conflictWords.some(word => currentContent.includes(word)) &&
          conflictWords.some(word => nextContent.includes(word))) {
        conflictCount++;
      }
    }
  }
  
  // Calculate metrics
  const powerBalance = normalizeRatio(messageRatio) * 0.7 + normalizeRatio(lengthRatio) * 0.3;
  const emotionalInvestment = Math.max(p1EmotionalVariance, p2EmotionalVariance);
  const conflictFrequency = Math.min(conflictCount / relevantMessages.length * 10, 1);
  
  // Derived metrics with heuristics
  const supportiveness = calculateSupportiveness(relevantMessages);
  const reciprocity = calculateReciprocity(relevantMessages);
  const topicAlignment = calculateTopicAlignment(relevantMessages);
  const intimacyLevel = 0.5; // Default middle value
  const communicationCompatibility = 0.5; // Default middle value
  const trustIndicators = 0.5; // Default middle value
  
  // Conflict resolution is harder to detect but can be estimated
  const conflictResolution = Math.max(0, 1 - conflictFrequency * (1 - supportiveness));
  
  return {
    powerBalance: clamp(powerBalance * 2 - 1, -1, 1), // Convert to -1 to 1 range
    emotionalInvestment: clamp(emotionalInvestment, 0, 1),
    conflictFrequency: clamp(conflictFrequency, 0, 1),
    conflictResolution: clamp(conflictResolution, 0, 1),
    supportiveness: clamp(supportiveness, 0, 1),
    reciprocity: clamp(reciprocity, 0, 1),
    topicAlignment: clamp(topicAlignment, 0, 1),
    intimacyLevel: clamp(intimacyLevel, 0, 1),
    communicationCompatibility: clamp(communicationCompatibility, 0, 1),
    trustIndicators: clamp(trustIndicators, 0, 1)
  };
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff * diff;
  });
  
  return Math.sqrt(squareDiffs.reduce((sum, square) => sum + square, 0) / values.length);
}

/**
 * Normalize a ratio to a 0-1 scale
 */
function normalizeRatio(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio > 3) return 1;
  
  // Map ratio from 0-3 to 0-1 with diminishing returns
  return (Math.log(ratio + 1) / Math.log(4));
}

/**
 * Calculate supportiveness from message content
 */
function calculateSupportiveness(messages: ChatMessage[]): number {
  const supportiveWords = [
    'anlıyorum', 'tamam', 'haklısın', 'doğru', 'elbette', 'tabii', 'tabi', 
    'understand', 'okay', 'right', 'correct', 'sure', 'of course'
  ];
  
  let supportiveCount = 0;
  
  for (const message of messages) {
    const lowerContent = message.content.toLowerCase();
    if (supportiveWords.some(word => lowerContent.includes(word))) {
      supportiveCount++;
    }
  }
  
  return Math.min(supportiveCount / messages.length * 3, 1);
}

/**
 * Calculate reciprocity based on messaging patterns
 */
function calculateReciprocity(messages: ChatMessage[]): number {
  if (messages.length < 4) return 0.5;
  
  const participants = Array.from(new Set(messages.map(m => m.sender)));
  if (participants.length !== 2) return 0.5;
  
  // Count transitions between speakers
  let transitions = 0;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender !== messages[i-1].sender) {
      transitions++;
    }
  }
  
  // Perfect reciprocity would have transitions = messages - 1
  return Math.min(transitions / (messages.length - 1), 1);
}

/**
 * Calculate topic alignment based on content similarity
 */
function calculateTopicAlignment(messages: ChatMessage[]): number {
  if (messages.length < 4) return 0.5;
  
  let similaritySum = 0;
  let comparisons = 0;
  
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender !== messages[i-1].sender) {
      const similarity = calculateContentSimilarity(messages[i-1].content, messages[i].content);
      similaritySum += similarity;
      comparisons++;
    }
  }
  
  return comparisons > 0 ? similaritySum / comparisons : 0.5;
}

/**
 * Calculate simple content similarity based on word overlap
 */
function calculateContentSimilarity(text1: string, text2: string): number {
  // Extract significant words
  const words1 = extractSignificantWords(text1);
  const words2 = extractSignificantWords(text2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Count overlapping words
  const overlap = words1.filter(word => words2.includes(word)).length;
  
  // Normalize by the smaller set size
  return overlap / Math.min(words1.length, words2.length);
}

/**
 * Extract significant words from text
 */
function extractSignificantWords(text: string): string[] {
  const stopWords = new Set([
    'ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'bu', 'şu', 've', 'ile', 'için',
    'gibi', 'ama', 'fakat', 'ancak', 'çünkü', 'zira', 'eğer', 'ne', 'nasıl', 'neden',
    'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on',
    'tamam', 'evet', 'hayır', 'belki', 'olabilir', 'kesinlikle', 'var', 'yok',
    'i', 'me', 'my', 'you', 'he', 'she', 'it', 'we', 'they', 'their', 'his', 'her',
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'from'
  ]);
  
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.has(word) && 
      !word.match(/[^\wğüşıöçĞÜŞİÖÇ]/)
    );
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate attentiveness score based on response patterns
 */
function calculateAttentiveness(messages: ChatMessage[], participant: string): number {
  const participantMessages = messages.filter(m => m.sender === participant);
  if (participantMessages.length < 3) return 0.5;
  
  // Look for question-response patterns
  let questionResponseCount = 0;
  let questionCount = 0;
  
  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i-1];
    const currMsg = messages[i];
    
    // If previous message ends with a question and current is from the participant
    if (prevMsg.sender !== participant && currMsg.sender === participant && prevMsg.content.trim().endsWith('?')) {
      questionCount++;
      
      // Check if response contains content from the question (simplified)
      const prevWords = extractSignificantWords(prevMsg.content);
      const currWords = extractSignificantWords(currMsg.content);
      
      if (currWords.some(word => prevWords.includes(word))) {
        questionResponseCount++;
      }
    }
  }
  
  return questionCount > 0 ? questionResponseCount / questionCount : 0.5;
}

/**
 * Calculate emotional intelligence based on response patterns to emotional content
 */
function calculateEmotionalIntelligence(messages: ChatMessage[], participant: string): number {
  if (messages.length < 10) return 0.5;
  
  let emotionalResponses = 0;
  let emotionalMessages = 0;
  
  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i-1];
    const currMsg = messages[i];
    
    // Only analyze if current message is from the participant and previous is not
    if (prevMsg.sender !== participant && currMsg.sender === participant) {
      const prevSentiment = analyzeSentiment(prevMsg.content);
      
      // If previous message had strong emotion
      if (prevSentiment.score < -0.5 || prevSentiment.score > 0.5) {
        emotionalMessages++;
        
        // Analyze if response acknowledges the emotion
        const empathyWords = [
          'anlıyorum', 'üzgünüm', 'sevindim', 'mutlu oldum', 'anladım', 'hissediyorum',
          'understand', 'sorry', 'glad', 'happy for you', 'feel', 'emotion'
        ];
        
        if (empathyWords.some(word => currMsg.content.toLowerCase().includes(word))) {
          emotionalResponses++;
        }
      }
    }
  }
  
  return emotionalMessages > 0 ? 
    Math.min(emotionalResponses / emotionalMessages * 1.5, 1) : 0.5;
}

/**
 * Calculate conversation influence (how much they steer topics)
 */
function calculateConversationInfluence(messages: ChatMessage[], participant: string): number {
  if (messages.length < 10) return 0.5;
  
  let topicChanges = 0;
  let participantTopicChanges = 0;
  
  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i-1];
    const currMsg = messages[i];
    
    // Simplified topic change detection
    const similarity = calculateContentSimilarity(prevMsg.content, currMsg.content);
    
    if (similarity < 0.2) { // Low similarity indicates topic change
      topicChanges++;
      
      if (currMsg.sender === participant) {
        participantTopicChanges++;
      }
    }
  }
  
  return topicChanges > 0 ? 
    Math.min(participantTopicChanges / topicChanges * 2, 1) : 0.5;
}

/**
 * Determine communication strengths based on participant stats
 */
function determineStrengths(stats: ParticipantStats): string[] {
  const strengths: string[] = [];
  
  if (stats.conversationStyle.consistency > 0.7) {
    strengths.push('Tutarlı İletişim');
  }
  
  if (stats.intimacyAnalysis.score > 0.6) {
    strengths.push('Yakın İlişki Kurabilme');
  }
  
  if (stats.emotionalIntelligence > 0.7) {
    strengths.push('Duygusal Zeka');
  }
  
  if (stats.vocabularyComplexity > 0.7) {
    strengths.push('Zengin Kelime Dağarcığı');
  }
  
  if (stats.questionTypes.open > stats.questionTypes.closed) {
    strengths.push('Açık Uçlu Sorular Sorma');
  }
  
  // Add default strength if none found
  if (strengths.length === 0) {
    strengths.push('Açık İletişim');
  }
  
  return strengths.slice(0, 3); // Return top 3 strengths
}

/**
 * Determine communication weaknesses based on participant stats
 */
function determineWeaknesses(stats: ParticipantStats): string[] {
  const weaknesses: string[] = [];
  
  if (stats.conversationStyle.consistency < 0.3) {
    weaknesses.push('Tutarsız İletişim');
  }
  
  if (stats.manipulation.averageScore > 0.4) {
    weaknesses.push('Manipülatif Eğilimler');
  }
  
  if (stats.emotionalIntelligence < 0.3) {
    weaknesses.push('Duygusal Zeka Eksikliği');
  }
  
  if (stats.conversationStyle.initiationRate < 0.2) {
    weaknesses.push('Konuşma Başlatmada Çekingenlik');
  }
  
  // Add default weakness if none found
  if (weaknesses.length === 0) {
    weaknesses.push('İletişim Eksikliği');
  }
  
  return weaknesses.slice(0, 3); // Return top 3 weaknesses
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const variance = squareDiffs.reduce((sum, square) => sum + square, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Find peak activity times in message hour distribution
 */
function findPeakTimes(messagesByHour: Record<number, number>): number[] {
  const entries = Object.entries(messagesByHour).map(([hour, count]) => ({ 
    hour: parseInt(hour), 
    count 
  }));
  
  // Sort by count in descending order
  entries.sort((a, b) => b.count - a.count);
  
  // Return top 3 hours with most messages
  return entries.slice(0, 3).map(entry => entry.hour);
}

/**
 * Calculate message distribution by day of week
 */
function calculateWeekdayActivity(messages: ChatMessage[]): Record<string, number> {
  const weekdays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const counts: Record<string, number> = {};
  
  // Initialize counts
  weekdays.forEach(day => {
    counts[day] = 0;
  });
  
  // Count messages by day of week
  messages.forEach(message => {
    try {
      const date = new Date(formatDateTimeForParsing(message.date, message.time));
      const weekday = weekdays[date.getDay()];
      counts[weekday]++;
    } catch (error) {
      // Skip messages with invalid dates
    }
  });
  
  return counts;
}

/**
 * Calculate topic changes in conversation
 */
function calculateTopicChanges(messages: ChatMessage[]): number {
  if (messages.length < 3) return 0;
  
  let topicChanges = 0;
  const windowSize = 5; // Messages to consider for topic cohesion
  
  for (let i = windowSize; i < messages.length; i += windowSize) {
    const prevWindow = messages.slice(i - windowSize, i);
    const nextWindow = messages.slice(i, Math.min(i + windowSize, messages.length));
    
    if (nextWindow.length >= 3) { // Enough messages to constitute a window
      const prevTopics = extractTopics(prevWindow, 5);
      const nextTopics = extractTopics(nextWindow, 5);
      
      // Calculate topic overlap
      const overlap = prevTopics.filter(topic => nextTopics.includes(topic)).length;
      const overlapRatio = overlap / Math.max(Math.min(prevTopics.length, nextTopics.length), 1);
      
      // Low overlap means topic change
      if (overlapRatio < 0.3) {
        topicChanges++;
      }
    }
  }
  
  return topicChanges;
}

/**
 * Analyze chat data and produce statistics with enhanced analytics
 */
export function analyzeChat(messages: ChatMessage[]): ChatStats {
  if (!messages.length) {
    throw new Error('No messages to analyze');
  }
  
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(formatDateTimeForParsing(a.date, a.time));
    const dateB = new Date(formatDateTimeForParsing(b.date, b.time));
    return dateA.getTime() - dateB.getTime();
  });
  
  const startDate = sortedMessages[0].date;
  const endDate = sortedMessages[sortedMessages.length - 1].date;
  const durationDays = calculateDurationInDays(startDate, endDate);
  
  // Initialize overall stats
  const participants = getParticipants(sortedMessages);
  const participantStats: Record<string, ParticipantStats> = {};
  
  // Initialize the new relation dynamics map
  const relationshipDynamics: Record<string, Record<string, RelationshipDynamics>> = {};
  
  // Initialize new conversation quality metrics
  const conversationQuality = {
    engagement: 0,
    depth: 0,
    balance: 0,
    growth: 0
  };
  
  // Initialize conversation flow data
  const conversationFlow = {
    topicChanges: 0,
    avgTopicDuration: 0,
    mostDiscussedTopics: [] as string[],
    leastRespondedTopics: [] as string[]
  };
  
  // Initialize new extended analytics
  const groupDynamics = {
    dominantParticipants: [] as string[],
    peripheralParticipants: [] as string[],
    subgroups: [] as Array<{
      participants: string[];
      interactionStrength: number;
    }>,
    cohesion: 0
  };
  
  const conversationPatterns = {
    peakTimes: [] as number[],
    weekdayActivity: {} as Record<string, number>,
    burstsVsSteady: 0,
    cyclicalPatterns: [] as Array<{
      period: string;
      confidence: number;
    }>
  };
  
  const languageComplexity = {
    averageComplexity: 0,
    trendOverTime: 'stable' as 'increasing' | 'decreasing' | 'stable',
    participantComparison: {} as Record<string, number>
  };
  
  participants.forEach(participant => {
    participantStats[participant] = {
      name: participant,
      messageCount: 0,
      wordCount: 0,
      characterCount: 0,
      emojiCount: 0,
      uniqueEmojis: new Set<string>(),
      topEmojis: [],
      averageMessageLength: 0,
      longestMessage: {
        content: '',
        length: 0
      },
      mediaCount: 0,
      mediaStats: {
        total: 0,
        images: 0,
        videos: 0,
        documents: 0,
        links: 0,
        stickers: 0,
        gifs: 0,
        audio: 0
      },
      responseTime: {
        average: null,
        fastest: null,
        slowest: null
      },
      sentiment: {
        averageScore: 0,
        positiveMsgCount: 0,
        neutralMsgCount: 0,
        negativeMsgCount: 0,
        mostPositiveMessage: {
          content: '',
          score: 0
        },
        mostNegativeMessage: {
          content: '',
          score: 0
        }
      },
      manipulation: {
        averageScore: 0,
        messageCount: 0,
        examples: []
      },
      // Initialize new analytics fields
      conversationStyle: {
        avgResponseTime: null,
        avgMessageLength: 0,
        mostActiveTimeOfDay: 0,
        consistency: 0,
        initiationRate: 0,
        messageFrequency: {},
        topWordsUsed: [],
        questionFrequency: 0
      },
      personalityInsights: {
        dominance: 0,
        openness: 0,
        attentiveness: 0,
        emotionalExpressiveness: 0,
        conversationStyle: 'mixed',
        communicationStrengths: [],
        communicationWeaknesses: []
      },
      vocabularyComplexity: 0,
      topSubjects: [],
      questionTypes: {
        total: 0,
        open: 0,
        closed: 0,
        rhetorical: 0
      },
      // New analytics
      communicationStyle: {
        primary: 'mixed',
        assertiveScore: 0,
        aggressiveScore: 0,
        passiveScore: 0,
        passiveAggressiveScore: 0,
        formality: 0.5,
        directness: 0.5
      },
      intimacyAnalysis: {
        level: 'medium',
        score: 0.5,
        indicators: [],
        consistency: 0.5
      },
      replySpeed: {
        average: 0,
        trend: 'stable'
      },
      emotionalIntelligence: 0.5,
      conversationInfluence: 0.5
    };
    
    // Initialize relationships map for each participant
    relationshipDynamics[participant] = {};
    
    // Create relationship dynamics entries for each pair of participants
    participants.forEach(otherParticipant => {
      if (participant !== otherParticipant) {
        relationshipDynamics[participant][otherParticipant] = {
          powerBalance: 0,
          emotionalInvestment: 0,
          conflictFrequency: 0,
          conflictResolution: 0,
          supportiveness: 0,
          reciprocity: 0,
          topicAlignment: 0,
          intimacyLevel: 0,
          communicationCompatibility: 0,
          trustIndicators: 0
        };
      }
    });
  });
  
  // Initialize media stats
  const totalMediaStats: MediaStats = {
    total: 0,
    images: 0,
    videos: 0,
    documents: 0,
    links: 0,
    stickers: 0,
    gifs: 0,
    audio: 0
  };
  
  // Track message counts by date and hour
  const messagesByDate: Record<string, number> = {};
  const messagesByHour: Record<number, number> = {};
  const messagesByParticipantByDate: Record<string, Record<string, number>> = {};
  
  // Initialize counters for sentiment analysis
  let totalSentimentScore = 0;
  let totalPositiveMessages = 0;
  let totalNegativeMessages = 0;
  let totalNeutralMessages = 0;
  
  // Initialize counters for manipulation analysis
  const manipulationByType: Record<string, number> = {};
  let totalManipulationScore = 0;
  let totalManipulativeMessages = 0;
  let mostManipulativeParticipant = '';
  let highestManipulationScore = 0;
  
  // Gather response times for participants
  const responseTimes = calculateResponseTimes(sortedMessages);
  
  // Analyze messages
  sortedMessages.forEach((message, index) => {
    const { sender, content, date, time } = message;
    const messageLength = content.length;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    const messageDate = date;
    const messageHour = parseInt(time.split(':')[0]);
    
    // Update participant stats
    const participant = participantStats[sender];
    participant.messageCount++;
    participant.wordCount += words.length;
    participant.characterCount += messageLength;
    
    // Track message length
    if (messageLength > participant.longestMessage.length) {
      participant.longestMessage = {
        content,
        length: messageLength
      };
    }
    
    // Track dates and hours
    messagesByDate[messageDate] = (messagesByDate[messageDate] || 0) + 1;
    messagesByHour[messageHour] = (messagesByHour[messageHour] || 0) + 1;
    
    if (!messagesByParticipantByDate[sender]) {
      messagesByParticipantByDate[sender] = {};
    }
    messagesByParticipantByDate[sender][messageDate] = 
      (messagesByParticipantByDate[sender][messageDate] || 0) + 1;
    
    // Extract media (simple detection)
    if (content.includes('<Media omitted>') || content.includes('<Media excluded>')) {
      participant.mediaCount++;
      totalMediaStats.total++;
      
      // Simple heuristics to guess media type
      if (content.toLowerCase().includes('image')) {
        participant.mediaStats.images++;
        totalMediaStats.images++;
      } else if (content.toLowerCase().includes('video')) {
        participant.mediaStats.videos++;
        totalMediaStats.videos++;
      } else if (content.toLowerCase().includes('document') || content.toLowerCase().includes('pdf')) {
        participant.mediaStats.documents++;
        totalMediaStats.documents++;
      } else if (content.toLowerCase().includes('gif')) {
        participant.mediaStats.gifs++;
        totalMediaStats.gifs++;
      } else if (content.toLowerCase().includes('sticker')) {
        participant.mediaStats.stickers++;
        totalMediaStats.stickers++;
      } else if (content.toLowerCase().includes('audio')) {
        participant.mediaStats.audio++;
        totalMediaStats.audio++;
      } else {
        // Default to image if we can't determine
        participant.mediaStats.images++;
        totalMediaStats.images++;
      }
    }
    
    // Extract emojis
    const emojiMap = countEmojis([message]);
    emojiMap.forEach((count, emoji) => {
      participant.emojiCount += count;
      participant.uniqueEmojis.add(emoji);
    });
    
    // Simple link detection
    const linkMatches = content.match(/https?:\/\/[^\s]+/g);
    if (linkMatches) {
      participant.mediaStats.links += linkMatches.length;
      totalMediaStats.links += linkMatches.length;
      totalMediaStats.total += linkMatches.length;
    }
    
    // Sentiment analysis
    const sentimentResult = analyzeSentiment(content);
    totalSentimentScore += sentimentResult.score;
    
    if (sentimentResult.dominant === 'positive') {
      totalPositiveMessages++;
      participant.sentiment.positiveMsgCount++;
      
      if (sentimentResult.score > participant.sentiment.mostPositiveMessage.score) {
        participant.sentiment.mostPositiveMessage = {
          content,
          score: sentimentResult.score
        };
      }
    } else if (sentimentResult.dominant === 'negative') {
      totalNegativeMessages++;
      participant.sentiment.negativeMsgCount++;
      
      if (sentimentResult.score < participant.sentiment.mostNegativeMessage.score) {
        participant.sentiment.mostNegativeMessage = {
          content,
          score: sentimentResult.score
        };
      }
    } else {
      totalNeutralMessages++;
      participant.sentiment.neutralMsgCount++;
    }
    
    // Manipulation analysis
    const manipulationResult = detectManipulation(content);
    participant.manipulation.averageScore += manipulationResult.score;
    totalManipulationScore += manipulationResult.score;
    
    if (manipulationResult.score > 0.2) { // Only count messages with significant manipulation
      totalManipulativeMessages++;
      participant.manipulation.messageCount++;
      
      // Track by type
      manipulationResult.instances.forEach(instance => {
        manipulationByType[instance.type] = (manipulationByType[instance.type] || 0) + 1;
      });
      
      // Store examples of highly manipulative messages
      if (manipulationResult.score > 0.5 && participant.manipulation.examples.length < 5) {
        participant.manipulation.examples.push({
          content,
          score: manipulationResult.score,
          instances: manipulationResult.instances
        });
      }
      
      // Track the most manipulative participant
      const avgManipulationScore = participant.manipulation.averageScore / Math.max(participant.manipulation.messageCount, 1);
      if (avgManipulationScore > highestManipulationScore && participant.manipulation.messageCount >= 5) {
        highestManipulationScore = avgManipulationScore;
        mostManipulativeParticipant = sender;
      }
    }
    
    // Analyze communication style
    participant.communicationStyle = analyzeCommunicationStyle(content);
    
    // Analyze intimacy
    participant.intimacyAnalysis = analyzeIntimacy(content);
    
    // Calculate vocabulary complexity
    participant.vocabularyComplexity = analyzeLexicalComplexity([message]);
    
    // Extract topics
    participant.topSubjects = extractTopics([message], 10);
    
    // Analyze questions
    const questionAnalysis = analyzeQuestions([message]);
    participant.questionTypes.total += questionAnalysis.total;
    participant.questionTypes.open += questionAnalysis.open;
    participant.questionTypes.closed += questionAnalysis.closed;
    participant.questionTypes.rhetorical += questionAnalysis.rhetorical;
    
    // Update conversation quality metrics
    // This is a simplified example - in a real app, we'd have more sophisticated analysis
    conversationQuality.depth += (content.length > 100 ? 0.01 : 0);
    conversationQuality.engagement += (index > 0 && sortedMessages[index-1].sender !== sender ? 0.01 : 0);
  });
  
  // Process response times
  participants.forEach(participant => {
    const times = responseTimes[participant] || [];
    if (times.length > 0) {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const sorted = [...times].sort((a, b) => a - b);
      
      participantStats[participant].responseTime = {
        average: avg,
        fastest: sorted[0],
        slowest: sorted[sorted.length - 1]
      };
      
      // Update conversation style with response time
      participantStats[participant].conversationStyle.avgResponseTime = avg;
      
      // Calculate reply speed metrics
      participantStats[participant].replySpeed = {
        average: avg,
        trend: 'stable' // For simplicity; in a real app this would be calculated over time
      };
    }
  });
  
  // Calculate averages and finalize stats
  participants.forEach(participant => {
    const stats = participantStats[participant];
    
    // Message length average
    stats.averageMessageLength = stats.characterCount / Math.max(stats.messageCount, 1);
    stats.conversationStyle.avgMessageLength = stats.averageMessageLength;
    
    // Top emojis
    const participantEmojiMap = new Map<string, number>();
    stats.uniqueEmojis.forEach(emoji => {
      participantEmojiMap.set(emoji, 0); // Initialize with 0
    });
    
    // Count emoji occurrences for this participant
    sortedMessages
      .filter(m => m.sender === participant)
      .forEach(message => {
        const emojiMatches = message.content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
        if (emojiMatches) {
          emojiMatches.forEach(emoji => {
            participantEmojiMap.set(emoji, (participantEmojiMap.get(emoji) || 0) + 1);
          });
        }
      });
    
    stats.topEmojis = getTopEmojis(participantEmojiMap, 5);
    
    // Sentiment average
    stats.sentiment.averageScore = (stats.sentiment.positiveMsgCount - stats.sentiment.negativeMsgCount) / 
      Math.max(stats.messageCount, 1);
    
    // Manipulation average (only for messages with manipulation detected)
    if (stats.manipulation.messageCount > 0) {
      stats.manipulation.averageScore /= stats.manipulation.messageCount;
    }
    
    // Calculate personality insights
    stats.personalityInsights = {
      dominance: Math.min(stats.messageCount / (sortedMessages.length * 0.5), 1),
      openness: Math.random() * 0.5 + 0.25, // simplified placeholder
      attentiveness: calculateAttentiveness(sortedMessages, participant),
      emotionalExpressiveness: (stats.sentiment.positiveMsgCount + stats.sentiment.negativeMsgCount) / Math.max(stats.messageCount, 1),
      conversationStyle: determineCommunicationStyle(sortedMessages.filter(m => m.sender === participant)),
      communicationStrengths: determineStrengths(stats),
      communicationWeaknesses: determineWeaknesses(stats)
    };
    
    // Calculate message frequency by hour
    const hourCounts: Record<number, number> = {};
    sortedMessages
      .filter(m => m.sender === participant)
      .forEach(message => {
        const hour = parseInt(message.time.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
    
    stats.conversationStyle.messageFrequency = hourCounts;
    
    // Find most active hour
    let maxMessages = 0;
    let mostActiveHour = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxMessages) {
        maxMessages = count;
        mostActiveHour = parseInt(hour);
      }
    });
    stats.conversationStyle.mostActiveTimeOfDay = mostActiveHour;
    
    // Calculate initiation rate
    let initiationCount = 0;
    let lastSender = '';
    sortedMessages.forEach((message, index) => {
      if (index === 0 || (lastSender !== participant && message.sender === participant)) {
        initiationCount++;
      }
      lastSender = message.sender;
    });
    stats.conversationStyle.initiationRate = initiationCount / Math.max(stats.messageCount, 1);
    
    // Calculate consistency based on message frequency variance
    const messageFrequency = Object.values(stats.conversationStyle.messageFrequency);
    if (messageFrequency.length > 0) {
      const mean = messageFrequency.reduce((sum, count) => sum + count, 0) / messageFrequency.length;
      const variance = messageFrequency.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / messageFrequency.length;
      const stdDev = Math.sqrt(variance);
      stats.conversationStyle.consistency = 1 - Math.min(stdDev / mean, 1);
    }
    
    // Calculate top words used
    const wordFrequency: Record<string, number> = {};
    sortedMessages
      .filter(m => m.sender === participant)
      .forEach(message => {
        const words = message.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
          const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
          if (cleanWord.length > 3) {
            wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
          }
        });
      });
    
    stats.conversationStyle.topWordsUsed = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    // Calculate question frequency
    stats.conversationStyle.questionFrequency = stats.questionTypes.total / Math.max(stats.messageCount, 1);
    
    // Calculate emotional intelligence (simplified approximation)
    stats.emotionalIntelligence = calculateEmotionalIntelligence(sortedMessages, participant);
    
    // Calculate conversation influence (simplified)
    stats.conversationInfluence = calculateConversationInfluence(sortedMessages, participant);
  });
  
  // Calculate most active date
  let maxMessages = 0;
  let mostActiveDate = startDate;
  Object.entries(messagesByDate).forEach(([date, count]) => {
    if (count > maxMessages) {
      maxMessages = count;
      mostActiveDate = date;
    }
  });
  
  // Calculate most active hour
  let maxHourMessages = 0;
  let mostActiveHour = 0;
  Object.entries(messagesByHour).forEach(([hour, count]) => {
    if (count > maxHourMessages) {
      maxHourMessages = count;
      mostActiveHour = parseInt(hour);
    }
  });
  
  // Analyze relationship dynamics between all pairs of participants
  participants.forEach(participant1 => {
    participants.forEach(participant2 => {
      if (participant1 !== participant2) {
        relationshipDynamics[participant1][participant2] = analyzeRelationshipDynamics(
          sortedMessages, participant1, participant2
        );
      }
    });
  });
  
  // Extract top topics from all messages
  const topTopics = extractTopics(sortedMessages, 10);
  
  // Calculate conversation flow metrics
  conversationFlow.mostDiscussedTopics = topTopics;
  conversationFlow.topicChanges = calculateTopicChanges(sortedMessages);
  conversationFlow.avgTopicDuration = sortedMessages.length / Math.max(conversationFlow.topicChanges, 1);
  
  // Calculate group dynamics
  groupDynamics.dominantParticipants = participants
    .filter(p => participantStats[p].personalityInsights.dominance > 0.6)
    .slice(0, 3);
  
  groupDynamics.peripheralParticipants = participants
    .filter(p => participantStats[p].personalityInsights.dominance < 0.3)
    .slice(0, 3);
  
  // Simplified subgroup detection based on interaction patterns
  if (participants.length > 3) {
    const interactionMatrix: Record<string, Record<string, number>> = {};
    participants.forEach(p1 => {
      interactionMatrix[p1] = {};
      participants.forEach(p2 => {
        interactionMatrix[p1][p2] = 0;
      });
    });
    
    // Count direct replies between participants
    for (let i = 1; i < sortedMessages.length; i++) {
      const prevSender = sortedMessages[i-1].sender;
      const currentSender = sortedMessages[i].sender;
      if (prevSender !== currentSender) {
        interactionMatrix[currentSender][prevSender]++;
      }
    }
    
    // Identify potential subgroups (simplified)
    for (let i = 0; i < participants.length; i++) {
      for (let j = i+1; j < participants.length; j++) {
        const p1 = participants[i];
        const p2 = participants[j];
        const interactionStrength = 
          (interactionMatrix[p1][p2] + interactionMatrix[p2][p1]) / sortedMessages.length;
        
        if (interactionStrength > 0.1) {
          groupDynamics.subgroups.push({
            participants: [p1, p2],
            interactionStrength
          });
        }
      }
    }
  }
  
  // Calculate group cohesion based on balanced participation
  const messageCountStdDev = calculateStandardDeviation(
    participants.map(p => participantStats[p].messageCount)
  );
  const maxMessages = Math.max(...participants.map(p => participantStats[p].messageCount));
  groupDynamics.cohesion = 1 - (messageCountStdDev / maxMessages);
  
  // Calculate conversation patterns
  conversationPatterns.peakTimes = findPeakTimes(messagesByHour);
  conversationPatterns.weekdayActivity = calculateWeekdayActivity(sortedMessages);
  
  // Final assembly of chat stats
  const totalUniqueEmojis = new Set<string>();
  let totalEmojiCount = 0;
  
  participants.forEach(participant => {
    const stats = participantStats[participant];
    totalEmojiCount += stats.emojiCount;
    stats.uniqueEmojis.forEach(emoji => totalUniqueEmojis.add(emoji));
  });
  
  // Calculate language complexity metrics
  languageComplexity.averageComplexity = participants.reduce(
    (sum, p) => sum + participantStats[p].vocabularyComplexity, 
    0
  ) / participants.length;
  
  participants.forEach(p => {
    languageComplexity.participantComparison[p] = participantStats[p].vocabularyComplexity;
  });
  
  // Return the complete stats object
  return {
    totalMessages: sortedMessages.length,
    totalWords: participants.reduce((sum, p) => sum + participantStats[p].wordCount, 0),
    totalCharacters: participants.reduce((sum, p) => sum + participantStats[p].characterCount, 0),
    totalEmojis: totalEmojiCount,
    uniqueEmojis: totalUniqueEmojis,
    participantStats,
    startDate,
    endDate,
    duration: durationDays,
    mostActiveDate,
    mostActiveHour,
    messagesByDate,
    messagesByHour,
    mediaStats: totalMediaStats,
    sentiment: {
      overallScore: sortedMessages.length > 0 ? totalSentimentScore / sortedMessages.length : 0,
      positivePercentage: sortedMessages.length > 0 ? (totalPositiveMessages / sortedMessages.length) * 100 : 0,
      negativePercentage: sortedMessages.length > 0 ? (totalNegativeMessages / sortedMessages.length) * 100 : 0,
      neutralPercentage: sortedMessages.length > 0 ? (totalNeutralMessages / sortedMessages.length) * 100 : 0
    },
    manipulation: {
      mostManipulative: mostManipulativeParticipant,
      averageScore: totalManipulativeMessages > 0 ? totalManipulationScore / totalManipulativeMessages : 0,
      messagesByType: manipulationByType
    },
    relationshipDynamics,
    conversationFlow,
    conversationQuality,
    groupDynamics,
    conversationPatterns,
    languageComplexity
  };
}
