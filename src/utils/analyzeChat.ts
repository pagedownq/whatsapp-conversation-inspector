import { ChatMessage, getParticipants } from './parseChat';
import { 
  analyzeSentiment, 
  detectManipulation, 
  detectApologies, 
  detectLoveExpressions, 
  analyzeRelationshipHealth,
  SentimentResult, 
  ManipulationResult,
  RelationshipHealthResult,
  ApologyResult 
} from './sentimentAnalysis';

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

export interface WordFrequency {
  word: string;
  count: number;
}

export interface ConversationPatterns {
  conversationStarts: number;
  replies: number;
  avgReplyTime: number | null;
  disagreementCount: number;
  agreementCount: number;
  mostUsedWords: WordFrequency[];
  mostUsedStartWords: WordFrequency[];
}

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
    detailedEmotions?: Record<string, number>;
    emotionalVariability?: number;
  };
  manipulation: {
    averageScore: number;
    messageCount: number;
    examples: Array<{
      content: string;
      score: number;
      instances: Array<{text: string, type: string, weight: number}>;
    }>;
    typeBreakdown?: Record<string, number>;
  };
  apologies: {
    count: number;
    examples: Array<{
      content: string;
      text: string;
      sincerity?: number;
      context?: string;
    }>;
  };
  loveExpressions: {
    count: number;
    iLoveYouCount: number;
    examples: Array<{
      content: string;
      text: string;
      isILoveYou: boolean;
      intensity?: number;
    }>;
  };
  relationshipHealth?: {
    averageScore: number;
    positiveIndicators: Array<{text: string, type: string, weight: number}>;
    negativeIndicators: Array<{text: string, type: string, weight: number}>;
  };
  conversationPatterns: ConversationPatterns;
}

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
    emotionalTrend?: 'improving' | 'declining' | 'stable' | 'fluctuating';
    detailedEmotions?: Record<string, number>;
  };
  manipulation: {
    mostManipulative: string;
    averageScore: number;
    totalManipulativeMessages: number;
    messagesByType: Record<string, number>;
    patterns?: Array<{type: string, count: number, percentage: number}>;
  };
  apologies: {
    total: number;
    mostApologetic: string;
    apologyExamples: Array<{
      sender: string;
      content: string;
      text: string;
      sincerity?: number;
      context?: string;
    }>;
  };
  loveExpressions: {
    total: number;
    mostRomantic: string;
    iLoveYouCount: Record<string, number>;
    mostCommonExpressions: Array<{
      text: string;
      count: number;
    }>;
  };
  relationshipHealth?: {
    overallScore: number;
    communicationBalance: number;
    intimacyLevel: number;
    conflictLevel: number;
    stabilityScore: number;
    growthTrend: 'improving' | 'stable' | 'declining' | 'fluctuating';
    positiveIndicators: Array<{type: string, count: number}>;
    negativeIndicators: Array<{type: string, count: number}>;
  };
  wordAnalysis: {
    mostFrequentWords: WordFrequency[];
    mostFrequentWordsByParticipant: Record<string, WordFrequency[]>;
    mostFrequentStartWords: WordFrequency[];
  };
  conversationAnalysis: {
    mostInitiator: string;
    mostReplier: string;
    fastestResponder: string;
    mostDisagreements: string;
    mostAgreements: string;
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
  const formatDateForParsing = (dateStr: string) => {
    const normalized = dateStr.replace(/[/\-]/g, '.');
    const parts = normalized.split('.');
    
    if (parts.length === 3 && parts[2].length === 2) {
      const year = parseInt(parts[2]);
      parts[2] = (year < 50 ? '20' : '19') + parts[2];
    }
    
    if (parts.length === 3) {
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
    
    return dateStr;
  };
  
  try {
    const start = new Date(formatDateForParsing(startDate));
    const end = new Date(formatDateForParsing(endDate));
    
    const diffInMs = Math.abs(end.getTime() - start.getTime());
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    return Math.max(diffInDays, 1);
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 1;
  }
}

/**
 * Calculate response time between messages from different participants
 */
function calculateResponseTimes(messages: ChatMessage[]): Record<string, number[]> {
  const responseTimes: Record<string, number[]> = {};
  
  const participants = new Set<string>();
  messages.forEach(m => participants.add(m.sender));
  participants.forEach(p => {
    responseTimes[p] = [];
  });
  
  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const prevMessage = messages[i - 1];
    
    if (currentMessage.sender !== prevMessage.sender) {
      try {
        const prevTime = new Date(formatDateTimeForParsing(prevMessage.date, prevMessage.time)).getTime();
        const currTime = new Date(formatDateTimeForParsing(currentMessage.date, currentMessage.time)).getTime();
        
        const responseTime = (currTime - prevTime) / (1000 * 60);
        
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
  const normalized = date.replace(/[/\-]/g, '.');
  const parts = normalized.split('.');
  
  if (parts.length === 3) {
    if (parts[2].length === 2) {
      const year = parseInt(parts[2]);
      parts[2] = (year < 50 ? '20' : '19') + parts[2];
    }
    
    return `${parts[1]}/${parts[0]}/${parts[2]} ${time}`;
  }
  
  return `${date} ${time}`;
}

/**
 * Analyze word frequency in messages
 */
function analyzeWordFrequency(messages: ChatMessage[]): Map<string, number> {
  const wordMap = new Map<string, number>();
  
  messages.forEach(message => {
    const words = message.content
      .toLowerCase()
      .replace(/[.,!?;:()[\]{}'"\/\\<>@#$%^&*_+=|~`-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3);
    
    words.forEach(word => {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });
  });
  
  return wordMap;
}

/**
 * Detect conversation starts
 */
function detectConversationStarts(messages: ChatMessage[], participant: string): number {
  let startCount = 0;
  const timeThreshold = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].sender !== participant) continue;
    
    if (i === 0) {
      startCount++;
      continue;
    }
    
    try {
      const currentTime = new Date(formatDateTimeForParsing(messages[i].date, messages[i].time)).getTime();
      const prevTime = new Date(formatDateTimeForParsing(messages[i-1].date, messages[i-1].time)).getTime();
      
      if (currentTime - prevTime > timeThreshold) {
        startCount++;
      }
    } catch (error) {
      console.error("Error calculating conversation start:", error);
    }
  }
  
  return startCount;
}

/**
 * Detect replies in conversation
 */
function detectReplies(messages: ChatMessage[], participant: string): number {
  let replyCount = 0;
  const timeThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender !== participant) continue;
    if (messages[i-1].sender === participant) continue; // Skip if previous message is from the same participant
    
    try {
      const currentTime = new Date(formatDateTimeForParsing(messages[i].date, messages[i].time)).getTime();
      const prevTime = new Date(formatDateTimeForParsing(messages[i-1].date, messages[i-1].time)).getTime();
      
      if (currentTime - prevTime <= timeThreshold) {
        replyCount++;
      }
    } catch (error) {
      console.error("Error calculating replies:", error);
    }
  }
  
  return replyCount;
}

