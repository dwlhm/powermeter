import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { PageLoader } from '@/components/ui/Spinner';

// Lazy-loaded pages for code splitting.
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MapsPage = lazy(() => import('@/pages/MapsPage').then((m) => ({ default: m.MapsPage })));
const MeasurementPointsPage = lazy(() => import('@/pages/MeasurementPointsPage').then((m) => ({ default: m.MeasurementPointsPage })));
const DetailDashboardPage = lazy(() => import('@/pages/DetailDashboardPage').then((m) => ({ default: m.DetailDashboardPage })));
const AlarmsPage = lazy(() => import('@/pages/AlarmsPage').then((m) => ({ default: m.AlarmsPage })));
const EventsPage = lazy(() => import('@/pages/EventsPage').then((m) => ({ default: m.EventsPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const CostCalculatorPage = lazy(() => import('@/pages/CostCalculatorPage').then((m) => ({ default: m.CostCalculatorPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const withSuspense = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

export const AppRouter = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />
          <Route path="/maps" element={withSuspense(<MapsPage />)} />
          <Route path="/measurement" element={withSuspense(<MeasurementPointsPage />)} />
          <Route path="/detail/:id" element={withSuspense(<DetailDashboardPage />)} />
          <Route path="/alarms" element={withSuspense(<AlarmsPage />)} />
          <Route path="/events" element={withSuspense(<EventsPage />)} />
          <Route path="/analytics" element={withSuspense(<AnalyticsPage />)} />
          <Route path="/cost" element={withSuspense(<CostCalculatorPage />)} />
          <Route path="/reports" element={withSuspense(<ReportsPage />)} />
          <Route path="/settings" element={withSuspense(<ProtectedRoute resource="settings">{withSuspense(<SettingsPage />)}</ProtectedRoute>)} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
