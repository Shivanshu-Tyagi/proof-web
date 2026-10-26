import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppShell from './components/Layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import { lazy, Suspense, useEffect } from 'react';
import axios from 'axios';
import ErrorBoundary from './components/ErrorBoundary';

// Pages load on demand to keep the first download small
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Relationships = lazy(() => import('./pages/Relationships'));
const RelationshipDetail = lazy(() => import('./pages/RelationshipDetail'));
const InviteRelationship = lazy(() => import('./pages/InviteRelationship'));
const Terms = lazy(() => import('./pages/Terms'));
const Milestones = lazy(() => import('./pages/Milestones'));
const Activities = lazy(() => import('./pages/Activities'));
const Certificates = lazy(() => import('./pages/Certificates'));
const CreateMilestone = lazy(() => import('./pages/CreateMilestone'));
const CreateActivity = lazy(() => import('./pages/CreateActivity'));
const CreateTerm = lazy(() => import('./pages/CreateTerm'));
const MilestoneDetail = lazy(() => import('./pages/MilestoneDetail'));
const ActivityDetail = lazy(() => import('./pages/ActivityDetail'));
const TermDetail = lazy(() => import('./pages/TermDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Account = lazy(() => import('./pages/Account'));
const RelationshipCertificateDisplay = lazy(() => import('./pages/RelationshipCertificateDisplay'));
const FindSomeone = lazy(() => import('./pages/FindSomeone'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const RelationshipSettings = lazy(() => import('./pages/RelationshipSettings'));
const History = lazy(() => import('./pages/History'));
const Messages = lazy(() => import('./pages/Messages'));
const Landing = lazy(() => import('./pages/Landing'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Connect = lazy(() => import('./pages/Connect'));

const RedirectTo = ({ to }) => <Navigate to={to(useParams())} replace />;

function App() {
  const { isAuthenticated, getMe } = useAuthStore();
  const { setInitialTheme, theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on app load
    setInitialTheme();
    // Get user data if token exists
    if (isAuthenticated()) {
      getMe();
    }
  }, [isAuthenticated, getMe, setInitialTheme]);

  // The free server sleeps when quiet. Waking it as soon as the site opens means it is usually ready by the time someone signs up.
  useEffect(() => {
    axios.get('/health', { timeout: 65000 }).catch(() => {});
  }, []);

  return (
//  <ListRendering/>
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <AppShell>
        <main>
          <ErrorBoundary>
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-500 dark:text-gray-400">Loading…</div>}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route
              path="/forgot-password"
              element={!isAuthenticated() ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />
            <Route 
              path="/signup" 
              element={!isAuthenticated() ? <Signup /> : <Navigate to="/dashboard" replace />} 
            />
            
            <Route path="/verify/:number" element={<VerifyCertificate />} />
            <Route path="/connect/:registrationId" element={<Connect />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } />

            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />

            <Route path="/messages/:id" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />

            <Route path="/relationships" element={
              <ProtectedRoute>
                <Relationships />
              </ProtectedRoute>
            } />
            
            <Route path="/relationships/invite" element={
              <ProtectedRoute>
                <InviteRelationship />
              </ProtectedRoute>
            } />
            
            <Route path="/relationships/:id" element={
              <ProtectedRoute>
                <RelationshipDetail />
              </ProtectedRoute>
            } />
            {/* Retired pages keep working by forwarding to their replacements */}
            <Route path="/relationships/:id/summary" element={<RedirectTo to={(p) => `/relationships/${p.id}`} />} />
          
            
            <Route path="/relationships/:id/settings" element={
              <ProtectedRoute>
                <RelationshipSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/history/:userId" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            {/* <Route path="/history-search" element={  */}
            {/*   <ProtectedRoute> */}
            {/*     <History /> */}
            {/*   </ProtectedRoute> */}
            {/* } /> */}

            <Route path="/terms" element={
              <ProtectedRoute>
                <Terms />
              </ProtectedRoute>
            } />
            
            <Route path="/terms/create" element={
              <ProtectedRoute>
                <CreateTerm />
              </ProtectedRoute>
            } />
            
            <Route path="/terms/:id" element={
              <ProtectedRoute>
                <TermDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/milestones" element={
              <ProtectedRoute>
                <Milestones />
              </ProtectedRoute>
            } />
            
            <Route path="/milestones/create" element={
              <ProtectedRoute>
                <CreateMilestone />
              </ProtectedRoute>
            } />
            
            <Route path="/milestones/:id" element={
              <ProtectedRoute>
                <MilestoneDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/activities" element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            } />
            
            <Route path="/activities/create" element={
              <ProtectedRoute>
                <CreateActivity />
              </ProtectedRoute>
            } />
            
            <Route path="/activities/:id" element={
              <ProtectedRoute>
                <ActivityDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/certificates" element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            } />
            
            <Route path="/certificates/:id" element={<RedirectTo to={(p) => `/certificates/${p.id}/display`} />} />
            
            <Route path="/certificate2" element={<Navigate to="/certificates" replace />} />
            
            <Route path="/certificates/:id/display" element={
              <ProtectedRoute>
                <RelationshipCertificateDisplay />
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            
            <Route path="/find-someone" element={
              <ProtectedRoute>
                <FindSomeone />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route 
              path="/privacy-policy" 
              element={<PrivacyPolicy />} 
            />
            <Route 
              path="/terms-and-conditions" 
              element={<TermsAndConditions />} 
            />
            <Route 
              path="/contact-us" 
              element={<ContactUs />} 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Landing />
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
        </AppShell>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
        />
      </div>
    </Router>
  );
}

export default App;