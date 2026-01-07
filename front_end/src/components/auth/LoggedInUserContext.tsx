import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import Cookies from "universal-cookie";
import { setToken } from "../../helper/api";

export type LoggedInUser = {
  id: number;
  username: string;
  role: string;
  accessToken: string;
  email: string;
  photo: string;
};

export type LoggedInUserContextType = {
  loggedInUser: LoggedInUser | null;
  setLoggedInUser: Dispatch<React.SetStateAction<LoggedInUser | null>>;
};

const LoggedInUserContext = createContext<LoggedInUserContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const LoggedInUserContextProvider = ({ children }: Props) => {
  let initialLoggedInUser: LoggedInUser | null = null;

  const cookies = new Cookies();
  
  try {
    // Cookie'den gelen değeri al
    const loggedInUserFromCookie = cookies.get("loggedInUser");
    
    if (loggedInUserFromCookie) {
      console.log("🔍 Cookie tipi:", typeof loggedInUserFromCookie);
      console.log("🔍 Cookie değeri:", loggedInUserFromCookie);
      
      // Eğer zaten object ise direkt kullan
      let userObject;
      if (typeof loggedInUserFromCookie === 'string') {
        // String ise parse et
        userObject = JSON.parse(loggedInUserFromCookie);
      } else if (typeof loggedInUserFromCookie === 'object') {
        // Object ise direkt kullan
        userObject = loggedInUserFromCookie;
      } else {
        throw new Error('Invalid cookie format');
      }
      
      // ✅ Eski versiyon uyumluluğu
      const userWithDefaults = {
        id: userObject.id || 0,
        username: userObject.username || '',
        role: userObject.role || 'user',
        accessToken: userObject.accessToken || '',
        email: userObject.email || '',
        photo: userObject.photo || '',
      };
      
      initialLoggedInUser = userWithDefaults;
      
      // Token varsa axios'a set et
      if (userWithDefaults.accessToken) {
        setToken(userWithDefaults.accessToken);
        console.log("✅ Token axios'a set edildi");
      }
    }
  } catch (error) {
    console.error("Error getting loggedInUser from cookie:", error);
    // Cookie geçersizse, temizle
    cookies.remove("loggedInUser");
  }

  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(
    initialLoggedInUser
  );

  return (
    <LoggedInUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </LoggedInUserContext.Provider>
  );
};

export default LoggedInUserContextProvider;

export function useLoggedInUsersContext() {
  const context = useContext(LoggedInUserContext);
  if (!context)
    throw Error(
      "useLoggedInUserContext must be within LoggedInUserContextProvider"
    );
  return context;
}