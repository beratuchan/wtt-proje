# WTT — Not Paylaşım Platformu

NestJS ve React ile geliştirilmiş full-stack bir not paylaşım uygulaması. Kullanıcılar not defterleri ve sayfalar oluşturabilir; keşfet ekranında başkalarının public içeriklerini bulup kendi defterlerine ekleyebilir.

## Özellikler

- **Not defteri & sayfa yönetimi** — oluştur, düzenle, sil; defter başına public/private ayarı
- **Keşfet akışı** — diğer kullanıcıların public sayfalarını görüntüle ve kopyala
- **Rich text editör** — sayfalara başlık, metin, görsel blokları ekle
- **Görsel yükleme** — Cloudinary üzerinden sayfa görseli ve profil fotoğrafı
- **JWT kimlik doğrulama** — kayıt, giriş, şifre değiştirme
- **Şikayet & moderasyon** — içerik raporlama ve admin onayı
- **Admin paneli** — kullanıcı yönetimi, şikayet yönetimi, istatistikler

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Flowbite |
| Auth | Passport.js, JWT |
| Dosya yükleme | Multer, Cloudinary |
| Deploy | Render (API), Vercel (UI) |

## Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL

### Backend

```bash
cd back_end
npm install
cp .env.example .env   # .env dosyasını düzenle
npm run start:dev
```

### Frontend

```bash
cd front_end
npm install
npm run dev
```

### Ortam Değişkenleri

`back_end/.env.example` dosyasındaki tüm değişkenler gereklidir:

| Değişken | Açıklama |
|---|---|
| `DB_HOST / DB_PORT / DB_USER / DB_PASS / DB_NAME` | PostgreSQL bağlantı bilgileri |
| `JWT_SECRET` | JWT imzalama anahtarı |
| `CLOUDINARY_NAME / API_KEY / API_SECRET` | Cloudinary hesap bilgileri (görsel yükleme için) |

## Proje Yapısı

```
wtt-proje/
├── back_end/
│   └── src/
│       ├── auth/          # JWT, Guards, kullanıcı yönetimi
│       ├── notebooks/     # Not defteri CRUD
│       ├── devlogs/       # Sayfa CRUD, görsel yükleme
│       ├── complaint/     # Şikayet & moderasyon
│       └── config/        # Cloudinary yapılandırması
└── front_end/
    └── src/
        ├── components/    # Sayfa ve UI bileşenleri
        └── types/         # TypeScript tip tanımları
```

---

**Oluşturan:** Talha Berat Oruçhan
