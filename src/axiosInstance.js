import axios from 'axios';

const api = axios.create({
    baseURL: "http://192.168.0.120:8090",
    withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const aToken = localStorage.getItem("accessToken");
    if (aToken) {g
      config.headers['Authorization'] = `Bearer ${aToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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

export const tasksApi = createAxiosInstance('http://localhost:8090/api/a/employee');
export const publicinfoApi = createAxiosInstance('http://localhost:8090/api');
export const chatApi = createAxiosInstance('http://192.168.0.244:8082/api');
