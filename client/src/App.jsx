import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import SalesDashboard from './pages/dashboard/SalesDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import OperationsDashboard from './pages/dashboard/OperationsDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ApprovalRules from './pages/admin/ApprovalRules';
import CustomerConfig from './pages/admin/CustomerConfig';
import ProductCatalogGov from './pages/admin/ProductCatalogGov';
import ResourcesWarehouses from './pages/admin/ResourcesWarehouses';
import DiscountPolicies from './pages/admin/DiscountPolicies';
import UsersRolesRBAC from './pages/admin/UsersRolesRBAC';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import QuoteList from './pages/quotations/QuoteList';
import QuoteCreate from './pages/quotations/QuoteCreate';
import QuoteDetails from './pages/quotations/QuoteDetails';
import ApprovalQueue from './pages/approvals/ApprovalQueue';
import FinanceApprovalQueue from './pages/approvals/FinanceApprovalQueue';
import ManagerApprovalDetail from './pages/approvals/ManagerApprovalDetail';
import InventoryAllocation from './pages/inventory/InventoryAllocation';
import Billing from './pages/billing/Billing';
import Negotiation from './pages/negotiation/Negotiation';
import CustomerPortal from './pages/portal/CustomerPortal';
import CustomerQuoteList from './pages/portal/CustomerQuoteList';
import CustomerQuoteDetail from './pages/portal/CustomerQuoteDetail';
import CustomerOrders from './pages/portal/CustomerOrders';
import CustomerInvoices from './pages/portal/CustomerInvoices';
import CustomerSupport from './pages/portal/CustomerSupport';

