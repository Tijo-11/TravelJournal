import { StrictMode } from "react"; //helps highlight potential problems in an app during development. warns about deprecated or unsafe practices to encourage best coding standards.
import ReactDOM from "react-dom/client";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux"; // imports the Redux Provider component that makes the Redux store available to the entire React app.
import { PersistGate } from "redux-persist/integration/react"; //brings in a wrapper that delays rendering  app until persisted Redux state is rehydrated.
//to ensure the UI loads only after restoring saved state from localStorage or sessionStorage.
import "./index.css";
import App from "./App.jsx";
import { store, persistor } from "./redux/store.js"; //persistor object used by redux-persist to manage state persistence.
//store holds the app state, while persistor controls saving and rehydrating that state across sessions.

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            Loading...
          </div>
        }
        persistor={persistor}
      >
        {/*delays rendering its children until the persisted Redux state is fully restored (rehydrated).
        The loading prop shows a fallback UI while this process happens, ensuring the app doesn’t render with incomplete state.*/}
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);

/*Both npm and Yarn are JavaScript package managers, 
but Yarn offers faster installs, better caching, and deterministic dependency resolution via yarn.lock.
npm is the default with Node.js, 
while Yarn is an alternative developed by Meta to improve performance and consistency. 

Rehydrated means restoring the Redux store’s state from persisted storage (like localStorage)
 when the app reloads.*/