/**
 * Detect disagreements in messages
 */
function detectDisagreements(messages: ChatMessage[]): number {
  const disagreementPatterns = [
    /katılmıyorum/i, /aynı fikirde değilim/i, /hayır/i, /olmaz/i, /saçma/i,
    /yanlış/i, /saçmalama/i, /mantıksız/i, /alakası yok/i, /itiraz/i,
    /i disagree/i, /don't agree/i, /no way/i, /that's not right/i, /absolutely not/i,
    /absolutely wrong/i, /aslında/i, /ama/i, /fakat/i, /lakin/i, /ancak/i
  ];
  
  let count = 0;
  
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    for (const pattern of disagreementPatterns) {
      if (pattern.test(content)) {
        count++;
        break;
      }
    }
  });
  
  return count;
}

/**
 * Detect agreements in messages
 */
function detectAgreements(messages: ChatMessage[]): number {
  const agreementPatterns = [
    /katılıyorum/i, /aynı fikirdeyim/i, /evet/i, /olur/i, /tamam/i, /tabi/i,
    /doğru/i, /kesinlikle/i, /haklısın/i, /mantıklı/i, /aynen/i, /agree/i,
    /yes/i, /correct/i, /right/i, /indeed/i, /exactly/i, /sure/i, /ok/i
  ];
  
  let count = 0;
  
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    for (const pattern of agreementPatterns) {
      if (pattern.test(content)) {
        count++;
        break;
      }
    }
  });
  
  return count;
}

