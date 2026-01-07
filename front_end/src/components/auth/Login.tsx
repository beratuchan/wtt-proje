// components/auth/Login.tsx
import { Button, Label, Modal, ModalBody, TextInput, FileInput } from "flowbite-react";
import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { api } from "../../helper/api";
import Cookies from "universal-cookie";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";
import { toast } from "sonner";

const Login = () => {
  const cookies = new Cookies();
  const { setLoggedInUser } = useLoggedInUsersContext();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showRegister, setShowRegister] = useState(false);
  
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhoto, setRegisterPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogin() {
    if (!username.trim() || !password.trim()) {
      toast.error("Kullanıcı adı ve şifre gereklidir!");
      return;
    }

    setIsLoading(true);

    api
      .request({
        url: "auth/login",
        method: "post",
        data: { username, password },
      })
      .then((res) => {
        cookies.set("loggedInUser", JSON.stringify(res.data), {
          expires: new Date(Date.now() + 1000 * 60 * 60),
          path: '/'
        });
        setLoggedInUser(res.data);
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      })
      .catch((error) => {
        console.error("Login error details:", error.response?.data);
        
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            error.response.data.message.forEach((msg: string) => {
              toast.error(msg, { duration: 4000, position: "top-center" });
            });
          } else {
            toast.error(error.response.data.message, { duration: 4000, position: "top-center" });
          }
        } 
        else if (error.response?.status === 401) {
          toast.error("Kullanıcı adı veya şifre hatalı!", { duration: 4000, position: "top-center" });
        }
        else if (error.response?.status === 400) {
          toast.error("Geçersiz giriş bilgileri. Lütfen kontrol edin.", { duration: 4000, position: "top-center" });
        }
        else if (!error.response) {
          toast.error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.", { duration: 5000, position: "top-center" });
        }
        else {
          toast.error("Giriş başarısız! Lütfen daha sonra tekrar deneyin.", { duration: 4000, position: "top-center" });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username.trim() && password.trim()) {
      handleLogin();
    }
  };

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Sadece JPG, PNG, GIF veya WebP formatında resimler yükleyebilirsiniz!");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu 5MB'dan küçük olmalıdır!");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setRegisterPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemovePhoto() {
    setRegisterPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleRegister() {
    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword || !registerConfirmPassword) {
      toast.error("Tüm zorunlu alanları doldurun!");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Şifreler uyuşmuyor!");
      return;
    }

    if (registerPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setRegisterLoading(true);
    
    const formData = new FormData();
    formData.append('username', registerUsername);
    formData.append('password', registerPassword);
    formData.append('confirmPassword', registerConfirmPassword);
    formData.append('email', registerEmail);
    formData.append('role', 'user');
    
    if (registerPhoto) {
      formData.append('photo', registerPhoto);
    }

    api
      .request({
        url: "auth/register",
        method: "post",
        data: formData,
      })
      .then(() => {
        toast.success("Kayıt başarılı! Artık giriş yapabilirsiniz.", {
          duration: 5000,
          position: "top-center",
        });
        
        setRegisterUsername("");
        setRegisterPassword("");
        setRegisterConfirmPassword("");
        setRegisterEmail("");
        setRegisterPhoto(null);
        setPhotoPreview(null);
        
        setShowRegister(false);
      })
      .catch((error) => {
        console.error("Register error:", error.response?.data);
        
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            error.response.data.message.forEach((msg: string) => {
              toast.error(msg, { duration: 4000, position: "top-center" });
            });
          } else {
            toast.error(error.response.data.message, { duration: 4000, position: "top-center" });
          }
        } 
        else if (error.response?.status === 409) {
          toast.error("Bu kullanıcı adı veya email zaten kullanımda!", { duration: 4000, position: "top-center" });
        }
        else if (error.response?.status === 400) {
          toast.error("Geçersiz kayıt bilgileri. Lütfen kontrol edin.", { duration: 4000, position: "top-center" });
        }
        else if (!error.response) {
          toast.error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
        }
        else {
          toast.error("Kayıt başarısız! Lütfen daha sonra tekrar deneyin.");
        }
      })
      .finally(() => {
        setRegisterLoading(false);
      });
  }

  return (
    <>
      {/* LOGIN MODAL */}
      <Modal show={true} size="sm" popup onClose={() => {}}>
        <h3 className="px-4 py-4 text-xl font-bold">Giriş Yap</h3>
        <ModalBody>
          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username">Kullanıcı Adı</Label>
              </div>
              <TextInput
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="kullanici_adi"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Şifre</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <div className="w-full">
              <Button 
                onClick={handleLogin} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Giriş Yapılıyor...
                  </div>
                ) : "Giriş Yap"}
              </Button>
            </div>
            
            {/* REGISTER BUTTON */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Hesabınız yok mu?
              </p>
              <Button 
                color="light" 
                onClick={() => setShowRegister(true)}
                className="w-full"
                disabled={isLoading}
              >
                Yeni Hesap Oluştur
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* REGISTER MODAL - değişiklik yok */}
      {showRegister && (
        <Modal 
          show={showRegister} 
          size="md" 
          popup 
          onClose={() => setShowRegister(false)}
          dismissible
        >
          <h3 className="px-4 py-4 text-xl font-bold">Yeni Hesap Oluştur</h3>
          <ModalBody>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="register-username">Kullanıcı Adı *</Label>
                </div>
                <TextInput
                  id="register-username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="kullanici_adi"
                  required
                  disabled={registerLoading}
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="register-email">E-posta *</Label>
                </div>
                <TextInput
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  disabled={registerLoading}
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="register-password">Şifre *</Label>
                  <span className="text-xs text-gray-500 ml-2">
                    (En az 6 karakter)
                  </span>
                </div>
                <TextInput
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={registerLoading}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="register-confirm-password">Şifre Tekrar *</Label>
                </div>
                <TextInput
                  id="register-confirm-password"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={registerLoading}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="register-photo">Profil Fotoğrafı (Opsiyonel)</Label>
                  <span className="text-xs text-gray-500 ml-2">
                    Max 5MB, JPG, PNG, GIF, WebP
                  </span>
                </div>
                
                {photoPreview ? (
                  <div className="mb-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-full border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        disabled={registerLoading}
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Önizleme - Değiştirmek için tıklayın
                    </p>
                  </div>
                ) : null}
                
                <FileInput
                  id="register-photo"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  disabled={registerLoading}
                />
              </div>

              <div className="w-full">
                <Button 
                  onClick={handleRegister}
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </div>
                  ) : "Hesap Oluştur"}
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <button 
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setShowRegister(false)}
                  disabled={registerLoading}
                >
                  Zaten hesabınız var mı? Giriş Yapın
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default Login;