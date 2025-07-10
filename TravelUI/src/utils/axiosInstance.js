import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post(
          "http://localhost:8000/api/Users/refresh/",
          { refresh: refreshToken }
        );
        const { access } = response.data;
        Cookies.set("accessToken", access, { expires: 7, sameSite: "Strict" });
        originalRequest.headers.Authorization = `Bearer ${access}`;
        console.log(
          "Token refreshed successfully, retrying request:",
          originalRequest.url
        );
        processQueue(null, access);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error(
          "Refresh token failed:",
          refreshError.response?.data || refreshError.message
        );
        processQueue(refreshError, null);
        isRefreshing = false;
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    if (error.response?.status === 400) {
      console.error(
        "Bad Request error:",
        error.response.data,
        "Request:",
        originalRequest
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

/*An Axios interceptor is a function that runs automatically before a request is sent or 
after a response is received.
 It lets you intercept and modify requests or responses globally — 
 without repeating logic in every API call.
Automatically includes access tokens in requests.

Handles expired tokens by refreshing them using the refresh token.

Cleans up cookies if refresh fails.*/

// The refresh token’s actual expiration is enforced by the backend (Django), controlling how long it remains valid server-side.
// The expires option in the cookie just sets how long the token is stored on the client, which should align with backend settings to avoid mismatches.

// A Promise is an object that represents the eventual result of an asynchronous operation—whether it succeeds (resolved) or fails (rejected).
// It lets you write code that waits for tasks like fetching data without blocking the rest of the program.
