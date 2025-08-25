import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.244:8082/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getChatOverview = async (employeeId) => {
  try {
    const response = await apiClient.get(`/chat/overview/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat overview:", error);
    return [];
  }
};

export const getMessages = async (employeeId, chatId) => {
  try {
    const response = await apiClient.get(`/chat/${employeeId}/${chatId}`);
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
    const response = await apiClient.put(`/chat/update/${messageId}`, requestBody);
    return response.data;
  } catch (error) {
    console.error(`Failed to update message ${messageId}:`, error);
    throw error;
  }
};

export const deleteMessageForMe = async (messageId, userId) => {
  try {
    const response = await apiClient.post(`/chat/${messageId}/me?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for me:`, error);
    throw error;
  }
};

export const deleteMessageForEveryone = async (messageId, userId) => {
  try {
    const response = await apiClient.post(`/chat/${messageId}/everyone?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for everyone:`, error);
    throw error;
  }
};

export const uploadFile = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("File upload failed:", error);
        throw error;
    }
};

export const forwardMessage = async (forwardData) => {
    try {
        const response = await apiClient.post('/chat/forward', forwardData);
        return response.data;
    } catch (error) {
        console.error(`Failed to forward message ${forwardData.forwardMessageId}:`, error);
        throw error;
    }
};

export const pinMessage = async (messageId, userId) => {
    try {
        const response = await apiClient.post(`/chat/pin/${messageId}?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to pin message ${messageId}:`, error);
        throw error;
    }
};

export const unpinMessage = async (messageId, userId) => {
    try {
        const response = await apiClient.post(`/chat/unpin/${messageId}?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to unpin message ${messageId}:`, error);
        throw error;
    }
};

export const getPinnedMessage = async (chatId, chatType, userId) => {
    try {
        const response = await apiClient.get(`/chat/${chatId}/pinned?chatType=${chatType}&userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch pinned message for chat ${chatId}:`, error);
        return null;
    }
};

export const clearChatHistory = async (userId, chatId) => {
  try {
    const response = await apiClient.post(`/chat/clear?userId=${userId}&chatId=${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to clear chat for ${chatId}:`, error);
    throw error;
  }
};

export const uploadVoiceMessage = async (voiceData) => {
    try {
        const response = await apiClient.post('/chat/voice/upload', voiceData); 
        return response.data;
    } catch (error) {
        console.error("Voice message upload failed:", error);
        throw error;
    }
};

export const getGroupMembers = async (teamId) => {
  try {
    const response = await apiClient.get(`/chat/team/employee/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch members for team ${teamId}:`, error);
    return null;
  }
};