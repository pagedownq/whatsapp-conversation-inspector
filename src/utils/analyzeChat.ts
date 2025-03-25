import { ChatMessage, getParticipants } from './parseChat';
import { analyzeSentiment, detectManipulation, SentimentResult, ManipulationResult } from './sentimentAnalysis';

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
  };
  manipulation: {
    mostManipulative: string;
    averageScore: number;
    messagesByType: Record<string, number>;
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
 * Analyze chat data and produce statistics
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
      }
    };
  });
  
  // Group messages by date and hour
  const messagesByDate: Record<string, number> = {};
  const messagesByHour: Record<number, number> = {};
  
  // Overall media stats
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
  
  // Process messages
  let totalMessages = 0;
  let totalWords = 0;
  let totalCharacters = 0;
  let totalEmojis = 0;
  const allEmojis = new Set<string>();
  
  // Calculate response times
  const responseTimes = calculateResponseTimes(sortedMessages);
  
  // Sentiment analysis totals
  let totalSentimentScore = 0;
  let positiveMsgCount = 0;
  let neutralMsgCount = 0;
  let negativeMsgCount = 0;
  
  // Manipulation analysis
  const manipulationMessagesByType: Record<string, number> = {};
  const participantManipulationScores: Record<string, number[]> = {};
  participants.forEach(p => {
    participantManipulationScores[p] = [];
  });
  
  // Process each message
  for (let i = 0; i < sortedMessages.length; i++) {
    const message = sortedMessages[i];
    const participant = message.sender;
    
    // Update global counts
    totalMessages++;
    totalWords += message.wordCount;
    totalCharacters += message.characterCount;
    totalEmojis += message.emojiCount;
    
    // Update participant stats
    const stats = participantStats[participant];
    stats.messageCount++;
    stats.wordCount += message.wordCount;
    stats.characterCount += message.characterCount;
    stats.emojiCount += message.emojiCount;
    
    // Track longest message
    if (message.messageLength > stats.longestMessage.length) {
      stats.longestMessage.content = message.content;
      stats.longestMessage.length = message.messageLength;
    }
    
    // Process emojis
    if (message.hasEmoji) {
      const emojis = message.content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/ug) || [];
      
      emojis.forEach(emoji => {
        stats.uniqueEmojis.add(emoji);
        allEmojis.add(emoji);
      });
    }
    
    // Process media
    if (message.isMedia) {
      stats.mediaCount++;
      overallMediaStats.total++;
      
      // Update media type counts
      switch (message.mediaType) {
        case 'image':
          stats.mediaStats.images++;
          overallMediaStats.images++;
          break;
        case 'video':
          stats.mediaStats.videos++;
          overallMediaStats.videos++;
          break;
        case 'document':
          stats.mediaStats.documents++;
          overallMediaStats.documents++;
          break;
        case 'link':
          stats.mediaStats.links++;
          overallMediaStats.links++;
          break;
        case 'sticker':
          stats.mediaStats.stickers++;
          overallMediaStats.stickers++;
          break;
        case 'gif':
          stats.mediaStats.gifs++;
          overallMediaStats.gifs++;
          break;
        case 'audio':
          stats.mediaStats.audio++;
          overallMediaStats.audio++;
          break;
      }
    }
    
    // Update date and hour stats
    messagesByDate[message.date] = (messagesByDate[message.date] || 0) + 1;
    
    const hour = parseInt(message.time.split(':')[0]);
    messagesByHour[hour] = (messagesByHour[hour] || 0) + 1;
    
    // Analyze sentiment if the message has content and is not just media
    if (message.content && message.content.length > 0 && !message.isMedia) {
      const sentimentResult = analyzeSentiment(message.content);
      
      // Update global sentiment counts
      totalSentimentScore += sentimentResult.score;
      if (sentimentResult.dominant === 'positive') positiveMsgCount++;
      else if (sentimentResult.dominant === 'negative') negativeMsgCount++;
      else neutralMsgCount++;
      
      // Update participant sentiment stats
      stats.sentiment.averageScore = 
        (stats.sentiment.averageScore * (stats.sentiment.positiveMsgCount + stats.sentiment.negativeMsgCount + stats.sentiment.neutralMsgCount) + sentimentResult.score) / 
        (stats.sentiment.positiveMsgCount + stats.sentiment.negativeMsgCount + stats.sentiment.neutralMsgCount + 1);
      
      if (sentimentResult.dominant === 'positive') stats.sentiment.positiveMsgCount++;
      else if (sentimentResult.dominant === 'negative') stats.sentiment.negativeMsgCount++;
      else stats.sentiment.neutralMsgCount++;
      
      // Track most positive/negative messages
      if (sentimentResult.score > stats.sentiment.mostPositiveMessage.score) {
        stats.sentiment.mostPositiveMessage = {
          content: message.content,
          score: sentimentResult.score
        };
      }
      
      if (sentimentResult.score < stats.sentiment.mostNegativeMessage.score) {
        stats.sentiment.mostNegativeMessage = {
          content: message.content,
          score: sentimentResult.score
        };
      }
      
      // Analyze manipulation
      const manipulationResult = detectManipulation(message.content);
      if (manipulationResult.score > 0) {
        stats.manipulation.messageCount++;
        participantManipulationScores[participant].push(manipulationResult.score);
        
        // Track manipulation types
        manipulationResult.instances.forEach(instance => {
          manipulationMessagesByType[instance.type] = (manipulationMessagesByType[instance.type] || 0) + 1;
        });
        
        // Store example messages (limited to 5 most manipulative)
        if (manipulationResult.score > 0.3) {  // Only store significant examples
          stats.manipulation.examples.push({
            content: message.content,
            score: manipulationResult.score,
            instances: manipulationResult.instances
          });
          
          // Keep only the top 5 most manipulative examples
          if (stats.manipulation.examples.length > 5) {
            stats.manipulation.examples.sort((a, b) => b.score - a.score);
            stats.manipulation.examples = stats.manipulation.examples.slice(0, 5);
          }
        }
      }
    }
  }
  
  // Calculate average message length and response time statistics
  participants.forEach(participant => {
    const stats = participantStats[participant];
    stats.averageMessageLength = stats.messageCount > 0 
      ? stats.characterCount / stats.messageCount 
      : 0;
    
    const times = responseTimes[participant];
    if (times.length > 0) {
      stats.responseTime.average = times.reduce((sum, time) => sum + time, 0) / times.length;
      stats.responseTime.fastest = Math.min(...times);
      stats.responseTime.slowest = Math.max(...times);
    }
    
    // Calculate top emojis for each participant
    const participantMessages = sortedMessages.filter(m => m.sender === participant);
    const emojiMap = countEmojis(participantMessages);
    stats.topEmojis = getTopEmojis(emojiMap);
    
    // Calculate average manipulation score
    const manipulationScores = participantManipulationScores[participant];
    stats.manipulation.averageScore = manipulationScores.length > 0
      ? manipulationScores.reduce((sum, score) => sum + score, 0) / manipulationScores.length
      : 0;
  });
  
  // Find most active date and hour
  let mostActiveDate = '';
  let maxDateCount = 0;
  
  Object.entries(messagesByDate).forEach(([date, count]) => {
    if (count > maxDateCount) {
      mostActiveDate = date;
      maxDateCount = count;
    }
  });
  
  let mostActiveHour = 0;
  let maxHourCount = 0;
  
  Object.entries(messagesByHour).forEach(([hour, count]) => {
    const hourNum = parseInt(hour);
    if (count > maxHourCount) {
      mostActiveHour = hourNum;
      maxHourCount = count;
    }
  });
  
  // Find most manipulative participant
  let mostManipulative = '';
  let highestManipulationScore = -1;
  
  Object.entries(participantStats).forEach(([name, stats]) => {
    if (stats.manipulation.averageScore > highestManipulationScore) {
      mostManipulative = name;
      highestManipulationScore = stats.manipulation.averageScore;
    }
  });
  
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
      positivePercentage: totalMessages > 0 ? (positiveMsgCount / totalMessages) * 100 : 0,
      negativePercentage: totalMessages > 0 ? (negativeMsgCount / totalMessages) * 100 : 0,
      neutralPercentage: totalMessages > 0 ? (neutralMsgCount / totalMessages) * 100 : 0
    },
    manipulation: {
      mostManipulative,
      averageScore: totalMessages > 0 
        ? Object.values(participantManipulationScores).flat().reduce((sum, score) => sum + score, 0) / totalMessages 
        : 0,
      messagesByType: manipulationMessagesByType
    }
  };
}
