import axios from 'axios';

// మీ Authorization Server యొక్క URL
const AUTH_API_URL = 'http://localhost:8080/api/auth/refresh-token';

const createAxiosInstance = (baseURL) => {
    const instance = axios.create({
        baseURL: baseURL,
    });

    // 1. ప్రతి రిక్వెస్ట్‌కు ముందు టోకెన్‌ను జోడించడం
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

    // 2. రెస్పాన్స్ వచ్చిన తర్వాత ఎర్రర్‌లను హ్యాండిల్ చేయడం
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // 3. 401 ఎర్రర్ వస్తే మరియు ఇది మొదటి ప్రయత్నం అయితే, టోకెన్‌ను రిఫ్రెష్ చేయండి
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const oldToken = localStorage.getItem('accessToken');
                    console.log(`🔴 Old Token for ${baseURL}:`, oldToken);

                    console.log(`Token expired for ${baseURL}. Refreshing...`);

                    const refreshResponse = await axios.post(
                        AUTH_API_URL,
                        {},
                        { withCredentials: true } // రిఫ్రెష్ టోకెన్ ఉన్న కుకీని పంపడానికి ఇది అవసరం
                    );

                    const { accessToken } = refreshResponse.data;
                    localStorage.setItem('accessToken', accessToken);

                    console.log(`🟢 New Token for ${baseURL}:`, accessToken);

                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    console.log("Token refreshed. Retrying original request.");
                    return instance(originalRequest);

                } catch (refreshError) {
                    console.error("Refresh token failed. Logging out.", refreshError);
                    localStorage.clear();
                    window.location.href = '/login'; // లాగిన్ పేజీకి రీడైరెక్ట్ చేయండి
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export const tasksApi = createAxiosInstance('http://localhost:8090/api');
