# CapStation-Frontend

## 📌 Deskripsi Aplikasi
CapStation adalah sebuah web application yang dirancang untuk mendukung manajemen capstone bagi mahasiswa Departemen Teknik Elektro dan Teknologi Informasi (DTETI) Universitas Gadjah Mada. Aplikasi ini dikembangkan untuk mengintegrasikan seluruh proses capstone, mulai dari pengajuan, pembentukan kelompok, bimbingan, hingga dokumentasi akhir.

CapStation hadir sebagai solusi atas permasalahan umum dalam pengelolaan capstone, seperti kesulitan melanjutkan proyek dari periode sebelumnya, kurangnya dokumentasi terstruktur, serta keterbatasan komunikasi antar stakeholder. Dengan CapStation, mahasiswa, dosen pembimbing, dan pihak departemen dapat berkolaborasi secara lebih efisien, transparan, dan berkelanjutan.

Fitur utama meliputi manajemen proyek, manajemen kelompok, manajemen pengumuman, dokumentasi digital, serta autentikasi dan otorisasi modern (verifikasi email, reset password, login Google OAuth2, dan RBAC). Melalui fitur-fitur ini, CapStation memungkinkan pengajuan proyek baru, pelanjutan proyek terdahulu, pemantauan status, serta penyebaran informasi yang lebih efektif. Dengan demikian, CapStation tidak hanya mempermudah mahasiswa dalam melaksanakan capstone, tetapi juga membantu dosen dan pihak departemen dalam pembimbingan, monitoring, serta pengambilan keputusan, sehingga keseluruhan proses capstone menjadi lebih terstruktur, terdokumentasi, dan berkelanjutan.

## ✨ Nama Kelompok dan Daftar Anggota
### Kelompok 7

| No | Nama | NIM |
|----|------|-----|
| 1 | Fahmi Irfan Faiz | 23/520563/TK/57396 |
| 2 | Nevrita Natasya Putriana | 23/514635/TK/56500 |
| 3 | Benjamin Sigit | 23/514737/TK/56513 |
| 4 | Moses Saidasdo | 23/523274/TK/57854 |
| 5 | Hayunitya Edadwi Pratita | 23/518670/TK/57134 |

