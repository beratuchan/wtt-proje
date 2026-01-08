import { Navigate, Outlet } from "react-router";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";

const AnonymousLayout = () => {
  const { loggedInUser } = useLoggedInUsersContext();
  
  // Kullanıcı giriş yapmışsa, doğrudan ana sayfaya yönlendir
  if (loggedInUser) {
    // NOT: AuthenticationLayout daha sonra bu yönlendirmeyi rol bazlı refine edecek
    return <Navigate to="/" replace />;
  }
  
  // Giriş yapmamış kullanıcılar için login sayfasını göster
  return (
    <>
      <div>AnonymousLayout</div>
      <Outlet />
    </>
  );
};

export default AnonymousLayout;