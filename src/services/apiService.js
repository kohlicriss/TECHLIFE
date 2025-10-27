import { publicinfoApi, chatApi } from '../axiosInstance';

export const getChatOverview = async (employeeId, page = 0, size = 10) => {
  try {
    const response = await chatApi.get(`/chat/overview/${employeeId}?page=${page}&size=${size}`);
    console.log(`Response for page ${page}:`, response);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat overview:", error);
    return [];
  }
};

export const getMessages = async (employeeId, chatId, page = 0, size = 15) => {
  try {
    const response = await chatApi.get(`/chat/${employeeId}/${chatId}?page=${page}&size=${size}`);
    console.log(`Response for messages page ${page}:`, response);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch messages for chat ${chatId}:`, error);
    return [];
  }
};

export const updateMessage = async (messageId, newContent, senderId) => {
  try {
    const requestBody = {
      content: newContent,
      sender: senderId,
    };
    const response = await chatApi.put(`/chat/update/${messageId}`, requestBody);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to update message ${messageId}:`, error);
    throw error;
  }
};

export const deleteMessageForMe = async (messageId, userId) => {
  try {
    const response = await chatApi.post(`/chat/delete/${messageId}/me?userId=${userId}`);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for me:`, error);
    throw error;
  }
};

export const deleteMessageForEveryone = async (messageId, userId) => {
  try {
    const response = await chatApi.post(`/chat/delete/${messageId}/everyone?userId=${userId}`);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for everyone:`, error);
    throw error;
  }
};

export const uploadFile = async (formData) => {
    try {
        const response = await chatApi.post('/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Response:', response);
        return response.data;
    } catch (error) {
        console.error("File upload failed:", error);
        throw error;
    }
};

export const forwardMessage = async (forwardData) => {
    try {
        const response = await chatApi.post('/chat/forward', forwardData);
        console.log('Response:', response);
        return response.data;
    } catch (error) {
        console.error(`Failed to forward message ${forwardData.forwardMessageId}:`, error);
        throw error;
    }
};

export const pinMessage = async (messageId, userId) => {
    try {
        const response = await chatApi.post(`/chat/pin/${messageId}?userId=${userId}`);
        console.log('Response:', response);
        return response.data;
    } catch (error) {
        console.error(`Failed to pin message ${messageId}:`, error);
        throw error;
    }
};

export const unpinMessage = async (messageId, userId) => {
    try {
        const response = await chatApi.post(`/chat/unpin/${messageId}?userId=${userId}`);
        console.log('Response:', response);
        return response.data;
    } catch (error) {
        console.error(`Failed to unpin message ${messageId}:`, error);
        throw error;
    }
};

export const getPinnedMessage = async (chatId, chatType, userId) => {
  try {
    const response = await chatApi.get(`/chat/${chatId}/pinned?chatType=${chatType}&userId=${userId}`);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch pinned message for chat ${chatId}:`, error);
    return null;
  }
};

export const clearChatHistory = async (userId, chatId) => {
  try {
    const response = await chatApi.post(`/chat/clear?userId=${userId}&chatId=${chatId}`);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to clear chat for ${chatId}:`, error);
    throw error;
  }
};

export const uploadVoiceMessage = async (voiceData) => {
  try {
    const response = await chatApi.post('/chat/voice/upload', voiceData);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error("Voice message upload failed:", error);
    throw error;
  }
};

export const getGroupMembers = async (teamId) => {
  try {
    const response = await publicinfoApi.get(`/employee/team/employee/${teamId}`);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch members for team ${teamId}:`, error);
    return null;
  }
};

export const searchMessages = async (userId, chatId, query) => {
  try {
    const response = await chatApi.get(`/chat/search`, {
      params: { userId, chatId, query }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to search messages in chat ${chatId}:`, error);
    return [];
  }
};

export const getMessageContext = async (messageId, userId, chatId) => {
  try {
    const response = await chatApi.get(`/chat/context`, {
      params: { messageId, userId, chatId }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch message context for message ${messageId}:`, error);
    return [];
  }
};

export const getChatAttachments = async (chatId, type) => {
  try {
    const response = await chatApi.get(`/chat/${chatId}/attachments`, {
      params: { type }
    });
    console.log(`Response for ${type}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${type} for chat ${chatId}:`, error);
    return [];
  }
};

export const searchChatOverview = async (employeeId, query) => {
  try {
    const response = await chatApi.get(`/chat/overview/search`, {
      params: { employeeId, query }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search chat overview:", error);
    return [];
  }
};