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
  AdminPendingPaymentsScreen
} from "../screen";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "about", Component: AboutScreen },
      { path: "dana", Component: DanaScreen },
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
      }
    ]
  }
]);

const RootRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default RootRouter;
