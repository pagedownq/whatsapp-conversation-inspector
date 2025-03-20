
// Chat message type
export interface ChatMessage {
  timestamp: string;
  date: string;
  time: string;
  sender: string;
  content: string;
  hasEmoji: boolean;
  emojiCount: number;
  wordCount: number;
  characterCount: number;
}

// Regular expression for parsing WhatsApp chat lines
// Format: [date, time] sender: message
const messageRegex = /(\d{1,2}[./]\d{1,2}[./]\d{2,4})[,\s]+(\d{1,2}:\d{2})(?:\s*-\s*|\s+)([^:]+):\s*(.*)/;

// Simple emoji detection regex (this is a simplified version)
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

/**
 * Parse WhatsApp chat text into structured message objects
 */
export function parseChat(chatText: string): ChatMessage[] {
  const lines = chatText.split('\n');
  const messages: ChatMessage[] = [];
  let currentMessage: ChatMessage | null = null;
  
  for (const line of lines) {
    const match = line.match(messageRegex);
    
    if (match) {
      // If we have a current message, add it to the messages array
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      // Extract date, time, sender and content
      const [_, date, time, sender, content] = match;
      
      // Count emojis
      const emojis = (content.match(new RegExp(emojiRegex, 'g')) || []);
      const emojiCount = emojis.length;
      
      // Count words (excluding emojis)
      const contentWithoutEmojis = content.replace(new RegExp(emojiRegex, 'g'), '');
      const wordCount = contentWithoutEmojis.split(/\s+/).filter(word => word.trim() !== '').length;
      
      // Create new message object
      currentMessage = {
        timestamp: `${date} ${time}`,
        date,
        time,
        sender: sender.trim(),
        content,
        hasEmoji: emojiCount > 0,
        emojiCount,
        wordCount,
        characterCount: content.length
      };
    } else if (currentMessage) {
      // This line is a continuation of the previous message
      currentMessage.content += '\n' + line;
      
      // Update counts
      const emojis = (line.match(new RegExp(emojiRegex, 'g')) || []);
      currentMessage.emojiCount += emojis.length;
      
      const lineWithoutEmojis = line.replace(new RegExp(emojiRegex, 'g'), '');
      currentMessage.wordCount += lineWithoutEmojis.split(/\s+/).filter(word => word.trim() !== '').length;
      currentMessage.characterCount += line.length;
      currentMessage.hasEmoji = currentMessage.emojiCount > 0;
    }
  }
  
  // Add the last message if there is one
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

/**
 * Get unique participants from the chat
 */
export function getParticipants(messages: ChatMessage[]): string[] {
  const participants = new Set<string>();
  
  messages.forEach(message => {
    participants.add(message.sender);
  });
  
  return Array.from(participants);
}

/**
 * Extract all emojis from a message
 */
export function extractEmojis(text: string): string[] {
  const matches = text.match(new RegExp(emojiRegex, 'g'));
  return matches || [];
}
