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
 
export const tasksApi = createAxiosInstance('http://192.168.0.142:8090/api/employee');
export const publicinfoApi = createAxiosInstance('http://192.168.0.142:8090/api');
export const chatApi = createAxiosInstance('https://hrms.anasolconsultancyservices.com/api');
export const notificationsApi = createAxiosInstance('https://hrms.anasolconsultancyservices.com/api/notification');
export const ticketsApi = createAxiosInstance('https://hrms.anasolconsultancyservices.com/api/ticket')
export const authApi = createAxiosInstance('https://hrms.anasolconsultancyservices.com/api/auth')
export const dashboardApi=createAxiosInstance('hrms.anasolconsultancyservices.com/api/attendance')