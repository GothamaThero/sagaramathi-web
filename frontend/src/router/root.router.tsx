import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "../layouts/root.layout";
import AdminLayout from "../layouts/admin.layout";
import { ProtectedRoute } from "../component/ProtectedRoute";
import {
  HomeScreen,
  AboutScreen,
  DashboardScreen,
  AdminDashboard,
  LoginScreen,
  RegisterScreen,
  DanaScreen,
  UsersScreen,
  CertificateScreen,
  ProfileScreen,
  AdminDanasScreen,
  AdminPendingDanaScreen,
  AdminPendingPaymentsScreen,
  AdminMonthlyDanasScreen,
  MonthlyDanaLettersScreen,
  MonthlyDanaReportScreen,
  AdminFinanceScreen,
  AdminChatScreen,
  AdminCertificatesScreen,
  AdminTemplateEditorScreen,
  AdminWhatsappReportsScreen,
  DonorDanaConfirmScreen,
  AdminDanaConfirmationsScreen,
  AdminAuditLogsScreen,
  MonthlyDanaAddressesScreen
} from "../screen";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "about", Component: AboutScreen },
      { path: "dana", Component: DanaScreen },
      { path: "dana/confirm/:id", Component: DonorDanaConfirmScreen },
      { path: "login", Component: LoginScreen },
      { path: "register", Component: RegisterScreen },
      {
        path: "certificate/:id",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "USER"]}>
            <CertificateScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "USER"]}>
            <ProfileScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:id",
        Component: ProfileScreen,
      },
      // Fallback for old /dashboard route
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "USER"]}>
            <DashboardScreen />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <UsersScreen />
          </ProtectedRoute>
        ),
      },
      // Danas management route
      {
        path: "danas",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminDanasScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "certificates",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminCertificatesScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "templates",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminTemplateEditorScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "finance",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminFinanceScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "pending-dana",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminPendingDanaScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "pending-payments",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminPendingPaymentsScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-danas",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminMonthlyDanasScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-letters/:month",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <MonthlyDanaLettersScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-addresses/:month",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <MonthlyDanaAddressesScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-report/:month",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <MonthlyDanaReportScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminChatScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "whatsapp-reports",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminWhatsappReportsScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "dana-confirmations",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminDanaConfirmationsScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AdminAuditLogsScreen />
          </ProtectedRoute>
        ),
      }
    ]
  }
]);


const RootRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default RootRouter;
