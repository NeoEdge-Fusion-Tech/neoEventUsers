User ApP
src/
├── api/
│   ├── axios.js          # The "Engine": Interceptors for tokens & 401s
│   ├── auth.js           # The "Service": Specific API calls (login, register)
├── context/
│   ├── AuthContext.jsx   # The "State": Global user & loading status
├── hooks/
│   ├── useAuth.js        # The "Hook": Easy access to context
├── components/           # (Added)
│   ├── ProtectedRoute.jsx # Wrapper for private pages
├── utils/                # (Added)
│   ├── tokenManager.js   # Helper to store/get Access Token in memory

