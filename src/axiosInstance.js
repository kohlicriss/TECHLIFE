import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:9090",
    withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const aToken = localStorage.getItem("accessToken");
    if (aToken) {
      config.headers['Authorization'] = `Bearer ${aToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Detected 401 Unauthorized error! Token expired or invalid.');
    }
    return Promise.reject(error);
  }
);

export default api;