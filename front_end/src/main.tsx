import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "sonner";
import { createBrowserRouter, RouterProvider } from "react-router";
import LoggedInUserContextProvider from "./components/auth/LoggedInUserContext.tsx";
import Login from "./components/auth/Login.tsx";
import AnonymousLayout from "./components/layouts/AnonymousLayout.tsx";
import AuthenticationLayout from "./components/layouts/AuthenticationLayout.tsx";
import Homepage from "./components/homepage/Homepage.tsx";
import AdminLayout from "./components/layouts/AdminLayout.tsx";
import UserProfile from "./components/users/UserProfile.tsx";
import UserTable from "./components/users/UserTable.tsx";
import NotebookList from "./components/notebooks/NotebookList.tsx";
import NotebookDetail from "./components/notebooks/NotebookDetail.tsx";
import NotebookEdit from "./components/notebooks/NotebookEdit.tsx";
import DevlogCreate from "./components/devlog/DevlogCreate.tsx";
import DevlogList from "./components/devlog/DevlogList.tsx";
import DevlogDetail from "./components/devlog/DevlogDetail.tsx";
import DevlogEdit from "./components/devlog/DevlogEdit.tsx";
import ComplaintManagement from "./components/admin/ComplaintManagement.tsx";

const router = createBrowserRouter([
  {
    Component: AnonymousLayout,
    children: [
      {
        path: "/login",
        Component: Login,
      },
    ],
  },
  {
    Component: AuthenticationLayout,
    children: [
      {
        path: "/",
        Component: Homepage,
      },
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { path: "/admin/users", Component: UserTable },
          { path: "/admin/complaints", Component: ComplaintManagement },
          // ✅ KALDIRILDI: /admin/settings rotası
        ],
      },
      {
        path: "/profile",
        Component: UserProfile,
      },
      {
        path: "/notebooks",
        Component: NotebookList,
      },
      {
        path: "/notebooks/:id",
        Component: NotebookDetail,
      },
      {
        path: "/notebooks/:id/edit",
        Component: NotebookEdit,
      },
      {
        path: "/devlogs",
        Component: DevlogList,
      },
      {
        path: "/devlogs/create",
        Component: DevlogCreate,
      },
      {
        path: "/devlogs/:id",
        Component: DevlogDetail,
      },
      {
        path: "/devlogs/:id/edit",
        Component: DevlogEdit,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoggedInUserContextProvider>
      <div className="bg-white">
        <Toaster richColors position="top-center" />
        <RouterProvider router={router} />
      </div>
    </LoggedInUserContextProvider>
  </StrictMode>
);