// components/layouts/Navbar.tsx
import { 
  Navbar, 
  NavbarCollapse, 
  NavbarToggle,
  Dropdown,
  DropdownHeader,
  DropdownDivider,
  DropdownItem,
  Avatar 
} from "flowbite-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { LoggedInUser } from "../auth/LoggedInUserContext";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";
import { HiOutlineLogout, HiUser, HiViewGrid, HiAcademicCap, HiOutlineBookOpen, HiOutlineFlag } from "react-icons/hi";
import Cookies from "universal-cookie";
import { clearToken, getUserPhotoUrl } from "../../helper/api";
import { useEffect, useState } from "react";

interface Props {
  loggedInUser: LoggedInUser;
}

const CustomNavbar = ({ loggedInUser }: Props) => {
  const navigate = useNavigate();
  const { setLoggedInUser } = useLoggedInUsersContext();
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
    // ✅ YENİ: Profil güncelleme event'ini dinle
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail.userId === loggedInUser.id) {
        console.log('🔄 Navbar: Kendi profilim güncellendi, avatar yenilenecek');
        setAvatarKey(prev => prev + 1);
      }
    };

    // @ts-ignore - CustomEvent tipi için
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      // @ts-ignore
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [loggedInUser.id]);

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove("loggedInUser");
    setLoggedInUser(null);
    clearToken();
    navigate("/login");
  };

  const CustomNavLink = ({ to, children, active = false }: { 
    to: string; 
    children: React.ReactNode; 
    icon?: React.ComponentType;
    active?: boolean;
  }) => (
    <li>
      <NavLink 
        to={to}
        className={({ isActive }) => 
          `flex items-center py-2 pr-4 pl-3 md:p-0 rounded md:border-0 ${
            isActive || active
              ? "text-blue-700 md:text-blue-700"
              : "text-gray-700 hover:text-blue-700"
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );

  const adminNavItems = (
    <>
      <CustomNavLink to="/admin/users" icon={HiAcademicCap}>
        Kullanıcılar
      </CustomNavLink>
      <CustomNavLink to="/admin/complaints" icon={HiOutlineFlag}>
        Şikayetler
      </CustomNavLink>
    </>
  );

  const userNavItems = (
    <>
    <CustomNavLink to="/notebooks" icon={HiOutlineBookOpen}>
      Defterler
    </CustomNavLink>
    <CustomNavLink to="/devlogs" icon={HiViewGrid}>
      Devloglar
    </CustomNavLink>
    </>
  );

  const getAvatarImage = () => {
    // Fotoğraf yoksa undefined dön (Flowbite baş harf oluşturur)
    if (!loggedInUser.photo || loggedInUser.photo.trim() === '') {
      return undefined;
    }
    
    const photoUrl = loggedInUser.photo;
    
    // Son profil güncellemesinden bu yana 30 dakikadan az zaman geçtiyse
    const lastUpdate = localStorage.getItem('lastProfileUpdate');
    const shouldForceRefresh = lastUpdate ? 
      (Date.now() - parseInt(lastUpdate)) < 30 * 60 * 1000 : 
      false;
    
    return getUserPhotoUrl(photoUrl, shouldForceRefresh);
  };

  const getUserInitial = () => {
    return loggedInUser.username.charAt(0).toUpperCase();
  };

  return (
    <Navbar fluid rounded className="bg-white shadow mb-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <span className="self-center whitespace-nowrap text-xl font-semibold">
            DEVLOGGER
          </span>
        </Link>
      </div>

      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            // ✅ YENİ: key prop'u ekleyerek avatar'ı zorla yenile
            <Avatar
              key={`avatar-${avatarKey}`}
              alt={`${loggedInUser.username}'s profile`}
              img={getAvatarImage()}
              placeholderInitials={getUserInitial()}
              rounded
              size="sm"
              className="cursor-pointer"
            />
          }
        >
          <DropdownHeader>
            <span className="block text-sm font-semibold">
              {loggedInUser.username}
            </span>
            <span className="block truncate text-xs text-gray-500 capitalize">
              {loggedInUser.role}
            </span>
          </DropdownHeader>
          <DropdownItem icon={HiUser} onClick={() => navigate('/profile')}>
            Profile
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={HiOutlineLogout} onClick={handleLogout}>
            Sign out
          </DropdownItem>
        </Dropdown>
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        {/* Common link for all logged-in users */}
        <CustomNavLink to="/" active>
          Keşfet
        </CustomNavLink>

        {/* Conditional rendering based on user role */}
        {loggedInUser.role === "admin" ? adminNavItems : userNavItems}
      </NavbarCollapse>
    </Navbar>
  );
};

export default CustomNavbar;