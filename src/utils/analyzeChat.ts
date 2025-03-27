import { ChatMessage, getParticipants } from './parseChat';
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
  conversationPatterns.weekdayActivity = calculateWeekdayActivity(sortedMessages
