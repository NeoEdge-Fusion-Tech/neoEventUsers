import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterType from './pages/RegisterType';
import Signup from './pages/Signup';

import VendorDashboard from './pages/VendorDashboard';
import OwnerDashboard from './pages/OwnerDashboard';


function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <Navbar />

          <main>
            <Routes>

              {/* Public Routes */}

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/signup"
                element={<RegisterType />}
              />

              <Route
                path="/signup/:type"
                element={<Signup />}
              />

              {/* Vendor Routes */}

              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['VENDOR']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />


              {/* Owner Routes */}

              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </main>
        </div>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}


export default App;


// function App() {
//   return (
//     <ThemeProvider>
//       <Router>
//         <div className="app-container">
//           <Navbar />
//           <main>
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/signup" element={<SignUpPage />} />
//               <Route path="/organizer/dashboard" element={<OrganizerConsole />} />
//               <Route path="/organizer/event/:eventId" element={<OrganizerEventDetails />} />
//               <Route path="/photographer/dashboard" element={<PhotographerDashboard />} />
//               <Route path="/p/:username" element={<PhotographerProfile />} />
//               <Route path="/register/:eventId" element={<Registration />} />
//               <Route path="/tickets" element={<MyTickets />} />
//               <Route path="/my-events" element={<MyEvents />} />
//               <Route path="/settings" element={<ProfileSettings />} />
//               <Route path="/event-console/:regId" element={<EventConsole />} />
//               <Route path="/gallery" element={<PhotoGallery />} />
//             </Routes>
//           </main>
//         </div>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;





// // import { ThemeProvider } from './context/ThemeContext';
// import Registration from './pages/Registration';
// import MyTickets from './pages/MyTickets';
// import MyEvents from './pages/MyEvents';
// import ProfileSettings from './pages/ProfileSettings';
// import EventConsole from './pages/EventConsole';
// import PhotoGallery from './pages/PhotoGallery';