/**
 * Get word frequency at the start of messages
 */
function getStartWordFrequency(messages: ChatMessage[]): Map<string, number> {
  const wordMap = new Map<string, number>();
  
  messages.forEach(message => {
    const words = message.content
      .toLowerCase()
      .replace(/[.,!?;:()[\]{}'"\/\\<>@#$%^&*_+=|~`-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2);
    
    if (words.length > 0) {
      const firstWord = words[0];
      wordMap.set(firstWord, (wordMap.get(firstWord) || 0) + 1);
    }
  });
  
  return wordMap;
}

/**
 * Calculate average reply time for a participant
 */
function calculateAverageReplyTime(messages: ChatMessage[], participant: string): number | null {
  const replyTimes: number[] = [];
  const timeThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender !== participant) continue;
    if (messages[i-1].sender === participant) continue; // Skip if previous message is from the same participant
    
    try {
      const currentTime = new Date(formatDateTimeForParsing(messages[i].date, messages[i].time)).getTime();
      const prevTime = new Date(formatDateTimeForParsing(messages[i-1].date, messages[i-1].time)).getTime();
      
      const timeDiff = currentTime - prevTime;
      if (timeDiff <= timeThreshold) {
        replyTimes.push(timeDiff / (60 * 1000)); // Convert to minutes
      }
    } catch (error) {
      console.error("Error calculating average reply time:", error);
    }
  }
  
  if (replyTimes.length === 0) return null;
  
  const sum = replyTimes.reduce((acc, time) => acc + time, 0);
  return sum / replyTimes.length;
}

/**
 * Analyze chat data and produce statistics
 */
