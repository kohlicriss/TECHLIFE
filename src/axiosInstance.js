import axios from 'axios';

const AUTH_API_URL = 'http://localhost:8080/api/auth/refresh-token';

// 🔄 FormData clone helper - Good practice to keep
function cloneFormData(formData) {
    const newFormData = new FormData();
    for (let [key, value] of formData.entries()) {
        newFormData.append(key, value);
    }
    return newFormData;
}

// 🚦 A flag to manage a single refresh token request
let isRefreshing = false;
// 📥 A queue to store pending requests
let failedQueue = [];

// 🔁 Process the queue of pending requests
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

    // ➡️ Request Interceptor: Attach the latest token to outgoing requests
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // ⬅️ Response Interceptor: Handle token expiration and refresh
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // 🛑 If a 401 response and it's not a retry request
            if (error.response?.status === 401 && !originalRequest._retry) {
                // Check if the refresh request is already in progress
                if (isRefreshing) {
                    // If refreshing, add the original request to a queue
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                    .then(token => {
                        // When refresh is complete, retry the original request with the new token
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return instance(originalRequest);
                    })
                    .catch(err => {
                        // If refresh failed, reject the original request
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;
                
                // Old token ni print cheyyandi
                const oldToken = localStorage.getItem('accessToken');
                console.log(`🔴 Token expired for ${baseURL}. Old Token:`, oldToken);
                
                console.log("Token expired. Refreshing...");

                try {
                    // 🚀 Make the refresh token request
                    const refreshResponse = await axios.post(
                        AUTH_API_URL,
                        {},
                        { withCredentials: true }
                    );

                    const { accessToken } = refreshResponse.data;
                    localStorage.setItem('accessToken', accessToken);
                    
                    // New token ni print cheyyandi
                    console.log(`🟢 New Token for ${baseURL}:`, accessToken);

                    // ✅ Update the original request with the new token
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // ✅ If FormData, clone it
                    if (originalRequest.data instanceof FormData) {
                        originalRequest.data = cloneFormData(originalRequest.data);
                    }

                    // ✅ Process the queue of failed requests
                    processQueue(null, accessToken);

                    console.log("Token refreshed. Retrying original request.");
                    return instance(originalRequest);

                } catch (refreshError) {
                    // ❌ Refresh token failed. Clear all tokens and redirect.
                    console.error("Refresh token failed. Logging out.", refreshError);
                    localStorage.clear();
                    window.location.href = '/login';
                    processQueue(refreshError); // Reject all queued requests
                    return Promise.reject(refreshError);

                } finally {
                    isRefreshing = false;
                }
            }
            // If not a 401 or it's a retry, reject the promise as normal
            return Promise.reject(error);
        }
    );

    return instance;
};

export const tasksApi = createAxiosInstance('http://localhost:8090/api');
