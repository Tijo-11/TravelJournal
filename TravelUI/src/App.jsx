import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "./components/NavBar"; // ⬅️ Import NavBar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import PasswordReset from "./pages/PasswordReset";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./components/AuthProvider";
import { ErrorBoundary } from "react-error-boundary";
import { setupInactivityTimeout } from "./utils/inactivityTimeout";
import EditJournal from "./components/EditJournal";
import NotFound from "./components/NotFound";
import VerifyPending from "./pages/VerifyPending";
import VerifyEmail from "./pages/VerifyEmail";
import CreateJournal from "./components/CreateJournal";

function App() {
  useEffect(() => {
    const cleanup = setupInactivityTimeout(); // runs once on component mount to start an inactivity timeout, eturns a cleanup function that clears the timeout when the component unmounts, preventing memory leaks.
    return cleanup;
  }, []);

  const ErrorFallback = (
    { error } //UI fallback component inside an Error Boundary, which catches JavaScript errors in child components.
  ) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="text-gray-600">{error.message}</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <NavBar />{" "}
          {/* NavBar outside of Routes :- Placing <NavBar /> outside <Routes> ensures it renders on every page, providing consistent navigation regardless of the current route.*/}
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/verify-pending" element={<VerifyPending />} />
            <Route path="/verify-email/:token/" element={<VerifyEmail />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/create" element={<CreateJournal />} />

              <Route path="/journals/:id/edit" element={<EditJournal />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