## 📂 Struktur Folder
```
capstation-frontend/
│
├── .next/                        # Build output Next.js
├── node_modules/                 # Dependencies (auto-generated)
├── public/                       # Static assets (icons, images)
│
├── src/
│   ├── app/                      
│   │   ├── admin/                
│   │   │   ├── announcements/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.jsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── competencies/
│   │   │   │   └── page.jsx
│   │   │   ├── documents/
│   │   │   │   └── page.jsx
│   │   │   ├── browse-capstones/
│   │   │   │   └── page.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.jsx
│   │   │   └── users/
│   │   │       ├── [id]/
│   │   │       │   ├── edit/
│   │   │       │   │   └── page.jsx
│   │   │       │   └── page.jsx
│   │   │       ├── new/
│   │   │       │   └── page.jsx
│   │   │       └── page.jsx
│   │   │
│   │   ├── announcements/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── create/
│   │   │   │   └── page.jsx
│   │   │   └── page.jsx
│   │   │
│   │   ├── documents/
│   │   │   └── page.jsx
│   │   │
│   │   ├── groups/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── manage/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── settings/
│   │   │   │   └── page.jsx
│   │   │   ├── create/
│   │   │   │   └── page.jsx
│   │   │   ├── my/
│   │   │   │   └── page.jsx
│   │   │   ├── new/
│   │   │   │   └── page.jsx
│   │   │   └── page.jsx
│   │   │
│   │   ├── login/
│   │   │   └── page.jsx
│   │   ├── oauth-setup/
│   │   │   └── page.jsx
│   │   ├── forgot-password/
│   │   │   └── page.jsx
│   │   ├── register/
│   │   │   └── page.jsx
│   │   ├── verify-email/
│   │   │   └── page.jsx
│   │   ├── reset-password/
│   │   │   └── page.jsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.jsx
│   │   │
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── new/
│   │   │   │   └── page.jsx
│   │   │   └── page.jsx
│   │   │
│   │   ├── request/
│   │   │   ├── decision/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── history/
│   │   │   │   └── page.jsx
│   │   │   └── new/
│   │   │       └── page.jsx
│   │   │
│   │   ├── layout.js
│   │   ├── page.js              # Landing page
│   │   ├── not-found.jsx
│   │   └── globals.css          # Global styling
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminSidebar.jsx
│   │   ├── announcement/
│   │   │   └── AnnouncementFormComponent.jsx
│   │   ├── group/
│   │   │   ├── GroupCard.jsx
│   │   │   ├── GroupFormComponent.jsx
│   │   │   ├── InvitationCard.jsx
│   │   │   ├── InviteMemberDialog.jsx
│   │   │   ├── JoinRequestCard.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   ├── MemberList.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── project/
│   │   │   └── ProjectCard.jsx
│   │   │
│   │   ├── ui/                 # ShadCN/Radix UI Components
│   │   │   ├── alert-dialog.jsx
│   │   │   ├── avatar.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── checkbox.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── pagination.jsx
│   │   │   ├── progress.jsx
│   │   │   ├── radio-group.jsx
│   │   │   ├── scroll-area.jsx
│   │   │   ├── table.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── textarea.jsx
│   │   │   ├── toast.jsx
│   │   │   ├── toaster.jsx
│   │   │   └── tooltip.jsx
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── use-toast.js
│   │
│   ├── lib/
│   │   ├── api-client.js
│   │   ├── api-config.js
│   │   ├── groupUtils.js
│   │   └── utils/
│   │       ├── formatters.js
│   │       └── utils.js
│   │
│   ├── services/
│       ├── AdminService.js
│       ├── AnnouncementService.js
│       ├── AuthService.js
│       ├── CompetencyService.js
│       ├── DashboardService.js
│       ├── DocumentService.js
│       ├── GroupService.js
│       ├── OAuthService.js
│       ├── ProjectService.js
│       ├── RequestService.js
│       └── UserService.js 
│
├── .env.example
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── LICENSE
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.js
└── README.md
```

## 💡 Fitur Aplikasi
### 👨‍🎓 **Fitur Role Mahasiswa**

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Utama** | Melihat ringkasan proyek, dokumen, dan pengumuman, serta akses cepat ke fitur-fitur yang tersedia |
| **Buat Proyek Baru** | Membuat proyek capstone dengan kategori, tema, dosen pembimbing |
| **Lanjutkan Proyek Lama** | Browse proyek dari tahun sebelumnya dan ajukan lanjutan dengan approval |
| **Buat dan Kelola Grup** | Membentuk kelompok capstone dengan invite member berdasarkan email yang telah terdaftar, max 5 orang. Mengelola anggota grup, lihat detail member, tinggalkan grup|
| **Upload Dokumen** | Upload proposal, progress report, final report dengan validasi |
| **Lihat Pengumuman** | Melihat pengumuman dari dosen/admin |
| **Edit Profil dan Kelola Kompetensi** | Update data pribadi dan kompetensi |

### 👨‍🏫 **Untuk Dosen**

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Utama** | Melihat statistik proyek, student progress, document status |
| **Lihat Proyek Bimbingan** | Melihat progress proyek bimbingan dosen tersebut |
| **Beri Feedback** | Memberikan feedback dan catatan ke proyek mahasiswa |
| **Verifikasi Dokumen** | Review dokumen dari mahasiswa, approve atau reject dengan alasan |
| **Buat dan Kelola Pengumuman** | Membuat pengumuman ke semuanya dan bisa edit, hapus, tandai penting pengumuman yang dibuat |
| **Proses Request** | Menerima/menolak permintaan lanjutan proyek dari mahasiswa |
| **Lihat History** | Melihat riwayat keputusan yang sudah dibuat |

