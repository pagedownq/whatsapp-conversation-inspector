import { ChatMessage, getParticipants } from './parseChat';
import { analyzeSentiment, detectManipulation, SentimentResult, ManipulationResult } from './sentimentAnalysis';

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
 * Format date and time for parsing
 */
function formatDateTimeForParsing(date: string, time: string): string {
  // Convert DD.MM.YYYY or DD/MM/YYYY to MM/DD/YYYY for proper parsing
  const normalized = date.replace(/[/\-]/g, '.');
  const parts = normalized.split('.');
  
  if (parts.length === 3) {
    // Handle 2-digit years
    if (parts[2].length === 2) {
      const year = parseInt(parts[2]);
      parts[2] = (year < 50 ? '20' : '19') + parts[2];
    }
    
    // Convert DD.MM.YYYY to MM/DD/YYYY format for Date parsing
    return `${parts[1]}/${parts[0]}/${parts[2]} ${time}`;
  }
  
  return `${date} ${time}`; // Return original format if we can't parse it
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
      topicAlignment: 0
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
  
  // Conflict resolution is harder to detect but can be estimated
  const conflictResolution = Math.max(0, 1 - conflictFrequency * (1 - supportiveness));
  
  return {
    powerBalance: clamp(powerBalance * 2 - 1, -1, 1), // Convert to -1 to 1 range
    emotionalInvestment: clamp(emotionalInvestment, 0, 1),
    conflictFrequency: clamp(conflictFrequency, 0, 1),
    conflictResolution: clamp(conflictResolution, 0, 1),
    supportiveness: clamp(supportiveness, 0, 1),
    reciprocity: clamp(reciprocity, 0, 1),
    topicAlignment: clamp(topicAlignment, 0, 1)
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
      }
    };
    
    // Initialize relationships map for each participant
    relationshipDynamics
