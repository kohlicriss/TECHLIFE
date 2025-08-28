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

export const transformMessageDTOToUIMessage = (msgDto) => {
  let timestamp;
  try {
    if (msgDto.timestamp) {
      timestamp = new Date(msgDto.timestamp).toISOString();
    } else if (msgDto.date && msgDto.time) {
      timestamp = new Date(`${msgDto.date} ${msgDto.time}`).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }
  } catch (e) {
    timestamp = new Date().toISOString();
  }

  const API_BASE_URL = 'http://192.168.0.244:8082/api';
  
  let messageType = 'text';
  let fileUrl = msgDto.fileUrl || null;

  if (msgDto.fileName && msgDto.fileType) {
    if (msgDto.fileType.startsWith('image/')) {
      messageType = 'image';
    } else if (msgDto.fileType.startsWith('audio/')) {
      messageType = 'audio';
    } else if (msgDto.fileType.startsWith('video/')) {
      messageType = 'video';
    } else {
      messageType = 'file';
    }
  } else if (msgDto.kind && msgDto.kind !== 'text') {
    messageType = msgDto.kind.toLowerCase();
  }
  
  const messageIdForUrl = msgDto.id || msgDto.messageId;
  if (!fileUrl && ['image', 'video', 'audio', 'file'].includes(messageType) && messageIdForUrl) {
    fileUrl = `${API_BASE_URL}/chat/file/${messageIdForUrl}`;
  }
  
  if (msgDto.isDeleted) {
    messageType = 'deleted';
  }

  const finalId = msgDto.id || msgDto.messageId;
  
  return {
    id: finalId, 
    messageId: finalId, 
    content: msgDto.content,
    sender: msgDto.sender,
    timestamp: timestamp,
    status: (msgDto.seen === true || String(msgDto.isSeen) === 'true') ? 'seen' : 'sent',
    type: messageType,
    isEdited: msgDto.isEdited || false,
    isPinned: msgDto.pinned || false,
    fileName: msgDto.fileName || null,
    fileUrl: fileUrl,
    fileSize: msgDto.fileSize || null,
    duration: msgDto.duration || 0,
    clientId: msgDto.clientId || null,
    isForwarded: msgDto.forwarded || false,
    forwardedFrom: msgDto.forwardedFrom || null,
    isReply: !!msgDto.replyTo,
    replyTo: msgDto.replyTo ? {
      sender: msgDto.replyTo.senderId,
      content: msgDto.replyTo.content,
      originalMessageId: msgDto.replyTo.originalMessageId,
      type: msgDto.replyTo.type
    } : null,
  };
};
