
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
  isMedia: boolean;
  mediaType: 'image' | 'video' | 'document' | 'link' | 'sticker' | 'gif' | 'audio' | 'none';
  messageLength: number;
}

// Regular expression for parsing WhatsApp chat lines
// Format: [date, time] sender: message
const messageRegex = /(\d{1,2}[./]\d{1,2}[./]\d{2,4})[,\s]+(\d{1,2}:\d{2})(?:\s*-\s*|\s+)([^:]+):\s*(.*)/;

// Emoji detection regex (fixed version)
const emojiRegex = new RegExp('[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]', 'ug');

// Media detection patterns
const imagePattern = /<Media omitted>|<Media excluded>|image omitted|IMG-|image attached|.jpg|.jpeg|.png|fotoğraf/i;
const videoPattern = /<Media omitted>|<Media excluded>|video omitted|VID-|video attached|.mp4|.mov|.avi|video/i;
const documentPattern = /<Media omitted>|<Media excluded>|document omitted|DOC-|file attached|.pdf|.doc|.xls|.xlsx|belge/i;
const audioPattern = /<Media omitted>|<Media excluded>|audio omitted|AUD-|voice message|.mp3|.wav|.ogg|audio|ses/i;
const stickerPattern = /<Media omitted>|<Media excluded>|sticker omitted|sticker|çıkartma/i;
const gifPattern = /<Media omitted>|<Media excluded>|GIF omitted|.gif|GIF/i;
const linkPattern = /https?:\/\/[^\s]+/i;

/**
 * Detect media type from message content
 */
function detectMediaType(content: string): 'image' | 'video' | 'document' | 'link' | 'sticker' | 'gif' | 'audio' | 'none' {
  if (linkPattern.test(content)) return 'link';
  if (imagePattern.test(content)) return 'image';
  if (videoPattern.test(content)) return 'video';
  if (documentPattern.test(content)) return 'document';
  if (stickerPattern.test(content)) return 'sticker';
  if (gifPattern.test(content)) return 'gif';
  if (audioPattern.test(content)) return 'audio';
  return 'none';
}

/**
 * Determine if a message contains media based on its content
 */
export function isMediaMessage(content: string): boolean {
  return detectMediaType(content) !== 'none';
}

/**
 * Parse WhatsApp chat text into structured message objects
 */
export function parseChat(chatText: string): ChatMessage[] {
  console.log("Parsing chat with length:", chatText.length);
  
  if (!chatText || chatText.trim() === '') {
    console.error("Empty chat text provided");
    return [];
  }
  
  try {
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
        const emojis = content.match(emojiRegex) || [];
        const emojiCount = emojis.length;
        
        // Count words (excluding emojis)
        const contentWithoutEmojis = content.replace(emojiRegex, '');
        const wordCount = contentWithoutEmojis.split(/\s+/).filter(word => word.trim() !== '').length;
        
        // Detect media type
        const mediaType = detectMediaType(content);
        const isMedia = mediaType !== 'none';
        
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
          characterCount: content.length,
          isMedia,
          mediaType,
          messageLength: content.length
        };
      } else if (currentMessage) {
        // This line is a continuation of the previous message
        currentMessage.content += '\n' + line;
        
        // Update counts
        const emojis = (line.match(emojiRegex) || []);
        currentMessage.emojiCount += emojis.length;
        
        const lineWithoutEmojis = line.replace(emojiRegex, '');
        currentMessage.wordCount += lineWithoutEmojis.split(/\s+/).filter(word => word.trim() !== '').length;
        currentMessage.characterCount += line.length;
        currentMessage.hasEmoji = currentMessage.emojiCount > 0;
        currentMessage.messageLength = currentMessage.content.length;
        
        // Check if this continuation contains media
        if (!currentMessage.isMedia) {
          const mediaType = detectMediaType(line);
          if (mediaType !== 'none') {
            currentMessage.isMedia = true;
            currentMessage.mediaType = mediaType;
          }
        }
      }
    }
    
    // Add the last message if there is one
    if (currentMessage) {
      messages.push(currentMessage);
    }
    
    console.log(`Parsed ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error("Error parsing chat:", error);
    return [];
  }
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
  const matches = text.match(emojiRegex);
  return matches || [];
}
