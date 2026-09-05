import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import SalesDashboard from './pages/dashboard/SalesDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import OperationsDashboard from './pages/dashboard/OperationsDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import QuoteList from './pages/quotations/QuoteList';
import QuoteCreate from './pages/quotations/QuoteCreate';
import QuoteDetails from './pages/quotations/QuoteDetails';
import ApprovalQueue from './pages/approvals/ApprovalQueue';
import ManagerApprovalDetail from './pages/approvals/ManagerApprovalDetail';
import InventoryAllocation from './pages/inventory/InventoryAllocation';
import Billing from './pages/billing/Billing';
import Negotiation from './pages/negotiation/Negotiation';
import CustomerPortal from './pages/portal/CustomerPortal';

import Customers from './pages/customers/Customers';
import Conversations from './pages/conversations/Conversations';
import MyDeals from './pages/deals/MyDeals';
import Notifications from './pages/notifications/Notifications';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/constants';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardRouteWrapper({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === ROLES.SALES_MANAGER) {
    return <Navigate to="/dashboard/manager" replace />;
  }
  if (user.role === ROLES.OPERATIONS) {
    return <Navigate to="/dashboard/operations" replace />;
  }
  if (user.role === ROLES.ADMIN) {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (user.role === ROLES.CUSTOMER) {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/dashboard/sales" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<Login />} />

          {/* Internal Dashboard Routes */}
          <Route path="/" element={<RootRedirect />} />
          
          <Route path="/dashboard/sales" element={
            <DashboardRouteWrapper>
              <SalesDashboard />
            </DashboardRouteWrapper>
          } />
          
          <Route path="/dashboard/manager" element={
            <DashboardRouteWrapper>
              <ManagerDashboard />
            </DashboardRouteWrapper>
          } />

          <Route path="/dashboard/operations" element={
            <DashboardRouteWrapper>
              <OperationsDashboard />
            </DashboardRouteWrapper>
          } />

          <Route path="/dashboard/admin" element={
            <DashboardRouteWrapper>
              <AdminDashboard />
            </DashboardRouteWrapper>
          } />

          {/* Quotations CPQ */}
          <Route path="/quotations" element={
            <DashboardRouteWrapper>
              <QuoteList />
            </DashboardRouteWrapper>
          } />

          <Route path="/quotations/new" element={
            <DashboardRouteWrapper>
              <QuoteCreate />
            </DashboardRouteWrapper>
          } />

          <Route path="/quotations/:id" element={
            <DashboardRouteWrapper>
              <QuoteDetails />
            </DashboardRouteWrapper>
          } />

          {/* Approvals */}
          <Route path="/approvals" element={
            <DashboardRouteWrapper>
              <ApprovalQueue />
            </DashboardRouteWrapper>
          } />

          <Route path="/manager/approvals" element={
            <DashboardRouteWrapper>
              <ApprovalQueue />
            </DashboardRouteWrapper>
          } />

          <Route path="/approvals/:id" element={
            <DashboardRouteWrapper>
              <ManagerApprovalDetail />
            </DashboardRouteWrapper>
          } />

          <Route path="/manager/approvals/:id" element={
            <DashboardRouteWrapper>
              <ManagerApprovalDetail />
            </DashboardRouteWrapper>
          } />

          {/* Warehouse & Inventory */}
          <Route path="/inventory" element={
            <DashboardRouteWrapper>
              <InventoryAllocation />
            </DashboardRouteWrapper>
          } />

          {/* Billing & Invoicing */}
          <Route path="/billing" element={
            <DashboardRouteWrapper>
              <Billing />
            </DashboardRouteWrapper>
          } />

          {/* Deal Negotiation / Redlining */}
          <Route path="/negotiation" element={
            <DashboardRouteWrapper>
              <Negotiation />
            </DashboardRouteWrapper>
          } />
          <Route path="/negotiation/:id" element={
            <DashboardRouteWrapper>
              <Negotiation />
            </DashboardRouteWrapper>
          } />

          {/* Customer Portal */}
          <Route path="/portal" element={
            <ProtectedRoute>
              <CustomerPortal />
            </ProtectedRoute>
          } />

          {/* Sidebar Supporting Routes */}
          <Route path="/customers" element={
            <DashboardRouteWrapper>
              <Customers />
            </DashboardRouteWrapper>
          } />
          <Route path="/conversations" element={
            <DashboardRouteWrapper>
              <Conversations />
            </DashboardRouteWrapper>
          } />
          <Route path="/deals" element={
            <DashboardRouteWrapper>
              <MyDeals />
            </DashboardRouteWrapper>
          } />
          <Route path="/notifications" element={
            <DashboardRouteWrapper>
              <Notifications />
            </DashboardRouteWrapper>
          } />

          {/* Catch-all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
