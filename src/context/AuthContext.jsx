import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext({});
// src/context/AuthContext.jsx

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persistence: Check for user on refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await API.post('refresh/');
        setUser(data.user);
        sessionStorage.setItem('access_token', data.access);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await API.post('login/', credentials);
    setUser(data.user);
    sessionStorage.setItem('access_token', data.access);
  };

  const logout = async () => {
    await API.post('logout/');
    setUser(null);
    sessionStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};



// import {createContext, useContext, useEffect, useState,} from "react";

// import {
//   login as loginRequest,
//   logout as logoutRequest,
//   refreshAccessToken,
// } from "../api/auth";


// const AuthContext = createContext();


// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const [accessToken, setAccessToken] = useState(null);

//   const [loading, setLoading] = useState(true);


//   const login = async (username, password) => {
//     const data = await loginRequest(username, password);

//     setAccessToken(data.access);

//     setUser(data.user);

//     return data;
//   };


//   const logout = async () => {
//     try {
//       await logoutRequest();
//     } catch (error) {
//       console.error(error);
//     }

//     setUser(null);

//     setAccessToken(null);
//   };


//   const refreshToken = async () => {
//     try {
//       const newAccessToken = await refreshAccessToken();

//       setAccessToken(newAccessToken);

//       return newAccessToken;
//     } catch (error) {
//       logout();

//       return null;
//     }
//   };


//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         await refreshToken();
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);


//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         accessToken,
//         login,
//         logout,
//         refreshToken,
//         loading,
//         setUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };


// export const useAuth = () => useContext(AuthContext);
