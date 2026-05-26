import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterType from './pages/RegisterType';
import Signup from './pages/Signup';

import VendorDashboard from './pages/VendorDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import PublicVendorProfile from './pages/PublicVendorProfile';
import ProfileSettings from './pages/ProfileSettings';
import MyTickets from './pages/MyTickets';
import Registration from './pages/Registration';
import OrganizerEventDetails from './pages/OrganizerEventDetails';
import EventConsole from './pages/EventConsole';
import PhotoGallery from './pages/PhotoGallery';
import PaymentVerify from './pages/PaymentVerify';

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

              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['VENDOR']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/vendor/profile/:id"
                element={<PublicVendorProfile />}
              />


              {/* Attendee Routes */}
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute allowedRoles={['ATTENDEE']}>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/event-console/:regId"
                element={
                  <ProtectedRoute allowedRoles={['ATTENDEE']}>
                    <EventConsole />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <PhotoGallery />
                  </ProtectedRoute>
                }
              />

              {/* Public Registration Purchase Route */}
              <Route
                path="/register/:eventId"
                element={<Registration />}
              />

              <Route
                path="/payment/verify"
                element={<PaymentVerify />}
              />

              {/* Settings Route */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
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

              <Route
                path="/organizer/event/:eventId"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <OrganizerEventDetails />
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

