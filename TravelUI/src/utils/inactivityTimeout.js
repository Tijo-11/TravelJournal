import { store } from "../redux/store";
import { logout } from "../redux/authSlice";
import Cookies from "js-cookie"; //js-cookie library, a simple API to manage browser cookies in JavaScript. allows easy setting, getting, and deleting of cookies, commonly used for storing tokens or user preferences.

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const setupInactivityTimeout = () => {
  let timeoutId;

  const resetTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      store.dispatch(logout());
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      window.location.href = "/"; // Redirect to login page
    }, INACTIVITY_TIMEOUT);
  };

  // Reset timer on user activity
  ["mousemove", "keypress", "scroll"].forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  // Start timer initially
  resetTimer();

  // Cleanup on component unmount
  return () => {
    clearTimeout(timeoutId);
    ["mousemove", "keypress", "scroll"].forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  };
};
