import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "../layouts/root.layout";
import AdminLayout from "../layouts/admin.layout";
import { ProtectedRoute } from "../component/ProtectedRoute";

// Loading Fallback Component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-amber-800 animate-pulse">ලෝඩ් වෙමින් පවතී...</p>
    </div>
  </div>
);

// Lazy Loaded Screens
const HomeScreen = lazy(() => import("../screen/public/home.screen"));
const AboutScreen = lazy(() => import("../screen/public/about.screen"));
const TempleScreen = lazy(() => import("../screen/public/TempleScreen"));
const GalleryScreen = lazy(() => import("../screen/public/GalleryScreen"));
const ContactScreen = lazy(() => import("../screen/public/ContactScreen"));
const LoginScreen = lazy(() => import("../screen/auth/login.screen"));
const RegisterScreen = lazy(() => import("../screen/auth/register.screen"));

const DanaScreen = lazy(() => import("../screen/dana/dana.screen"));
const CertificateScreen = lazy(() => import("../screen/dana/CertificateScreen").then(m => ({ default: m.CertificateScreen })));
const DonorDanaConfirmScreen = lazy(() => import("../screen/dana/DonorDanaConfirmScreen").then(m => ({ default: m.DonorDanaConfirmScreen })));

const UsersScreen = lazy(() => import("../screen/user/users.screen"));
const ProfileScreen = lazy(() => import("../screen/user/ProfileScreen").then(m => ({ default: m.ProfileScreen })));

const DashboardScreen = lazy(() => import("../screen/dashboard/dashboard.screen"));
const AdminDashboard = lazy(() => import("../screen/dashboard/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminDanasScreen = lazy(() => import("../screen/dashboard/AdminDanasScreen").then(m => ({ default: m.AdminDanasScreen })));
const AdminPendingDanaScreen = lazy(() => import("../screen/dashboard/AdminPendingDanaScreen").then(m => ({ default: m.AdminPendingDanaScreen })));
const AdminPendingPaymentsScreen = lazy(() => import("../screen/dashboard/AdminPendingPaymentsScreen").then(m => ({ default: m.AdminPendingPaymentsScreen })));
const AdminMonthlyDanasScreen = lazy(() => import("../screen/dashboard/AdminMonthlyDanasScreen").then(m => ({ default: m.AdminMonthlyDanasScreen })));
const MonthlyDanaLettersScreen = lazy(() => import("../screen/dashboard/MonthlyDanaLettersScreen").then(m => ({ default: m.MonthlyDanaLettersScreen })));
const MonthlyDanaReportScreen = lazy(() => import("../screen/dashboard/MonthlyDanaReportScreen").then(m => ({ default: m.MonthlyDanaReportScreen })));
const AdminFinanceScreen = lazy(() => import("../screen/dashboard/AdminFinanceScreen").then(m => ({ default: m.AdminFinanceScreen })));
const AdminChatScreen = lazy(() => import("../screen/dashboard/AdminChatScreen").then(m => ({ default: m.AdminChatScreen })));
const AdminCertificatesScreen = lazy(() => import("../screen/dashboard/AdminCertificatesScreen").then(m => ({ default: m.AdminCertificatesScreen })));
const AdminTemplateEditorScreen = lazy(() => import("../screen/dashboard/AdminTemplateEditorScreen").then(m => ({ default: m.AdminTemplateEditorScreen })));
const AdminWhatsappReportsScreen = lazy(() => import("../screen/dashboard/AdminWhatsappReportsScreen").then(m => ({ default: m.AdminWhatsappReportsScreen })));
const AdminDanaConfirmationsScreen = lazy(() => import("../screen/dashboard/AdminDanaConfirmationsScreen").then(m => ({ default: m.AdminDanaConfirmationsScreen })));
const AdminAuditLogsScreen = lazy(() => import("../screen/dashboard/AdminAuditLogsScreen").then(m => ({ default: m.AdminAuditLogsScreen })));
const MonthlyDanaAddressesScreen = lazy(() => import("../screen/dashboard/MonthlyDanaAddressesScreen").then(m => ({ default: m.MonthlyDanaAddressesScreen })));

// Helper to wrap lazy components in Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, element: withSuspense(HomeScreen) },
      { path: "about", element: withSuspense(AboutScreen) },
      { path: "temple", element: withSuspense(TempleScreen) },
      { path: "gallery", element: withSuspense(GalleryScreen) },
      { path: "contact", element: withSuspense(ContactScreen) },
      { path: "dana", element: withSuspense(DanaScreen) },
      { path: "dana/confirm/:id", element: withSuspense(DonorDanaConfirmScreen) },
      { path: "login", element: withSuspense(LoginScreen) },
      { path: "register", element: withSuspense(RegisterScreen) },
      {
        path: "certificate/:id",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "USER"]}>
            <Suspense fallback={<PageLoader />}>
              <CertificateScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "USER"]}>
            <Suspense fallback={<PageLoader />}>
              <ProfileScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:id",
        element: withSuspense(ProfileScreen),
      },
      // Fallback for old /dashboard route
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "USER"]}>
            <Suspense fallback={<PageLoader />}>
              <DashboardScreen />
            </Suspense>
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
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <UsersScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "danas",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminDanasScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "certificates",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminCertificatesScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "templates",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminTemplateEditorScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "finance",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminFinanceScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "pending-dana",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminPendingDanaScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "pending-payments",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminPendingPaymentsScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-danas",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminMonthlyDanasScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-letters/:month",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <MonthlyDanaLettersScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-addresses/:month",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <MonthlyDanaAddressesScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "monthly-report/:month",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <MonthlyDanaReportScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminChatScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "whatsapp-reports",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminWhatsappReportsScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "dana-confirmations",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminDanaConfirmationsScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <Suspense fallback={<PageLoader />}>
              <AdminAuditLogsScreen />
            </Suspense>
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
