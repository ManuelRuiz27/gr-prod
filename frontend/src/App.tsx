import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Layout from './pages/Layout';
import Meals from './pages/Meals';
import Payments from './pages/Payments';
import Thermo from './pages/Thermo';
import Summary from './pages/Summary';

// Auth & Access Screens
import { GraduateAccessScreen } from './pages/auth/GraduateAccessScreen';
import { GraduateLoginScreen } from './pages/auth/GraduateLoginScreen';
import { GraduateRegisterScreen } from './pages/auth/GraduateRegisterScreen';
import { ForgotPasswordScreen } from './pages/auth/ForgotPasswordScreen';
import { ForgotPasswordSentScreen } from './pages/auth/ForgotPasswordSentScreen';
import { GraduateEventSelectorScreen } from './pages/auth/GraduateEventSelectorScreen';
import { AdminLoginScreen } from './pages/auth/AdminLoginScreen';

// Design System Showcase
import { DesignSystemShowcase } from './pages/showcase/DesignSystemShowcase';

// Shells
import { GraduateLayout } from './shells/graduate/GraduateLayout';
import { AdminLayout } from './shells/admin/AdminLayout';

// Graduate Screens
import { GraduateHomeScreen } from './pages/graduate/GraduateHomeScreen';
import { GraduateGroupScreen } from './pages/graduate/GraduateGroupScreen';
import { GraduatePaymentsScreen } from './pages/graduate/GraduatePaymentsScreen';
import { GraduateMoreScreen } from './pages/graduate/GraduateMoreScreen';
import { GraduateTableScreen } from './pages/graduate/GraduateTableScreen';
import { GraduateMealsScreen } from './pages/graduate/GraduateMealsScreen';
import { GraduateThermoScreen } from './pages/graduate/GraduateThermoScreen';
import { GraduateNotificationsScreen } from './pages/graduate/GraduateNotificationsScreen';

// Admin Screens
import { AdminDashboardScreen } from './pages/admin/AdminDashboardScreen';
import { AdminEventsScreen } from './pages/admin/AdminEventsScreen';
import { CreateEventWizardScreen } from './pages/admin/event-create/CreateEventWizardScreen';
import { AdminEventOverviewScreen } from './pages/admin/AdminEventOverviewScreen';
import { AdminEventGraduatesScreen } from './pages/admin/AdminEventGraduatesScreen';
import { AdminEventPaymentsScreen } from './pages/admin/AdminEventPaymentsScreen';
import { AdminEventTablesScreen } from './pages/admin/AdminEventTablesScreen';
import { AdminEventMealsScreen } from './pages/admin/AdminEventMealsScreen';
import { AdminEventThermosScreen } from './pages/admin/AdminEventThermosScreen';
import { AdminEventReportsScreen } from './pages/admin/AdminEventReportsScreen';
import { AdminEventSettingsScreen } from './pages/admin/AdminEventSettingsScreen';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth & Access Routes */}
          <Route path="/access" element={<GraduateAccessScreen />} />
          <Route path="/login" element={<GraduateLoginScreen />} />
          <Route path="/register" element={<GraduateRegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/forgot-password/sent" element={<ForgotPasswordSentScreen />} />
          <Route path="/graduate/events" element={<GraduateEventSelectorScreen />} />
          <Route path="/admin/login" element={<AdminLoginScreen />} />

          {/* Design System Showcase / Component Catalog */}
          <Route path="/showcase" element={<DesignSystemShowcase />} />

          {/* Graduate Shell Routes */}
          <Route path="/graduate" element={<GraduateLayout />}>
            <Route index element={<GraduateHomeScreen />} />
            <Route path="group" element={<GraduateGroupScreen />} />
            <Route path="payments" element={<GraduatePaymentsScreen />} />
            <Route path="more" element={<GraduateMoreScreen />} />
            <Route path="table" element={<GraduateTableScreen />} />
            <Route path="meals" element={<GraduateMealsScreen />} />
            <Route path="thermo" element={<GraduateThermoScreen />} />
            <Route path="notifications" element={<GraduateNotificationsScreen />} />
            <Route path="profile" element={<GraduateMoreScreen />} />
            <Route path="help" element={<GraduateMoreScreen />} />
          </Route>

          {/* Admin Shell Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardScreen />} />
            <Route path="events" element={<AdminEventsScreen />} />
            <Route path="events/new" element={<CreateEventWizardScreen />} />
            <Route path="events/:eventId" element={<AdminEventOverviewScreen />} />

            <Route path="events/:eventId/graduates" element={<AdminEventGraduatesScreen />} />
            <Route path="events/:eventId/payments" element={<AdminEventPaymentsScreen />} />
            <Route path="events/:eventId/tables" element={<AdminEventTablesScreen />} />
            <Route path="events/:eventId/meals" element={<AdminEventMealsScreen />} />
            <Route path="events/:eventId/thermos" element={<AdminEventThermosScreen />} />
            <Route path="events/:eventId/reports" element={<AdminEventReportsScreen />} />
            <Route path="events/:eventId/settings" element={<AdminEventSettingsScreen />} />
            <Route path="graduates" element={<AdminEventGraduatesScreen />} />
            <Route path="payments" element={<AdminEventPaymentsScreen />} />
            <Route path="reports" element={<AdminEventReportsScreen />} />
            <Route path="more" element={<AdminEventSettingsScreen />} />
          </Route>

          {/* Legacy Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layout"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <Meals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thermo"
            element={
              <ProtectedRoute>
                <Thermo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/access" replace />} />
          <Route path="*" element={<Navigate to="/access" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
