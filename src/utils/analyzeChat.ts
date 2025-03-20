
import { ChatMessage, getParticipants } from './parseChat';

export interface ParticipantStats {
  name: string;
  messageCount: number;
  wordCount: number;
  characterCount: number;
  emojiCount: number;
  uniqueEmojis: Set<string>;
  topEmojis: Array<{emoji: string, count: number}>;
  averageMessageLength: number;
  longestMessage: number;
  mediaCount: number;
  responseTime: {
    average: number | null;
    fastest: number | null;
    slowest: number | null;
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
 * Check if a message contains media
 */
function containsMedia(message: ChatMessage): boolean {
  const mediaIndicators = [
    '<Media omitted>',
    '<Media excluded>',
    '(file attached)',
    'image omitted',
    'video omitted',
    'audio omitted',
    'sticker omitted',
    'GIF omitted'
  ];
  
  return mediaIndicators.some(indicator => 
    message.content.toLowerCase().includes(indicator.toLowerCase())
  );
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
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  const startDate = sortedMessages[0].date;
  const endDate = sortedMessages[sortedMessages.length - 1].date;
  const startTime = new Date(sortedMessages[0].timestamp).getTime();
  const endTime = new Date(sortedMessages[sortedMessages.length - 1].timestamp).getTime();
  const durationDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
  
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
      longestMessage: 0,
      mediaCount: 0,
      responseTime: {
        average: null,
        fastest: null,
        slowest: null
      }
    };
  });
  
  // Group messages by date and hour
  const messagesByDate: Record<string, number> = {};
  const messagesByHour: Record<number, number> = {};
  
  // Process messages
  let totalMessages = 0;
  let totalWords = 0;
  let totalCharacters = 0;
  let totalEmojis = 0;
  const allEmojis = new Set<string>();
  
  // Response time calculation variables
  const responseTimes: Record<string, number[]> = {};
  participants.forEach(p => {
    responseTimes[p] = [];
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
    
    if (message.hasEmoji) {
      const emojis = message.content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/ug) || [];
      
      emojis.forEach(emoji => {
        stats.uniqueEmojis.add(emoji);
        allEmojis.add(emoji);
      });
    }
    
    if (containsMedia(message)) {
      stats.mediaCount++;
    }
    
    stats.longestMessage = Math.max(stats.longestMessage, message.content.length);
    
    // Update date and hour stats
    messagesByDate[message.date] = (messagesByDate[message.date] || 0) + 1;
    
    const hour = parseInt(message.time.split(':')[0]);
    messagesByHour[hour] = (messagesByHour[hour] || 0) + 1;
    
    // Calculate response time if this is a response to the previous message
    if (i > 0) {
      const prevMessage = sortedMessages[i - 1];
      if (prevMessage.sender !== participant) {
        const prevTime = new Date(prevMessage.timestamp).getTime();
        const currTime = new Date(message.timestamp).getTime();
        const responseTime = (currTime - prevTime) / (1000 * 60); // in minutes
        
        responseTimes[participant].push(responseTime);
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
    if (count > maxHourCount) {
      mostActiveHour = parseInt(hour);
      maxHourCount = count;
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
    messagesByHour
  };
}