import Customers from './pages/customers/Customers';
import Conversations from './pages/conversations/Conversations';
import MyDeals from './pages/deals/MyDeals';
import Notifications from './pages/notifications/Notifications';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/constants';
function AuthLoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e1320 0%, #0d0910 100%)',
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '32px 48px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid rgba(87, 52, 79, 0.3)',
          borderTopColor: '#d97706',
          borderRadius: '50%',
          animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            DealFlow360
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Verifying secure session...
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <AuthLoadingScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardRouteWrapper({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;

  // Role Protection Enforcement
  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(userRole) || userRole === ROLES.ADMIN;
    if (!isAllowed) {
      if (userRole === ROLES.CUSTOMER) return <Navigate to="/portal" replace />;
      if (userRole === ROLES.SALES_MANAGER) return <Navigate to="/dashboard/manager" replace />;
      if (userRole === ROLES.OPERATIONS) return <Navigate to="/dashboard/operations" replace />;
      if (userRole === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/dashboard/sales" replace />;
    }
  }

  // Strict Customer Sandbox isolation
  const path = location.pathname;
  if (userRole === ROLES.CUSTOMER && !path.startsWith('/portal') && !path.startsWith('/notifications')) {
    return <Navigate to="/portal" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === ROLES.SALES_MANAGER) return <Navigate to="/dashboard/manager" replace />;
  if (user.role === ROLES.OPERATIONS) return <Navigate to="/dashboard/operations" replace />;
  if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (user.role === ROLES.CUSTOMER) return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard/sales" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<Login />} />

              {/* Default Root Redirect */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Sales Rep / Account Executive Routes */}
              <Route path="/dashboard/sales" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER]}>
                  <SalesDashboard />
                </DashboardRouteWrapper>
              } />
              
              {/* Sales Manager Routes */}
              <Route path="/dashboard/manager" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_MANAGER]}>
                  <ManagerDashboard />
                </DashboardRouteWrapper>
              } />

              {/* Finance / Operations Routes */}
              <Route path="/dashboard/operations" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.OPERATIONS]}>
                  <OperationsDashboard />
                </DashboardRouteWrapper>
              } />

              {/* System Admin Routes */}
              <Route path="/dashboard/admin" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/dashboard" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/approval-rules" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <ApprovalRules />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/customers" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <CustomerConfig />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/products" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <ProductCatalogGov />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/resources-warehouses" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <ResourcesWarehouses />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/discount-policies" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <DiscountPolicies />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/users-and-roles" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <UsersRolesRBAC />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/subscription-plans" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <SubscriptionPlans />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/audit-logs" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <AuditLogs />
                </DashboardRouteWrapper>
              } />

              <Route path="/admin/system-settings" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.ADMIN]}>
                  <SystemSettings />
                </DashboardRouteWrapper>
              } />

              {/* Quotations CPQ (Sales Rep & Sales Manager) */}
              <Route path="/quotations" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER, ROLES.OPERATIONS]}>
                  <QuoteList />
                </DashboardRouteWrapper>
              } />

              <Route path="/quotations/new" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER]}>
                  <QuoteCreate />
                </DashboardRouteWrapper>
              } />

              <Route path="/quotations/:id" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER, ROLES.OPERATIONS]}>
                  <QuoteDetails />
                </DashboardRouteWrapper>
              } />

              {/* Approvals (Sales Manager & Finance Ops) */}
              <Route path="/approvals" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_MANAGER, ROLES.OPERATIONS]}>
                  <ApprovalQueue />
                </DashboardRouteWrapper>
              } />

              <Route path="/manager/approvals" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_MANAGER]}>
                  <ApprovalQueue />
                </DashboardRouteWrapper>
              } />

              <Route path="/approvals/:id" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_MANAGER, ROLES.OPERATIONS]}>
                  <ManagerApprovalDetail />
                </DashboardRouteWrapper>
              } />

              <Route path="/manager/approvals/:id" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_MANAGER]}>
                  <ManagerApprovalDetail />
                </DashboardRouteWrapper>
              } />

              <Route path="/finance/approvals" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.OPERATIONS]}>
                  <FinanceApprovalQueue />
                </DashboardRouteWrapper>
              } />

              {/* Warehouse & Inventory (Operations / Finance) */}
              <Route path="/inventory" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.OPERATIONS]}>
                  <InventoryAllocation />
                </DashboardRouteWrapper>
              } />

              {/* Billing & Invoicing (Operations / Finance) */}
              <Route path="/billing" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.OPERATIONS]}>
                  <Billing />
                </DashboardRouteWrapper>
              } />

              {/* Deal Negotiation / Redlining (Sales Rep & Sales Manager) */}
              <Route path="/negotiation" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER]}>
                  <Negotiation />
                </DashboardRouteWrapper>
              } />
              <Route path="/negotiation/:id" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER]}>
                  <Negotiation />
                </DashboardRouteWrapper>
              } />

              {/* Customer Portal (Customer Only Sandbox) */}
              <Route path="/portal" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerPortal />
                </DashboardRouteWrapper>
              } />

              <Route path="/portal/quotes" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerQuoteList />
                </DashboardRouteWrapper>
              } />

              <Route path="/portal/quotes/:id" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerQuoteDetail />
                </DashboardRouteWrapper>
              } />

              <Route path="/portal/orders" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerOrders />
                </DashboardRouteWrapper>
              } />

              <Route path="/portal/invoices" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerInvoices />
                </DashboardRouteWrapper>
              } />

              <Route path="/portal/support" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerSupport />
                </DashboardRouteWrapper>
              } />

              {/* Shared Internal Supporting Routes */}
              <Route path="/customers" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER, ROLES.OPERATIONS]}>
                  <Customers />
                </DashboardRouteWrapper>
              } />
              <Route path="/conversations" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER]}>
                  <Conversations />
                </DashboardRouteWrapper>
              } />
              <Route path="/deals" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER]}>
                  <MyDeals />
                </DashboardRouteWrapper>
              } />
              <Route path="/notifications" element={
                <DashboardRouteWrapper allowedRoles={[ROLES.SALES_REP, ROLES.SALES_MANAGER, ROLES.OPERATIONS, ROLES.CUSTOMER]}>
                  <Notifications />
                </DashboardRouteWrapper>
              } />

              {/* Catch-all */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

