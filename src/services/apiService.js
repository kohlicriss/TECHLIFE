import axios from 'axios';

const AUTH_API_URL = 'https://hrms.anasolconsultancyservices.com/api/auth/refresh-token';

function cloneFormData(formData) {
    const newFormData = new FormData();
    for (let [key, value] of formData.entries()) {
        newFormData.append(key, value);
    }
    return newFormData;
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const createAxiosInstance = (baseURL) => {
    const instance = axios.create({
        baseURL: baseURL,
    });

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            console.log('Request Headers (from Interceptor):', config.headers);
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                    .then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return instance(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const oldToken = localStorage.getItem('accessToken');
                console.log(`🔴 Token expired for ${baseURL}. Old Token:`, oldToken);

                try {
                    const refreshResponse = await axios.post(
                        AUTH_API_URL,
                        {},
                        { withCredentials: true }
                    );

                    const { accessToken } = refreshResponse.data;
                    localStorage.setItem('accessToken', accessToken);
                    console.log(`🟢 New Token for ${baseURL}:`, accessToken);

                    if (originalRequest.data instanceof FormData) {
                        originalRequest.data = cloneFormData(originalRequest.data);
                    }

                    processQueue(null, accessToken);

                    const newInstance = createAxiosInstance(baseURL);
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    return newInstance(originalRequest);

                } catch (refreshError) {
                    console.error("Refresh token failed. Logging out.", refreshError);
                    localStorage.clear();
                    window.location.href = '/login';
                    processQueue(refreshError);
                    return Promise.reject(refreshError);

                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken') {
        console.log("🔄 Token updated in another tab:", event.newValue);
    }
});
export const chatApi = createAxiosInstance('https://hrms.anasolconsultancyservices.com/api');

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
    const response = await chatApi.post(`/chat/${messageId}/me?userId=${userId}`);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId} for me:`, error);
    throw error;
  }
};

export const deleteMessageForEveryone = async (messageId, userId) => {
  try {
    const response = await chatApi.post(`/chat/${messageId}/everyone?userId=${userId}`);
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
    const response = await chatApi.get(`/chat/team/employee/${teamId}`);
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