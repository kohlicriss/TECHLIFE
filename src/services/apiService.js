import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.244:8082/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the initial list of chats (groups and private) for a user.
 * @param {string} employeeId - The ID of the current user.
 */
export const getChatOverview = async (employeeId) => {  
  try {
    const response = await apiClient.get(`/overview/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat overview:", error);
    return []; 
  }
};

/**
 * Fetches the message history for a specific chat.
 * @param {string} employeeId - The ID of the current user.
 * @param {string} chatId - The ID of the chat (private user or group).
 */
export const getMessages = async (employeeId, chatId) => {
  try {
    const response = await apiClient.get(`/chat/${employeeId}/${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch messages for chat ${chatId}:`, error);
    return [];
  }
};

/**
 * BUG FIX: Updates an existing message.
 * Now accepts 'chatType' and sends it in the request body to prevent backend error.
 * @param {number} messageId - The ID of the message to update.
 * @param {string} newContent - The new text content for the message.
 * @param {string} chatType - The type of chat ('PRIVATE' or 'TEAM').
 */
export const updateMessage = async (messageId, newContent, chatType) => {
  try {
    const requestBody = {
      content: newContent,
      type: chatType, // This was the missing piece causing the 500 error.
    };
    const response = await apiClient.put(`/chat/update/${messageId}`, requestBody);
    return response.data;
  } catch (error) {
    console.error(`Failed to update message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Deletes a message for the current user only.
 * @param {number} messageId - The ID of the message to delete.
 * @param {string} userId - The ID of the current user.
 */
export const deleteMessageForMe = async (messageId, userId) => {
  try {
    const response = await apiClient.post(`/chat/${messageId}/me?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for me:`, error);
    throw error;
  }
};

/**
 * Deletes a message for everyone in the chat (sender only).
 * @param {number} messageId - The ID of the message to delete.
 * @param {string} userId - The ID of the sender.
 */
export const deleteMessageForEveryone = async (messageId, userId) => {
  try {
    const response = await apiClient.post(`/chat/${messageId}/everyone?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for everyone:`, error);
    throw error;
  }
};

/**
 * Uploads a file.
 * @param {FormData} formData - The form data containing the file and other info.
 */
export const uploadFile = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
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