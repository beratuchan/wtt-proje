import { Navigate, Outlet } from "react-router";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";

const AdminLayout = () => {
  const { loggedInUser } = useLoggedInUsersContext();
  
  // AuthenticationLayout'da zaten kontrol var, ama çift koruma iyidir
  if (!loggedInUser || loggedInUser.role !== "admin") {
    return <Navigate to="/" />;
  }
  
  return (
    <>
      <div>Admin Layout - Sadece adminler görebilir</div>
      <Outlet />
    </>
  );
};

export default AdminLayout;
