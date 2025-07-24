import { configureStore } from "@reduxjs/toolkit"; //configureStore() is a helper from Redux Toolkit that simplifies store setup.
import { persistStore, persistReducer } from "redux-persist";
//persistStore creates a persisted version of your Redux store that saves state to storage, enabling persistence across sessions.
//persistReducer wraps your root reducer to add persistence logic, specifying which parts of the state to save and restore.
import storage from "redux-persist/lib/storage"; //storage is localStorage (by default), to save and retrieve Redux state in the browser.
import authReducer from "./authSlice";

const persistConfig = {
  //redux-persist helps save Redux state to localStorage so it survives page reloads.
  key: "root", //the key name under which the persisted state is stored in localStorage.
  storage,
  whitelist: ["auth"], // limits persistence only to the auth slice of the Redux state, ignoring others.
  // Ensure user object is serialized correctly
  serialize: true,
  deserialize: true, //ensure the state is converted to/from a string format correctly when saving and loading.
};

const persistedReducer = persistReducer(persistConfig, authReducer); //wraps authReducer with persistReducer to enable saving and loading its state based on the persistConfig settings.

export const store = configureStore({
  //The Redux store is created with a single auth slice
  reducer: {
    auth: persistedReducer, //persistedReducer wraps the original reducer (like authReducer), which internally handles actions and their types to update the auth slice of state.
  },
  middleware: (
    getDefaultMiddleware //It uses some custom middleware config to avoid errors from redux-persist about non-serializable data.
  ) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
        ],
        // Allow non-serializable user object
        ignoredPaths: ["auth.user"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production", //enables Redux DevTools only during development
});

export const persistor = persistStore(store); //This allows app to persist and rehydrate state using <PersistGate>.

/*
Yes, you can persist login without using `persistor` by manually storing authentication data (like tokens) 
using libraries such as `js-cookie`. However, `redux-persist` and `js-cookie` serve different purposes and are 
often used together in a secure and user-friendly authentication setup. `redux-persist` helps keep the Redux
 state (like user profile or login status) in `localStorage` or `sessionStorage` so the state survives page 
 reloads, making the app feel seamless. On the other hand, `js-cookie` is used to store sensitive authentication
tokens (like `accessToken` and `refreshToken`) securely in browser cookies. This is important because storing
tokens directly in Redux or localStorage is not safe, as these are easily accessible through browser developer
tools. Cookies can be configured with security flags like `SameSite`, `HttpOnly`, and expiration settings
 to better protect user data. So while you could choose one or the other, using both allows you to persist user 
 state with Redux and `redux-persist` while securely handling tokens using `js-cookie`, giving you both 
 convenience and security in authentication workflows.

*/

/* Store.js Without PERSISTOR___________##$$#$#$%#$#
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Create a basic Redux store with only the auth slice
export const store = configureStore({
  reducer: {
    auth: authReducer, // authReducer directly manages the auth state
  },
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
});
_______________________________
*/
