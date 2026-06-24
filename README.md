# WTT — Not Defteri Uygulaması

NestJS ve React ile geliştirilmiş full-stack bir not defteri uygulaması. Kullanıcılar not defterleri ve sayfalar oluşturabilir; keşfet ekranında diğer kullanıcıların içeriklerini bulup kendi defterlerine ekleyebilir.

## Özellikler

- **Not defteri & sayfa yönetimi** — oluştur, düzenle, sil
- **Keşfet akışı** — diğer kullanıcıların public sayfalarını görüntüle ve kopyala
- **JWT kimlik doğrulama** — kayıt, giriş, token yenileme
- **Rol tabanlı yetkilendirme** — `user` ve `admin` rolleri
- **Admin paneli** — kullanıcı şikayetlerini görüntüle ve yönet
- **Dosya yükleme** — sayfalara görsel ekleme
- **Docker ile deploy** — backend Render, frontend Vercel üzerinde çalışır

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | NestJS, TypeScript, TypeORM |
| Frontend | React, TypeScript, Vite |
| Auth | JWT, Guards, Role Decorator |
| Deploy | Docker, Render (API), Vercel (UI) |

## Mimari

```
┌─────────────────┐        ┌──────────────────────────────┐
│  React + Vite   │  HTTP  │        NestJS API             │
│  (TypeScript)   │ ──────►│  auth / notebooks / complaints│
│  Vercel deploy  │        │  Docker + Render deploy       │
└─────────────────┘        └──────────────────────────────┘
```

## Başlangıç

### Backend

```bash
cd back_end
npm install
npm run start:dev
```

### Frontend

```bash
cd front_end
npm install
npm run dev
```

### Docker ile tümünü çalıştır

```bash
docker-compose up --build
```

## Proje Yapısı

```
wtt-proje/
├── back_end/
│   └── src/
│       ├── auth/          # JWT, Guards, Rol yönetimi
│       ├── notebooks/     # Not defteri CRUD
│       ├── complaint/     # Şikayet modülü
│       └── main.ts
├── front_end/
│   └── src/
│       ├── components/
│       ├── types/
│       └── main.tsx
└── docker-compose.yml
```

---

**Oluşturan:** Talha Berat Oruçhan
