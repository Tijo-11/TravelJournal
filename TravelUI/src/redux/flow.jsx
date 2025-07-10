// 1.User logs in with credentials.

// 2.App stores tokens securely.

// 3.App fetches user data.

// 4.Redux stores user.

// 5.Redux persists user even after refresh.

//6. On refresh, AuthProvider re-validates tokens and reloads the user.
////////////////////////////////////////////////////////////////////////////////
//1.Redux Store Setup :-sets up Redux with persistence,
// The auth slice (which holds user info) is saved in localStorage.
//2. Auth Slice gives two actions: setUser() and logout()
//These update the auth.user state inside Redux.
//3.Axios with Interceptors (axiosInstance.js))
//Automatically:Adds the Authorization header to every request
//Automatically:Refreshes token if access token expires (401)

//4.Login Component (Login.jsx)
//Sends login request to backend
// Stores tokens in cookies
// Fetches user profile
// Stores user info in Redux via dispatch(setUser(...))

//5.Auth Provider (AuthProvider.jsx)
//On page load or refresh, this:
// Checks if token is in cookies
// Validates it by calling /profile/
// If valid → dispatches setUser() again
// If invalid → logs out and removes tokens