### 🔧 **Untuk Admin**

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Utama** | Statistik lengkap sistem (user, project, group, document) |
| **Dashboard Khusus Admin** | Shortcut kelola fitur seperti grup, dokumen, project, pengguna, pengumuman , serta ringkasan statistik total grup, proyek, dokumen, dan user |
| **Kelola User** | CRUD user, ubah role (mahasiswa/dosen/admin), nonaktifkan akun |
| **Kelola Proyek** | Lihat semua proyek, edit, hapus, manage kategori dan tema |
| **Kelola Grup** | Lihat semua grup, lihat member, edit, hapus grup |
| **Kelola Pengumuman** | Buat/edit/hapus pengumuman sistem-wide |
| **Kelola Kompetensi** | CRUD kompetensi yang tersedia di sistem |
| **Verifikasi Dokumen** | Verifikasi dokumen dari semua mahasiswa |

## ⚙️ Teknologi yang Digunakan (Frontend)
Dalam pengembangan CapStation-Frontend, teknologi utama yang digunakan meliputi:
- Deployment dan Version Control:
  - Git/GitHub untuk kolaborasi dan kontrol.
  - File .gitignore untuk manajemen file sensitif
- Frontend Framework
  - Next.js sebagai react framework
  - React sebagai library untuk membangun UI Component
- Styling, CSS, UI Component
  - Tailwind CSS
  - Radix UI
  - ShadCN UI
- HTTP dan API Communication
  - Fetch API sebagai native browser HTTP request
  - JWT (JSON Web Token) sebagai token-based authentication
- Development & Build Tools
  - ESLint 

## 🔗 URL Video Presentasi dan Deploy Aplikasi

[📁 Tautan Google Drive Video Presentasi]()