export function analyzeChat(messages: ChatMessage[]): ChatStats {
  if (!messages.length) {
    throw new Error('No messages to analyze');
  }
  
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(formatDateTimeForParsing(a.date, a.time));
    const dateB = new Date(formatDateTimeForParsing(b.date, b.time));
    return dateA.getTime() - dateB.getTime();
  });
  
  const startDate = sortedMessages[0].date;
  const endDate = sortedMessages[sortedMessages.length - 1].date;
  const durationDays = calculateDurationInDays(startDate, endDate);
  
  const participants = getParticipants(sortedMessages);
  const participantStats: Record<string, ParticipantStats> = {};
  
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
        },
        detailedEmotions: {},
        emotionalVariability: undefined
      },
      manipulation: {
        averageScore: 0,
        messageCount: 0,
        examples: [],
        typeBreakdown: {}
      },
      apologies: {
        count: 0,
        examples: []
      },
      loveExpressions: {
        count: 0,
        iLoveYouCount: 0,
        examples: []
      },
      relationshipHealth: {
        averageScore: 0,
        positiveIndicators: [],
        negativeIndicators: []
      },
      conversationPatterns: {
        conversationStarts: 0,
        replies: 0,
        avgReplyTime: null,
        disagreementCount: 0,
        agreementCount: 0,
        mostUsedWords: [],
        mostUsedStartWords: []
      }
    };
  });
  
  const messagesByDate: Record<string, number> = {};
  const messagesByHour: Record<number, number> = {};
  
  const overallMediaStats: MediaStats = {
    total: 0,
    images: 0,
    videos: 0,
    documents: 0,
    links: 0,
    stickers: 0,
    gifs: 0,
    audio: 0
  };
  
  let totalMessages = 0;
  let totalWords = 0;
  let totalCharacters = 0;
  let totalEmojis = 0;
  const allEmojis = new Set<string>();
  
  const responseTimes = calculateResponseTimes(sortedMessages);
  
  let totalSentimentScore = 0;
  let positiveMsgCount = 0;
  let neutralMsgCount = 0;
  let negativeMsgCount = 0;
  
  const manipulationMessagesByType: Record<string, number> = {};
  const participantManipulationScores: Record<string, number[]> = {};
  participants.forEach(p => {
    participantManipulationScores[p] = [];
  });
  
  let totalApologies = 0;
  let totalLoveExpressions = 0;
  let mostApologeticPerson = '';
  let mostApologeticCount = 0;
  let mostRomanticPerson = '';
  let mostRomanticCount = 0;
  const loveExpressionCounts: Record<string, number> = {};
  const apologyExamples: Array<{
    sender: string;
    content: string;
    text: string;
    sincerity?: number;
    context?: string;
  }> = [];
  
  const participantDisagreements: Record<string, number> = {};
  const participantAgreements: Record<string, number> = {};
  
  participants.forEach(p => {
    const participantMessages = sortedMessages.filter(m => m.sender === p);
    participantDisagreements[p] = detectDisagreements(participantMessages);
    participantAgreements[p] = detectAgreements(participantMessages);
  });
  
  const detailedEmotionsTotal: Record<string, number> = {};
  const relationshipHealthScores: number[] = [];
  const relationshipIndicators: {
    positive: Record<string, number>,
    negative: Record<string, number>
  } = {
    positive: {},
    negative: {}
  };
  
  const allManipulationTypes: Record<string, number> = {};
  
  for (let i = 0; i < sortedMessages.length; i++) {
    const message = sortedMessages[i];
    const participant = message.sender;
    
    totalMessages++;
    totalWords += message.wordCount;
    totalCharacters += message.characterCount;
    totalEmojis += message.emojiCount;
    
    const stats = participantStats[participant];
    stats.messageCount++;
    stats.wordCount += message.wordCount;
    stats.characterCount += message.characterCount;
    stats.emojiCount += message.emojiCount;
    
    if (message.messageLength > stats.longestMessage.length) {
      stats.longestMessage.content = message.content;
      stats.longestMessage.length = message.messageLength;
    }
    
    const emojiMap = countEmojis([message]);
    emojiMap.forEach((count, emoji) => {
      stats.emojiCount += count;
      stats.uniqueEmojis.add(emoji);
      allEmojis.add(emoji);
    });
    
    const linkMatches = message.content.match(/https?:\/\/[^\s]+/g);
    if (linkMatches) {
      stats.mediaStats.links += linkMatches.length;
      overallMediaStats.links += linkMatches.length;
      overallMediaStats.total += linkMatches.length;
      stats.mediaCount += linkMatches.length;
    }
    
    const sentimentResult = analyzeSentiment(message.content);
    totalSentimentScore += sentimentResult.score;
    
    if (sentimentResult.dominant === 'positive') {
      positiveMsgCount++;
      stats.sentiment.positiveMsgCount++;
      
      if (sentimentResult.score > stats.sentiment.mostPositiveMessage.score) {
        stats.sentiment.mostPositiveMessage = {
          content: message.content,
          score: sentimentResult.score
        };
      }
    } else if (sentimentResult.dominant === 'negative') {
      negativeMsgCount++;
      stats.sentiment.negativeMsgCount++;
      
      if (sentimentResult.score < stats.sentiment.mostNegativeMessage.score) {
        stats.sentiment.mostNegativeMessage = {
          content: message.content,
          score: sentimentResult.score
        };
      }
    } else {
      neutralMsgCount++;
      stats.sentiment.neutralMsgCount++;
    }
    
    const manipulationResult = detectManipulation(message.content);
    if (manipulationResult.score > 0) {
      stats.manipulation.messageCount++;
      participantManipulationScores[participant].push(manipulationResult.score);
      
      if (manipulationResult.breakdownByType) {
        if (!participantStats[participant].manipulation.typeBreakdown) {
          participantStats[participant].manipulation.typeBreakdown = {};
        }
        
        Object.entries(manipulationResult.breakdownByType).forEach(([type, count]) => {
          participantStats[participant].manipulation.typeBreakdown![type] = 
            (participantStats[participant].manipulation.typeBreakdown![type] || 0) + count;
          
          manipulationMessagesByType[type] = (manipulationMessagesByType[type] || 0) + count;
          allManipulationTypes[type] = (allManipulationTypes[type] || 0) + count;
        });
      }
      
      manipulationResult.instances.forEach(instance => {
        participantStats[participant].manipulation.examples.push({
          content: message.content,
          score: manipulationResult.score,
          instances: manipulationResult.instances
        });
        
        if (manipulationResult.score > 0.3) {
          participantStats[participant].manipulation.examples.sort((a, b) => b.score - a.score);
          participantStats[participant].manipulation.examples = participantStats[participant].manipulation.examples.slice(0, 5);
        }
      });
    }
    
    const apologyResult = detectApologies(message.content);
    if (apologyResult.found) {
      apologyResult.instances.forEach(instance => {
        participantStats[participant].apologies.count++;
        totalApologies++;
        
        if (participantStats[participant].apologies.examples.length < 5) {
          participantStats[participant].apologies.examples.push({
            content: message.content,
            text: instance.text,
            sincerity: apologyResult.sincerity,
            context: apologyResult.context
          });
        }
        
        if (apologyExamples.length < 10) {
          apologyExamples.push({
            sender: participant,
            content: message.content,
            text: instance.text,
            sincerity: apologyResult.sincerity,
            context: apologyResult.context
          });
        }
      });
      
      if (participantStats[participant].apologies.count > mostApologeticCount) {
        mostApologeticCount = participantStats[participant].apologies.count;
        mostApologeticPerson = participant;
      }
    }
    
    const loveResult = detectLoveExpressions(message.content);
    if (loveResult.found) {
      loveResult.instances.forEach(instance => {
        participantStats[participant].loveExpressions.count++;
        totalLoveExpressions++;
        
        loveExpressionCounts[instance.text.toLowerCase()] = (loveExpressionCounts[instance.text.toLowerCase()] || 0) + 1;
        
        if (loveResult.containsILoveYou) {
          participantStats[participant].loveExpressions.iLoveYouCount++;
        }
        
        if (participantStats[participant].loveExpressions.examples.length < 5) {
          participantStats[participant].loveExpressions.examples.push({
            content: message.content,
            text: instance.text,
            isILoveYou: /seni seviyorum|I love you/i.test(instance.text),
            intensity: loveResult.intensity
          });
        }
      });
      
      if (participantStats[participant].loveExpressions.count > mostRomanticCount) {
        mostRomanticCount = participantStats[participant].loveExpressions.count;
        mostRomanticPerson = participant;
      }
    }
    
    const relationshipResult = analyzeRelationshipHealth(message.content);
    if (relationshipResult) {
      relationshipHealthScores.push(relationshipResult.score);
      
      if (!participantStats[participant].relationshipHealth) {
        participantStats[participant].relationshipHealth = {
          averageScore: 0,
          positiveIndicators: [],
          negativeIndicators: []
        };
      }
      
      relationshipResult.positiveIndicators.forEach(indicator => {
        participantStats[participant].relationshipHealth!.positiveIndicators.push(indicator);
        relationshipIndicators.positive[indicator.type] = (relationshipIndicators.positive[indicator.type] || 0) + 1;
      });
      
      relationshipResult.negativeIndicators.forEach(indicator => {
        participantStats[participant].relationshipHealth!.negativeIndicators.push(indicator);
        relationshipIndicators.negative[indicator.type] = (relationshipIndicators.negative[indicator.type] || 0) + 1;
      });
      
      participantStats[participant].relationshipHealth!.averageScore = 
        participantStats[participant].relationshipHealth!.averageScore === 0 
          ? relationshipResult.score 
          : (participantStats[participant].relationshipHealth!.averageScore + relationshipResult.score) / 2;
    }
    
    messagesByDate[message.date] = (messagesByDate[message.date] || 0) + 1;
    messagesByHour[parseInt(message.time.split(':')[0])] = (messagesByHour[parseInt(message.time.split(':')[0])] || 0) + 1;
  }
  
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
    }
  });
  
  participants.forEach(participant => {
    const stats = participantStats[participant];
    
    stats.averageMessageLength = stats.characterCount / Math.max(stats.messageCount, 1);
    
    const participantEmojiMap = new Map<string, number>();
    stats.uniqueEmojis.forEach(emoji => {
      participantEmojiMap.set(emoji, 0);
    });
    
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
    
    stats.sentiment.averageScore = (stats.sentiment.positiveMsgCount - stats.sentiment.negativeMsgCount) / 
      Math.max(stats.messageCount, 1);
    
    if (stats.manipulation.messageCount > 0) {
      stats.manipulation.averageScore = participantManipulationScores[participant].reduce((sum, score) => sum + score, 0) / 
        stats.manipulation.messageCount;
    }
  });
  
  let maxMessages = 0;
  let mostActiveDate = startDate;
  Object.entries(messagesByDate).forEach(([date, count]) => {
    if (count > maxMessages) {
      maxMessages = count;
      mostActiveDate = date;
    }
  });
  
  let maxHourMessages = 0;
  let mostActiveHour = 0;
  Object.entries(messagesByHour).forEach(([hour, count]) => {
    if (count > maxHourMessages) {
      maxHourMessages = count;
      mostActiveHour = parseInt(hour);
    }
  });
  
  let mostManipulative = '';
  let highestManipulationScore = -1;
  
  Object.entries(participantStats).forEach(([name, stats]) => {
    if (stats.manipulation.averageScore > highestManipulationScore) {
      mostManipulative = name;
      highestManipulationScore = stats.manipulation.averageScore;
    }
  });
  
  const sortedLoveExpressions = Object.entries(loveExpressionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([text, count]) => ({ text, count }));
  
  const iLoveYouCounts: Record<string, number> = {};
  participants.forEach(participant => {
    iLoveYouCounts[participant] = participantStats[participant].loveExpressions.iLoveYouCount;
  });
  
  const allWordsFrequency = analyzeWordFrequency(messages);
  const wordsByParticipant: Record<string, Map<string, number>> = {};
  const startWordsFrequency = getStartWordFrequency(messages);
  
  participants.forEach(p => {
    const participantMessages = messages.filter(m => m.sender === p);
    wordsByParticipant[p] = analyzeWordFrequency(participantMessages);
  });
  
  let mostInitiator = '';
  let mostReplier = '';
  let fastestResponder = '';
  let mostDisagreements = '';
  let mostAgreements = '';
  
  let maxStarts = -1;
  let maxReplies = -1;
  let minResponseTime = Number.MAX_VALUE;
  let maxDisagreements = -1;
  let maxAgreements = -1;
  
  participants.forEach(participant => {
    const stats = participantStats[participant];
    
    if (stats.conversationPatterns.conversationStarts > maxStarts) {
      maxStarts = stats.conversationPatterns.conversationStarts;
      mostInitiator = participant;
    }
    
    if (stats.conversationPatterns.replies > maxReplies) {
      maxReplies = stats.conversationPatterns.replies;
      mostReplier = participant;
    }
    
    if (stats.responseTime.average !== null && stats.responseTime.average < minResponseTime) {
      minResponseTime = stats.responseTime.average;
      fastestResponder = participant;
    }
    
    if (stats.conversationPatterns.disagreementCount > maxDisagreements) {
      maxDisagreements = stats.conversationPatterns.disagreementCount;
      mostDisagreements = participant;
    }
    
    if (stats.conversationPatterns.agreementCount > maxAgreements) {
      maxAgreements = stats.conversationPatterns.agreementCount;
      mostAgreements = participant;
    }
  });
  
  const topWords = Array.from(allWordsFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
  
  const topStartWords = Array.from(startWordsFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  
  const topWordsByParticipant: Record<string, WordFrequency[]> = {};
  Object.entries(wordsByParticipant).forEach(([participant, wordFrequency]) => {
    topWordsByParticipant[participant] = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  });
  
  const manipulationPatterns = Object.entries(allManipulationTypes)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalMessages > 0 ? (count / totalMessages) * 100 : 0
    }));
  
  let emotionalTrend: 'improving' | 'declining' | 'stable' | 'fluctuating' = 'stable';
  if (sortedMessages.length > 10) {
    const firstHalf = sortedMessages.slice(0, Math.floor(sortedMessages.length / 2));
    const secondHalf = sortedMessages.slice(Math.floor(sortedMessages.length / 2));
    
    const firstHalfScore = firstHalf.reduce((sum, msg) => 
      sum + analyzeSentiment(msg.content).score, 0) / firstHalf.length;
    
    const secondHalfScore = secondHalf.reduce((sum, msg) => 
      sum + analyzeSentiment(msg.content).score, 0) / secondHalf.length;
    
    const scoreDifference = secondHalfScore - firstHalfScore;
    
    if (scoreDifference > 0.15) emotionalTrend = 'improving';
    else if (scoreDifference < -0.15) emotionalTrend = 'declining';
    else if (Math.abs(scoreDifference) <= 0.05) emotionalTrend = 'stable';
    else emotionalTrend = 'fluctuating';
  }
  
  const overallRelationshipHealth = relationshipHealthScores.length > 0 
    ? relationshipHealthScores.reduce((sum, score) => sum + score, 0) / relationshipHealthScores.length
    : 0;
  
  const formatPercentage = (value: number) => {
    return parseFloat(value.toFixed(2));
  };
  
  const positivePercentage = formatPercentage((positiveMsgCount / Math.max(totalMessages, 1)) * 100);
  const negativePercentage = formatPercentage((negativeMsgCount / Math.max(totalMessages, 1)) * 100);
  const neutralPercentage = formatPercentage((neutralMsgCount / Math.max(totalMessages, 1)) * 100);
  
  const totalManipulativeMessagesCount = Object.values(participantStats).reduce(
    (total, participant) => total + participant.manipulation.messageCount, 0
  );
  
  return {
    totalMessages,
    totalWords,
    totalCharacters,
    totalEmojis,
    uniqueEmojis: allEmojis,
    participantStats,
    startDate,
    endDate,
    duration: durationDays,
    mostActiveDate,
    mostActiveHour,
    messagesByDate,
    messagesByHour,
    mediaStats: overallMediaStats,
    sentiment: {
      overallScore: totalMessages > 0 ? totalSentimentScore / totalMessages : 0,
      positivePercentage: positivePercentage,
      negativePercentage: negativePercentage,
      neutralPercentage: neutralPercentage,
      emotionalTrend,
      detailedEmotions: detailedEmotionsTotal
    },
    manipulation: {
      mostManipulative,
      averageScore: totalMessages > 0 
        ? Object.values(participantManipulationScores).flat().reduce((sum, score) => sum + score, 0) / totalMessages 
        : 0,
      totalManipulativeMessages: totalManipulativeMessagesCount,
      messagesByType: manipulationMessagesByType,
      patterns: manipulationPatterns
    },
    apologies: {
      total: totalApologies,
      mostApologetic: mostApologeticPerson,
      apologyExamples
    },
    loveExpressions: {
      total: totalLoveExpressions,
      mostRomantic: mostRomanticPerson,
      iLoveYouCount: iLoveYouCounts,
      mostCommonExpressions: sortedLoveExpressions
    },
    relationshipHealth: {
      overallScore: overallRelationshipHealth,
      communicationBalance: 0.5,
      intimacyLevel: formatPercentage(totalLoveExpressions / Math.max(totalMessages, 1)),
      conflictLevel: formatPercentage(negativeMsgCount / Math.max(totalMessages, 1)),
      stabilityScore: 0.5,
      growthTrend: emotionalTrend,
      positiveIndicators: Object.entries(relationshipIndicators.positive)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      negativeIndicators: Object.entries(relationshipIndicators.negative)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    },
    wordAnalysis: {
      mostFrequentWords: topWords,
      mostFrequentWordsByParticipant: topWordsByParticipant,
      mostFrequentStartWords: topStartWords
    },
    conversationAnalysis: {
      mostInitiator,
      mostReplier,
      fastestResponder,
      mostDisagreements,
      mostAgreements
    }
  };
}
