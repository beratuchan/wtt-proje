// components/layouts/AuthenticationLayout.tsx
import { Navigate, Outlet } from "react-router";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";
import CustomNavbar from "./Navbar";
import Baslik from "./Baslik";

const AuthenticationLayout = () => {
  const { loggedInUser } = useLoggedInUsersContext();

  if (!loggedInUser) return <Navigate to="/login" />;



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar'a loggedInUser'ı prop olarak geç, onLogout prop'unu çıkar */}
      <Baslik/>
      <CustomNavbar loggedInUser={loggedInUser} />
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>

    </div>
  );
};

export default AuthenticationLayout;