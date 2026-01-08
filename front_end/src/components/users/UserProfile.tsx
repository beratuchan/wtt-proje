// src/components/users/UserProfile.tsx - GÜNCELLENMİŞ (Güvenlik tabı kaldırıldı)
import { useState, useRef, useEffect } from "react";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";
import { 
  Card, 
  Button, 
  TextInput, 
  Label, 
  FileInput,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { api, getFullImageUrl } from "../../helper/api";
import { toast } from "sonner";
import { 
  HiUser, 
  HiMail, 
  HiLockClosed,
  HiPencil, 
  HiCheck, 
  HiX,
  HiCamera,
  HiExclamation,
  HiKey
} from "react-icons/hi";
import { Navigate } from "react-router";
import Cookies from "universal-cookie";

const UserProfile = () => {
  const { loggedInUser, setLoggedInUser } = useLoggedInUsersContext();
  const [activeTab, setActiveTab] = useState<number>(0); // 0: profil, 1: şifre
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: loggedInUser?.username || "",
    email: loggedInUser?.email || "",
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState(loggedInUser?.photo || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Şifre değiştirme state'leri
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [userStats, setUserStats] = useState({
    createdAt: "",
    lastLogin: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loggedInUser) {
      setUserStats({
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    }
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <Navigate to="/login" />;
  }

  // Düzenleme modunu aç/kapat
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser({
        username: loggedInUser.username,
        email: loggedInUser.email,
        photo: null,
      });
      setPhotoPreview(loggedInUser.photo || "");
    } else {
      setEditedUser({
        username: loggedInUser.username,
        email: loggedInUser.email,
        photo: null,
      });
      setPhotoPreview(loggedInUser.photo || "");
    }
    setIsEditing(!isEditing);
  };

  // Input değişikliklerini handle et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  // Şifre input değişiklikleri
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Fotoğraf değişikliği
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setEditedUser(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fotoğrafı kaldır
  const handleRemovePhoto = () => {
    setEditedUser(prev => ({ ...prev, photo: null }));
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fotoğraf URL'sini getir
  const getPhotoUrl = () => {
    const photoUrl = photoPreview || loggedInUser?.photo;
    if (!photoUrl || photoUrl.trim() === '') {
      return null;
    }
    // Zaten tam URL ise veya base64 ise
    if (
      photoUrl.startsWith('data:image') ||
      photoUrl.startsWith('http://') ||
      photoUrl.startsWith('https://')
    ) {
      return photoUrl;
    }
    // Her durumda tam backend adresiyle döndür
    return getFullImageUrl(photoUrl);
  };

  // Profil kaydetme fonksiyonu
  const handleSaveProfile = async () => {
    console.log("🟡 === PROFİL GÜNCELLEME BAŞLIYOR ===");
    
    if (!editedUser.username.trim()) {
      toast.error("Kullanıcı adı boş olamaz!");
      return;
    }

    if (!editedUser.email.trim()) {
      toast.error("E-posta adresi boş olamaz!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      toast.error("Geçerli bir e-posta adresi girin!");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', editedUser.username);
      formData.append('email', editedUser.email);
      
      console.log('🟡 FormData içeriği:');
      console.log('   - username:', editedUser.username);
      console.log('   - email:', editedUser.email);
      
      if (editedUser.photo instanceof File) {
        formData.append('photo', editedUser.photo);
        console.log("🟡 Yeni fotoğraf eklendi:", editedUser.photo.name);
      } else if (photoPreview === '') {
        formData.append('photo', '');
        console.log("🟡 Fotoğraf kaldırma isteği (boş string)");
      } else {
        console.log("🟡 Fotoğraf değişmedi, backend mevcut fotoğrafı koruyacak");
      }
      
      console.log('🟡 Gönderilen FormData:');
      for (let pair of (formData as any).entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      console.log("🟡 API isteği gönderiliyor...");
      
      const response = await api.post(`auth/profile/update`, formData);

      console.log("✅ BACKEND YANITI ALINDI!");
      console.log("✅ Status:", response.status);
      
      if (response.data.accessToken) {
        const { setToken } = await import("../../helper/api");
        setToken(response.data.accessToken);
        console.log("✅ Yeni token axios instance'a kaydedildi");
      }

      const updatedUser = {
        ...loggedInUser,
        ...response.data
      };
      
      setLoggedInUser(updatedUser);
      console.log("✅ State güncellendi");

      const cookies = new Cookies();
      cookies.set("loggedInUser", JSON.stringify(updatedUser), {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        path: '/',
        sameSite: 'lax'
      });
      
      console.log("✅ Cookie güncellendi!");
      
      toast.success("Profil başarıyla güncellendi!");
      setIsEditing(false);
      setShowConfirmModal(false);
      
    } catch (error: any) {
      console.error("🔴 DETAYLI HATA BİLGİSİ:");
      console.error("🔴 Hata mesajı:", error.message);
      console.error("🔴 Hata status:", error.response?.status);
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else if (error.response?.status === 400) {
        toast.error("Geçersiz veri: " + (error.response.data?.message || "Lütfen bilgilerinizi kontrol edin."));
      } else if (error.response?.status === 401) {
        toast.error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
      } else if (error.response?.status === 413) {
        toast.error("Dosya boyutu çok büyük. Maksimum 5MB boyutunda dosya yükleyebilirsiniz.");
      } else if (!error.response) {
        toast.error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        toast.error(`Profil güncellenirken bir hata oluştu (${error.response.status})`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Şifre değiştirme fonksiyonu
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword.trim()) {
      toast.error("Mevcut şifrenizi giriniz!");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("Yeni şifrenizi giriniz!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yeni şifreler uyuşmuyor!");
      return;
    }

    setChangingPassword(true);

    try {
      await api.post('auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword
      });

      toast.success("Şifreniz başarıyla değiştirildi!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setActiveTab(0); // Profil sekmesine geri dön
      
    } catch (error: any) {
      console.error("Şifre değiştirme hatası:", error);
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else if (error.response?.status === 400) {
        toast.error("Geçersiz şifre bilgileri!");
      } else if (error.response?.status === 401) {
        toast.error("Mevcut şifreniz hatalı!");
      } else {
        toast.error("Şifre değiştirilirken bir hata oluştu!");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    if (!dateString) return "Bilinmiyor";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Custom Label component
  const CustomLabel = ({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) => (
    <div className="mb-2 block">
      <Label htmlFor={htmlFor}>
        {children}
      </Label>
    </div>
  );

  const photoUrl = getPhotoUrl();
  const isPhotoRemoved = photoPreview === '' && !editedUser.photo;

  // Render içerik fonksiyonları
  const renderProfileContent = () => (
    <div className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Profil Fotoğrafı */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex flex-col items-center">
              {/* Profil Fotoğrafı */}
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  {photoUrl ? (
                    <>
                      <img 
                        src={photoUrl} 
                        alt="Profil fotoğrafı" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("❌ Resim yüklenemedi:", photoUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="photo-fallback absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                        <HiUser className="w-24 h-24 text-gray-400" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiUser className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="mt-4">
                    <div className="flex flex-col space-y-2">
                      <FileInput
                        id="profile-photo"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        JPG, PNG, GIF veya WebP formatında (max 5MB)
                      </p>
                      {photoUrl && !isPhotoRemoved && (
                        <Button
                          color="failure"
                          size="xs"
                          onClick={handleRemovePhoto}
                          className="self-start"
                        >
                          Fotoğrafı Kaldır
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Butonları */}
              <div className="w-full">
                {isEditing ? (
                  <div className="flex flex-col space-y-2">
                    <Button 
                      color="success" 
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <HiCheck className="w-4 h-4 mr-2" />
                      {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                    <Button 
                      color="gray" 
                      onClick={handleEditToggle}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <HiX className="w-4 h-4 mr-2" />
                      İptal
                    </Button>
                  </div>
                ) : (
                  <Button 
                    color="blue" 
                    onClick={handleEditToggle} 
                    className="w-full"
                  >
                    <HiPencil className="w-4 h-4 mr-2" />
                    Profili Düzenle
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sağ Kolon - Profil Bilgileri */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Kişisel Bilgiler</h2>
            
            <div className="space-y-6">
              {/* Kullanıcı Adı */}
              <div>
                <CustomLabel htmlFor="username">
                  <div className="flex items-center">
                    <HiUser className="w-5 h-5 text-gray-500 mr-2" />
                    <span>Kullanıcı Adı</span>
                  </div>
                </CustomLabel>
                {isEditing ? (
                  <TextInput
                    id="username"
                    name="username"
                    value={editedUser.username}
                    onChange={handleInputChange}
                    placeholder="Kullanıcı adınız"
                    required
                    autoComplete="username"
                    disabled={isLoading}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 font-medium">{loggedInUser.username}</p>
                  </div>
                )}
              </div>

              {/* E-posta */}
              <div>
                <CustomLabel htmlFor="email">
                  <div className="flex items-center">
                    <HiMail className="w-5 h-5 text-gray-500 mr-2" />
                    <span>E-posta Adresi</span>
                  </div>
                </CustomLabel>
                {isEditing ? (
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 font-medium">{loggedInUser.email}</p>
                  </div>
                )}
              </div>

              {/* Kullanıcı ID */}
              <div>
                <CustomLabel>Kullanıcı ID</CustomLabel>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-mono font-medium">#{loggedInUser.id}</p>
                </div>
              </div>

              {/* Kayıt Tarihi */}
              {userStats.createdAt && (
                <div>
                  <CustomLabel>Kayıt Tarihi</CustomLabel>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 font-medium">{formatDate(userStats.createdAt)}</p>
                  </div>
                </div>
              )}

              {/* Son Giriş Tarihi */}
              {userStats.lastLogin && (
                <div>
                  <CustomLabel>Son Giriş Tarihi</CustomLabel>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 font-medium">{formatDate(userStats.lastLogin)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPasswordContent = () => (
    <div className="mt-6">
      <Card className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Şifre Değiştir</h2>
        
        <div className="space-y-6">
          {/* Mevcut Şifre */}
          <div>
            <CustomLabel htmlFor="currentPassword">
              <div className="flex items-center">
                <HiLockClosed className="w-5 h-5 text-gray-500 mr-2" />
                <span>Mevcut Şifre</span>
              </div>
            </CustomLabel>
            <TextInput
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Mevcut şifrenizi girin"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Yeni Şifre */}
          <div>
            <CustomLabel htmlFor="newPassword">
              <div className="flex items-center">
                <HiKey className="w-5 h-5 text-gray-500 mr-2" />
                <span>Yeni Şifre</span>
              </div>
            </CustomLabel>
            <TextInput
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="En az 6 karakter"
              required
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-gray-500">
              Şifreniz en az 6 karakter uzunluğunda olmalıdır.
            </p>
          </div>

          {/* Yeni Şifre Tekrarı */}
          <div>
            <CustomLabel htmlFor="confirmPassword">
              <div className="flex items-center">
                <HiLockClosed className="w-5 h-5 text-gray-500 mr-2" />
                <span>Yeni Şifre Tekrarı</span>
              </div>
            </CustomLabel>
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Yeni şifrenizi tekrar girin"
              required
              autoComplete="new-password"
            />
          </div>

          {/* Şifre Güvenlik İpuçları */}
          <Alert color="info">
            <HiExclamation className="w-5 h-5" />
            <div className="ml-3">
              <span className="font-medium">Şifre Güvenliği İpuçları</span>
              <div className="mt-2 text-sm">
                <p>• En az 6 karakter kullanın</p>
                <p>• Büyük ve küçük harf kombinasyonu kullanın</p>
                <p>• Rakam ve özel karakter ekleyin</p>
                <p>• Daha önce kullandığınız şifreleri tekrar kullanmayın</p>
              </div>
            </div>
          </Alert>

          {/* Action Butonları */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              color="alternative"
              onClick={() => {
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: ""
                });
                setActiveTab(0);
              }}
              disabled={changingPassword}
            >
              İptal
            </Button>
            <Button
              color="blue"
              onClick={handleChangePassword}
              disabled={
                !passwordData.currentPassword.trim() ||
                !passwordData.newPassword.trim() ||
                !passwordData.confirmPassword.trim() ||
                passwordData.newPassword.length < 6 ||
                passwordData.newPassword !== passwordData.confirmPassword ||
                changingPassword
              }
            >
              {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profilim</h1>
          <p className="text-gray-600">Kişisel bilgilerinizi yönetin</p>
        </div>

        {/* Custom Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab(0)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 0
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HiUser className="w-5 h-5 mr-2" />
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 1
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HiKey className="w-5 h-5 mr-2" />
                Şifre Değiştir
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 0 && renderProfileContent()}
            {activeTab === 1 && renderPasswordContent()}
          </div>
        </div>

        {/* Onay Modalı */}
        <Modal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          size="md"
        >
          <ModalHeader className="border-b border-gray-200">
            Değişiklikleri Kaydet
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <HiCamera className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Profil güncellemesini onaylıyor musunuz?
                </h3>
                <p className="text-gray-500">
                  Yaptığınız değişiklikler profilinize kaydedilecektir.
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-4">
                <Button
                  color="alternative"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isLoading}
                  className="px-6"
                >
                  İptal
                </Button>
                <Button
                  color="success"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-6"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Evet, Kaydet'}
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default UserProfile;