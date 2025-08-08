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
 * @param {Object} msgDto - A single ChatMessageOverviewDTO object
 * @returns {Object} A message object formatted for the UI
 */
export const transformMessageDTOToUIMessage = (msgDto) => {
    let messageType = 'text';
    if (msgDto.kind && msgDto.kind.toLowerCase() !== 'send') {
        messageType = msgDto.kind.toLowerCase();
    }

    let timestamp;
    try {
        if (msgDto.date && msgDto.time) {
            timestamp = new Date(`${msgDto.date} ${msgDto.time}`).toISOString();
        } else {
            timestamp = new Date().toISOString();
            console.warn("Message DTO has invalid or missing date/time:", msgDto);
        }
    } catch (e) {
        timestamp = new Date().toISOString();
        console.error("Failed to parse date-time from DTO:", msgDto, e);
    }
    
    return {
        id: msgDto.messageId,
        messageId: msgDto.messageId,
        content: msgDto.content,
        sender: msgDto.sender,
        timestamp: timestamp,
        status: (msgDto.isSeen === 'true' || msgDto.isSeen === true) ? 'seen' : 'sent',
        type: messageType,
        isEdited: false, 
        fileName: null, 
        fileSize: null,
    };
};