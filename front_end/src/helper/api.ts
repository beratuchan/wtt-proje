import axios from "axios";
import Cookies from "universal-cookie";

export const api = axios.create({
  baseURL: "http://localhost:3000/",
});

// Her istekten önce token'ı otomatik ekle
api.interceptors.request.use(
  (config) => {
    const cookies = new Cookies();
    const loggedInUser = cookies.get("loggedInUser");
    
    if (loggedInUser) {
      let token;
      if (typeof loggedInUser === 'string') {
        token = JSON.parse(loggedInUser).accessToken;
      } else {
        token = loggedInUser.accessToken;
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıtlarda hata kontrolü (basit hali)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Hatası:", error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export function setToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearToken() {
  delete api.defaults.headers.common["Authorization"];
}

// ✅ YENİ: Kullanıcı fotoğrafları için özel cache busting fonksiyonu
export function getUserPhotoUrl(url: string | null | undefined, forceRefresh = false): string {
  if (!url || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
  }
  
  // Zaten tam URL ise
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Cache busting için timestamp ekleyelim (sadece forceRefresh true ise)
    return forceRefresh ? `${url}?t=${Date.now()}` : url;
  }
  
  // Local development için base URL
  const baseUrl = 'http://localhost:3000';
  
  // Eğer slash ile başlamıyorsa ekle
  const path = url.startsWith('/') ? url : `/${url}`;
  
  // Eğer uploads ile başlıyorsa direkt kullan
  if (path.includes('uploads/')) {
    const fullUrl = `${baseUrl}${path}`;
    return forceRefresh ? `${fullUrl}?t=${Date.now()}` : fullUrl;
  }
  
  // Varsayılan olarak uploads klasörüne ekle
  const fullUrl = `${baseUrl}/uploads${path}`;
  return forceRefresh ? `${fullUrl}?t=${Date.now()}` : fullUrl;
}

// src/helper/api.ts - GÜNCELLENMİŞ getFullImageUrl
export function getFullImageUrl(url: string | null | undefined): string {
  if (!url || url.trim() === '') {
    return '';
  }
  
  // Zaten tam URL ise
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // base64 ise
  if (url.startsWith('data:image')) {
    return url;
  }
  
  // Local development için base URL
  const baseUrl = 'http://localhost:3000';
  
  // Eğer slash ile başlamıyorsa ekle
  const path = url.startsWith('/') ? url : `/${url}`;
  
  // Eğer uploads ile başlıyorsa direkt kullan
  if (path.includes('uploads/')) {
    return `${baseUrl}${path}`;
  }
  
  // Varsayılan olarak profile-photos klasörüne ekle
  return `${baseUrl}/uploads/profile-photos${path}`;
}

// ✅ Alternatif: Vite environment variable kullanarak
export function getFullUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Zaten tam URL ise
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Backend URL'sini al (env'den veya sabit)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  // Relative URL ise tamamla
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  } else {
    return `${baseUrl}/${url}`;
  }
}