[📁 Tautan Deployment Frontend](https://capstation-frontend.vercel.app/)

[📁 Tautan Deployment Backend](https://capstation-backend.vercel.app/)

## ⚒️ Instalasi
1. Clone repository   
   ```bash
   git clone https://github.com/CapStation/capstation-frontend.git 
   cd capstation-frontend
   ```
   
2. Install dependencies   
      ```bash
      # Install semua npm packages
      npm install
      
      # Atau jika menggunakan yarn
      yarn install
      
      # Atau jika menggunakan pnpm
      pnpm install
      ```
   ⏳ Proses instalasi bisa memakan waktu 2-5 menit tergantung kecepatan internet Anda.

3. Setup Environment Variables
   ```
   cp .env.example .env.local
   ```
   Lalu buka file .env.local dan sesuaikan dengan yang ada di bagian Konfigurasi Environment Variables.
4. Jalankan server
   ```
   npm run dev
   ```
   Output akan menampilkan:
   ⚠ ready on 0.0.0.0:3000, url: http://localhost:3000
   Lalu, buka browser dan akses: **http://localhost:3000**

## 🔑 Konfigurasi Environment Variables
1. Copy Template
   ``` bash
   cp .env.example .env.local
   ```
   
2. Isi Environment Variables di File .env.local
   Buka `.env.local` dan isikan
   ```dotenv
    NEXT_PUBLIC_API_URL=https://capstation-backend.vercel.app/api
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME=CapStation
   ```

## 📡 API Endpoints
Semua request dari frontend akan dikirim ke `https://capstation-backend.vercel.app/api` . Berikut ini endpoint utama yang digunakan oleh CapStation-Frontend

### 🔐 Authentication (Auth)

| Endpoint                | Method | Deskripsi                               |
| ----------------------- | ------ | --------------------------------------- |
| `/auth/register`        | POST   | Registrasi akun baru                    |
| `/auth/verify`          | GET    | Verifikasi email menggunakan token      |
| `/auth/login`           | POST   | Login dengan email & password           |
| `/auth/forgot-password` | POST   | Request link reset password             |
| `/auth/reset-password`  | POST   | Set password baru dengan token          |
| `/auth/google`          | GET    | Redirect / callback login Google OAuth2 |

### 📢 Announcements

| Endpoint             | Method | Deskripsi                      |
| -------------------- | ------ | ------------------------------ |
| `/announcements`     | GET    | List pengumuman                |
| `/announcements`     | POST   | Buat pengumuman (dosen/admin)  |
| `/announcements/:id` | GET    | Detail pengumuman              |
| `/announcements/:id` | PUT    | Edit pengumuman (dosen/admin)  |
| `/announcements/:id` | DELETE | Hapus pengumuman (dosen/admin) |

### 📊 Dashboard

| Endpoint     | Method | Deskripsi                                          |
| ------------ | ------ | -------------------------------------------------- |
| `/dashboard` | GET    | Data dashboard sesuai role (mahasiswa/dosen/admin) |

### 👥 Groups

| Endpoint                        | Method | Deskripsi                             |
| ------------------------------- | ------ | ------------------------------------- |
| `/groups`                       | GET    | List semua grup                       |
| `/groups`                       | POST   | Buat grup baru                        |
| `/groups/my`                    | GET    | List grup yang diikuti user           |
| `/groups/:id`                   | GET    | Detail grup                           |
| `/groups/:id`                   | PUT    | Edit info grup                        |
| `/groups/:id`                   | DELETE | Hapus grup (owner/admin)              |
| `/groups/:id/available-users`   | GET    | List user yang bisa di-invite ke grup |
| `/groups/:id/invite`            | POST   | Invite member baru ke grup            |
| `/groups/:id/members/:memberId` | DELETE | Remove member dari grup               |
| `/groups/:id/leave`             | POST   | User keluar dari grup                 |

### 📁 Capstone Projects

| Endpoint        | Method | Deskripsi                                                     |
| --------------- | ------ | ------------------------------------------------------------- |
| `/projects`     | GET    | List proyek (mendukung query: `status`, `category`, `search`) |
| `/projects`     | POST   | Buat proyek baru (mahasiswa)                                  |
| `/projects/:id` | GET    | Detail proyek                                                 |
| `/projects/:id` | PUT    | Update proyek                                                 |
| `/projects/:id` | DELETE | Hapus proyek (biasanya hanya jika status = DRAFT)             |

### 📄 Documents

| Endpoint                              | Method | Deskripsi                                             |
| ------------------------------------- | ------ | ----------------------------------------------------- |
| `/documents`                          | GET    | List dokumen (mendukung query: `projectId`, `status`) |
| `/documents`                          | POST   | Upload dokumen (proposal, laporan, dll)               |
| `/documents/:id`                      | GET    | Detail dokumen                                        |
| `/documents/:id`                      | PUT    | Reupload / update dokumen (mis. setelah ditolak)      |
| `/documents/:id`                      | DELETE | Hapus dokumen                                         |
| `/documents/:id/verify` (dosen/admin) | PATCH  | Approve / reject dokumen dengan feedback              |

### 👤 User dan Profile

| Endpoint             | Method | Deskripsi                           |
| -------------------- | ------ | ----------------------------------- |
| `/users/me`          | GET    | Ambil profil user yang sedang login |
| `/users/me`          | PUT    | Update profil user                  |
| `/users` (admin)     | GET    | List semua user (hanya admin)       |
| `/users/:id` (admin) | PUT    | Update user & role (hanya admin)    |

### 🎓 Competencies
| Endpoint                    | Method | Deskripsi                         |
| --------------------------- | ------ | --------------------------------- |
| `/competencies`             | GET    | List kompetensi yang tersedia     |
| `/competencies` (admin)     | POST   | Tambah kompetensi baru            |
| `/competencies/:id` (admin) | PUT    | Edit kompetensi                   |
| `/competencies/:id` (admin) | DELETE | Hapus kompetensi                  |
| `/users/competencies`       | POST   | Tambah kompetensi ke profil user  |
| `/users/competencies/:id`   | DELETE | Hapus kompetensi dari profil user |

### 🔄 Project Requests dan Browse Capstones

| Endpoint                | Method | Deskripsi                                       |
| ----------------------- | ------ | ----------------------------------------------- |
| `/browse/capstones`     | GET    | Browse proyek capstone terdahulu                |
| `/requests`             | POST   | Ajukan permintaan lanjutan proyek               |
| `/requests`             | GET    | List permintaan (filter `?status=pending`, dll) |
| `/requests/:id/decide`  | PATCH  | Approve / reject request (dosen)                |
| `/requests/:id/history` | GET    | Riwayat keputusan untuk request                 |
| `/me/decisions/history` | GET    | Riwayat keputusan dosen                         |


