# Render + Vercel Deploy Rehberi

## 📋 Checklist Öncesi

- [ ] .env.example dosyalarını kontrol ettiniz
- [ ] `npm run build` yerel olarak başarıyla çalışıyor mu kontrol ettiniz
- [ ] GitHub'a push ettiniz

## 🚀 Backend Deploy (Render)

### 1. Render'da Web Service Oluştur

- [render.com](https://render.com) 'a git
- "New +" → "Web Service"
- GitHub repo'nu bağla
- Runtime: **Node**
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

### 2. Ortam Değişkenlerini Ayarla

`Environment` sekmesinden ekle:

```
NODE_ENV=production
PORT=3000
BACKEND_URL=https://your-app-name.onrender.com

DB_HOST=[PostgreSQL host]
DB_PORT=5432
DB_USER=postgres
DB_PASS=[PostgreSQL password]
DB_NAME=wtt_db

JWT_SECRET=[Generate bir güvenli string]

CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:5173
```

### 3. PostgreSQL Database Ekle

- Render'da "New +" → "PostgreSQL"
- Database name: `wtt_db`
- User: `postgres`
- Oluşturduktan sonra bağlantı bilgilerini kopyala ve yukarıdaki ortam değişkenlerine yaz

### 4. Deploy Et

- "Create Web Service" tıkla
- Render otomatik olarak deploy edecek (ilk deploy 2-5 dakika sürebilir)
- Build tamamlandıktan sonra backend URL'nizi kopyalayın (örn: https://wtt-backend.onrender.com)

---

## 🎨 Frontend Deploy (Vercel)

### 1. Vercel'de Proje Oluştur

- [vercel.com](https://vercel.com) 'a git
- "Add New" → "Project"
- GitHub repo'nu bağla
- Framework: **Vite**
- Build Command: `npm run build` (otomatik algılanmalı)
- Output Directory: `dist`

### 2. Ortam Değişkenlerini Ayarla

`Settings` → `Environment Variables` sekmesinden ekle:

```
VITE_API_URL=https://your-app-name.onrender.com
```

### 3. Deploy Et

- "Deploy" tıkla
- Vercel otomatik olarak build ve deploy edecek
- Deploy tamamlandığında frontend URL'nizi alacaksınız (örn: https://wtt-frontend.vercel.app)

---

## ✅ Post-Deploy Kontrol

1. **Backend'in çalışıp çalışmadığını kontrol et:**

   ```bash
   curl https://your-backend.onrender.com/
   ```

2. **Frontend'i aç ve login dene**

3. **Tarayıcı konsolu hatasını kontrol et (F12)**

4. **Backend'de upload dosyaları**
   - Render'da "Disks" kullanılabilir veya S3 benzeri external storage kullan

---

## 🔧 Yaygın Sorunlar

### 1. "Connection refused" - Database hatası

- DB_HOST, DB_USER, DB_PASS doğru ayarlandı mı kontrol et
- Render PostgreSQL'in "Info" sekmesinden bağlantı stringi kopyala

### 2. Frontend API'ye bağlanamıyor

- VITE_API_URL değişkeni doğru URL'ye ayarlandı mı?
- Backend CORS'u frontend URL'sini içeriyor mu?

### 3. Upload dosyaları görüntülenmiyor

- Render ücretsiz plan diskine yazamaz
- Çözüm: S3, Cloudinary veya benzer external storage kullan
- Dosya yükleme kodu güncelle (arkadaş tarafından yapılabilir)

### 4. Port hatası

- Render otomatik PORT ortam değişkeni ayarlar
- `PORT` ortam değişkenini kullandığımız için sorun olmamalı

---

## 📚 Yararlı Linkler

- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- PostgreSQL Render: https://render.com/docs/databases
