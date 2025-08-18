/**
 * Transforms the chat overview API response into a format the UI can use.
 * Separates the flat list into groups and private chats.
 * @param {Array<Object>} overviewData - The array from /api/overview/{id}
 * @returns {{groups: Array<Object>, privateChatsWith: Array<Object>}}
 */
export const transformOverviewToChatList = (overviewData) => {
  if (!overviewData || !Array.isArray(overviewData)) {
    return { groups: [], privateChatsWith: [] };
  }

  const chatList = {
    groups: [],
    privateChatsWith: [],
  };

  overviewData.forEach(item => {
    const chatItem = {
      chatId: item.chatId,
      name: item.groupName || item.employeeName,
      lastMessage: item.lastMessage,
      lastMessageTimestamp: item.lastSeen,
      unreadMessageCount: item.unreadMessageCount,
      profile: item.profile || null,
      isOnline: item.isOnline,
      memberCount: item.memberCount || 0,
      type: item.chatType === 'GROUP' ? 'group' : 'private',
    };

    if (chatItem.type === 'group') {
      chatList.groups.push(chatItem);
    } else {
      chatList.privateChatsWith.push(chatItem);
    }
  });

  return chatList;
};

/**
 * Transforms a single message DTO from the backend into the UI's message format.
 * This now handles text, files, replies, and forwarded messages.
 * @param {Object} msgDto - A single ChatMessage object from backend
 * @returns {Object} A message object formatted for the UI
 */
export const transformMessageDTOToUIMessage = (msgDto) => {
    let timestamp;
    try {
        if (msgDto.timestamp) {
            timestamp = new Date(msgDto.timestamp).toISOString();
        } else if (msgDto.date && msgDto.time) {
            timestamp = new Date(`${msgDto.date} ${msgDto.time}`).toISOString();
        } else {
            timestamp = new Date().toISOString();
            console.warn("Message DTO has invalid or missing timestamp:", msgDto);
        }
    } catch (e) {
        timestamp = new Date().toISOString();
        console.error("Failed to parse date-time from DTO:", msgDto, e);
    }

    const API_BASE_URL = 'http://192.168.0.244:8082/api';
    const isFileMessage = msgDto.fileName && msgDto.fileType;
    let messageType = 'text';
    let fileUrl = null;

    if (isFileMessage) {
        fileUrl = `${API_BASE_URL}/chat/file/${msgDto.id}`;

        if (msgDto.fileType.startsWith('image/')) {
            messageType = 'image';
        } else if (msgDto.fileType.startsWith('video/')) {
            messageType = 'video';
        } else if (msgDto.fileType.startsWith('audio/')) {
            messageType = 'audio';
        } else {
            messageType = 'file';
        }
    } else if (msgDto.kind && msgDto.kind.toLowerCase() !== 'send') {
        messageType = msgDto.kind.toLowerCase();
    }

    const finalId = msgDto.id || msgDto.messageId;
    
    // ======================= BUG FIX STARTS HERE =======================
    // Ikkada backend nunchi vache kotha `replyTo` object ni manam correct ga map chesthunnam.
    // Mundhu `msgDto.replyToMessage` ani undedhi, adi backend nunchi ravatledhu.
    // Ippudu manam backend ni kuda marchi `replyTo` ane object ni pampisthunnam.
    return {
        id: finalId, 
        messageId: finalId, 
        content: msgDto.content,
        sender: msgDto.sender,
        timestamp: timestamp,
        status: (msgDto.seen === true || String(msgDto.isSeen) === 'true') ? 'seen' : 'sent',
        type: msgDto.isDeleted ? 'deleted' : messageType,
        isEdited: msgDto.isEdited || false,
        fileName: msgDto.fileName || null,
        fileUrl: fileUrl,
        fileSize: msgDto.fileSize || null,
        clientId: msgDto.clientId || null,

        isForwarded: msgDto.forwarded || false,
        forwardedFrom: msgDto.forwardedFrom || null,

        isReply: !!msgDto.replyTo,
        replyTo: msgDto.replyTo ? {
            sender: msgDto.replyTo.senderId,
            content: msgDto.replyTo.content,
            originalMessageId: msgDto.replyTo.originalMessageId,
            type: msgDto.replyTo.type // Original message type (text, image, etc.)
        } : null,
    };
    // ======================= BUG FIX ENDS HERE =========================
};