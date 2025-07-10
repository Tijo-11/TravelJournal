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
1.In classic Redux, you'd write something like:dispatch({ type: "SET_USER", payload: user });
2. In Redux Toolkit (createSlice), you don't need to define action types manually.
3.Redux Toolkit automatically generates the action types for you when you use createSlice
4.Redux Toolkit auto-generates action types in the format: "{sliceName}/{reducerName}".
5.You still can access them if needed via setUser.type. */
