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
import { useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardRouteWrapper({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;

  // Role Route Isolation Guard
  if (user.role === ROLES.CUSTOMER) {
    const isCustomerAllowed = path.startsWith('/portal');
    if (!isCustomerAllowed) {
      return <Navigate to="/portal" replace />;
    }
  } else if (user.role === ROLES.OPERATIONS) {
    const isOpsAllowed = path.startsWith('/dashboard/operations') ||
                         path.startsWith('/inventory') ||
                         path.startsWith('/billing') ||
                         path.startsWith('/finance') ||
                         path.startsWith('/quotations') ||
                         path.startsWith('/customers') ||
                         path.startsWith('/notifications');
    if (!isOpsAllowed) {
      return <Navigate to="/dashboard/operations" replace />;
    }
  } else if (user.role === ROLES.SALES_MANAGER) {
    const isManagerAllowed = path.startsWith('/dashboard/manager') ||
                            path.startsWith('/approvals') ||
                            path.startsWith('/manager') ||
                            path.startsWith('/quotations') ||
                            path.startsWith('/customers') ||
                            path.startsWith('/negotiation') ||
                            path.startsWith('/conversations') ||
                            path.startsWith('/deals') ||
                            path.startsWith('/notifications');
    if (!isManagerAllowed) {
      return <Navigate to="/dashboard/manager" replace />;
    }
  } else if (user.role === ROLES.SALES_REP) {
    const isRepAllowed = path.startsWith('/dashboard/sales') ||
                         path.startsWith('/quotations') ||
                         path.startsWith('/customers') ||
                         path.startsWith('/negotiation') ||
                         path.startsWith('/conversations') ||
                         path.startsWith('/deals') ||
                         path.startsWith('/notifications');
    if (!isRepAllowed) {
      return <Navigate to="/dashboard/sales" replace />;
    }
  } else if (user.role === ROLES.ADMIN) {
    const isAdminAllowed = path.startsWith('/admin') || path.startsWith('/dashboard/admin');
    if (!isAdminAllowed) {
      return <Navigate to="/admin/dashboard" replace />;
    }
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

          <Route path="/admin/dashboard" element={
            <DashboardRouteWrapper>
              <AdminDashboard />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/approval-rules" element={
            <DashboardRouteWrapper>
              <ApprovalRules />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/customers" element={
            <DashboardRouteWrapper>
              <CustomerConfig />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/products" element={
            <DashboardRouteWrapper>
              <ProductCatalogGov />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/resources-warehouses" element={
            <DashboardRouteWrapper>
              <ResourcesWarehouses />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/discount-policies" element={
            <DashboardRouteWrapper>
              <DiscountPolicies />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/users-and-roles" element={
            <DashboardRouteWrapper>
              <UsersRolesRBAC />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/subscription-plans" element={
            <DashboardRouteWrapper>
              <SubscriptionPlans />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/audit-logs" element={
            <DashboardRouteWrapper>
              <AuditLogs />
            </DashboardRouteWrapper>
          } />

          <Route path="/admin/system-settings" element={
            <DashboardRouteWrapper>
              <SystemSettings />
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

          {/* Finance & Ops Approvals */}
          <Route path="/finance/approvals" element={
            <DashboardRouteWrapper>
              <FinanceApprovalQueue />
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
            <DashboardRouteWrapper>
              <CustomerPortal />
            </DashboardRouteWrapper>
          } />

          <Route path="/portal/quotes" element={
            <DashboardRouteWrapper>
              <CustomerQuoteList />
            </DashboardRouteWrapper>
          } />

          <Route path="/portal/quotes/:id" element={
            <DashboardRouteWrapper>
              <CustomerQuoteDetail />
            </DashboardRouteWrapper>
          } />

          <Route path="/portal/orders" element={
            <DashboardRouteWrapper>
              <CustomerOrders />
            </DashboardRouteWrapper>
          } />

          <Route path="/portal/invoices" element={
            <DashboardRouteWrapper>
              <CustomerInvoices />
            </DashboardRouteWrapper>
          } />

          <Route path="/portal/support" element={
            <DashboardRouteWrapper>
              <CustomerSupport />
            </DashboardRouteWrapper>
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
