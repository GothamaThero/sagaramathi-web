import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "../layouts/root.layout";
import {
  HomeScreen,
  AboutScreen,
  DashboardScreen,
  LoginScreen,
  RegisterScreen,
} from "../screen";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomeScreen,
      },
      {
        path: "about",
        Component: AboutScreen,
      },
      {
        path: "dashboard",
        Component: DashboardScreen,
      },
      {
        path: "login",
        Component: LoginScreen,
      },
      {
        path: "register",
        Component: RegisterScreen,
      },
    ],
  },
]);

const RootRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default RootRouter;
