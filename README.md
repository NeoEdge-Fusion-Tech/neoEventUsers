# Neo Events Frontend

This is the React frontend for the Neo Events platform.

## Engineer Setup Guide

Welcome to the team! Follow these instructions to get the frontend running locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- `npm` or `yarn` (npm is used by default)

### 1. Install Dependencies
Navigate to the frontend directory (`neoEventUsers`) and install the required packages:

```bash
cd neoEventUsers
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `neoEventUsers` directory. You can copy the variables from a provided `.env.example` if it exists, or set the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Run the Development Server
Start the Vite development server:

```bash
npm run dev
```

The application should now be accessible at `http://localhost:5173` (or the port specified in your terminal).

---

## Directory Structure

```text
src/
├── api/
│   ├── axios.js           # The "Engine": Interceptors for tokens & 401s
│   ├── auth.js            # The "Service": Specific API calls (login, register)
├── context/
│   ├── AuthContext.jsx    # The "State": Global user & loading status
├── hooks/
│   ├── useAuth.js         # The "Hook": Easy access to context
├── components/            
│   ├── ProtectedRoute.jsx # Wrapper for private pages
├── pages/                 # React components mapped to routes
├── utils/                 
│   ├── tokenManager.js    # Helper to store/get Access Token in memory
```

## Available Scripts
- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run preview`: Locally preview the production build.
