import { chatApi } from "../axiosInstance";

export const generateChatListPreview = (item, currentUserId) => {
    if (!item.lastMessage || item.lastMessage === 'Chat cleared') {
      return '';
    }

    const lastMessageContent = item.lastMessage;
    const prefix = item.lastMessageSenderId === currentUserId ? 'You: ' : '';

    if (item.lastMessageType) {
        switch (item.lastMessageType.toUpperCase()) {
            case 'IMAGE': return prefix + '📷 Image';
            case 'AUDIO': return prefix + '🎤 Voice Message';
            case 'FILE': return prefix + `📎 ${lastMessageContent}`;
            case 'DELETED': return 'This message was deleted';
        }
    }
    if (lastMessageContent.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        return prefix + '📷 Image';
    }
    if (lastMessageContent.match(/\.(mp3|wav|ogg|m4a|webm)$/i)) {
        return prefix + '🎤 Voice Message';
    }
    if (lastMessageContent.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i)) {
        return prefix + `📎 ${lastMessageContent}`;
    }

    return prefix + lastMessageContent;
};

export const transformOverviewToChatList = (overviewData, currentUserId) => { 
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
            lastMessage: generateChatListPreview(item, currentUserId), 
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
            const tsString = String(msgDto.timestamp);
            timestamp = new Date(tsString.endsWith('Z') ? tsString : tsString + 'Z').toISOString();
        } else if (msgDto.date && msgDto.time) {
            timestamp = new Date(`${msgDto.date} ${msgDto.time} UTC`).toISOString();
        } else {
            timestamp = new Date().toISOString();
        }
    } catch (e) {
        timestamp = new Date().toISOString();
    }
    
    let messageType = 'text';
    let fileUrl = msgDto.fileUrl || null;

    if (msgDto.fileName) {
        if (msgDto.fileType) {
            if (msgDto.fileType.startsWith('image/')) messageType = 'image';
            else if (msgDto.fileType.startsWith('audio/')) messageType = 'audio';
            else if (msgDto.fileType.startsWith('video/')) messageType = 'video';
            else messageType = 'file';
        } else {
            if (msgDto.fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i)) messageType = 'image';
            else if (msgDto.fileName.match(/\.(mp3|wav|ogg|m4a)$/i)) messageType = 'audio';
            else if (msgDto.fileName.match(/\.(mp4|webm|mov)$/i)) messageType = 'video';
            else messageType = 'file';
        }
    } else if (msgDto.kind && msgDto.kind !== 'text') {
        messageType = msgDto.kind.toLowerCase();
    }
    
    const messageIdForUrl = msgDto.id || msgDto.messageId;

    if (!fileUrl && ['image', 'video', 'audio', 'file'].includes(messageType) && messageIdForUrl) {
        const baseUrl = chatApi.defaults.baseURL;
        fileUrl = `${baseUrl}/chat/file/${messageIdForUrl}`;
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
