# Troubleshooting Guide - CapStation Frontend

## 🔴 Error: "GET request error: {}"

### Penyebab:
1. **Backend tidak running**
2. **Endpoint URL salah**
3. **CORS issue**
4. **Token tidak valid atau expired**

### Solusi:

#### 1️⃣ Pastikan Backend Running
```bash
# Check if port 5000 is listening
Test-NetConnection -ComputerName localhost -Port 5000

# Expected output:
# TcpTestSucceeded : True
```

Jika `False`, jalankan backend:
```bash
cd backend
npm run dev
```

#### 2️⃣ Verifikasi Environment Variables
Check file `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Penting:** Setelah ubah `.env.local`, RESTART Next.js dev server!
```bash
# Stop dev server (Ctrl+C)
npm run dev  # Start again
```

#### 3️⃣ Login Dulu untuk Mendapatkan Token
API endpoint `/projects/my-projects` memerlukan authentication. Pastikan:

1. **Login ke aplikasi** di browser: `http://localhost:3001/login`
2. Masukkan credentials (email & password)
3. Token otomatis disimpan di `localStorage`
4. Refresh dashboard page

Cek token di browser console:
```javascript
// Open browser DevTools (F12) -> Console
localStorage.getItem('accessToken')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

#### 4️⃣ Check Browser Console Logs
Buka DevTools (F12) dan lihat console untuk logs:

✅ **Successful Request:**
```
🔵 GET Request: { endpoint: '/projects/my-projects', ... }
🟢 GET Response: { status: 200, ok: true }
✅ GET Success: { dataType: 'object', hasData: true }
```

❌ **Failed Request:**
```
🔴 Network/CORS Error: { ... }
// atau
🔴 GET Error: { status: 401, message: 'Unauthorized' }
```

---

## 🐛 Common Issues

### Issue: "Unauthorized" (401)
**Cause:** Token expired atau tidak ada token
**Solution:** Login lagi ke aplikasi

### Issue: "Cast to ObjectId failed"
**Cause:** Endpoint URL salah (backend route tidak match)
**Solution:** 
- Frontend: `/projects/my-projects` ✅
- **Bukan:** `/projects/my` ❌

### Issue: CORS Error
**Cause:** Backend tidak ada CORS middleware atau salah konfigurasi
**Solution:** Check backend `app.js` atau `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### Issue: "Failed to fetch"
**Cause:** Backend tidak running atau network issue
**Solution:** 
1. Check backend running: `Test-NetConnection localhost -Port 5000`
2. Check backend logs untuk error
3. Restart backend

---

## 🔧 Quick Diagnostics

Run ini di browser console (F12):

```javascript
// 1. Check API URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// 2. Check token
console.log('Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');

// 3. Test backend health
fetch('http://localhost:5000/api/projects')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend Error:', e));

// 4. Test my-projects endpoint
fetch('http://localhost:5000/api/projects/my-projects', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(d => console.log('My Projects:', d))
  .catch(e => console.error('Error:', e));
```

---

## 📝 Logging Debug

Jika masih error, cek logs di console:

### Frontend Logs:
```
📊 Loading dashboard data...
🔑 Auth token: Present
🌐 API URL: http://localhost:5000/api
🔵 GET Request: /projects/my-projects
🟢 GET Response: 200
✅ GET Success: Array with 5 projects
```

### Backend Logs:
```
GET /api/projects/my-projects 200 45ms
```

Jika logs tidak muncul atau error, screenshot dan tanya!

---

## ✅ Checklist Before Asking for Help

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3001
- [ ] `.env.local` sudah benar
- [ ] Sudah login dan punya token
- [ ] Sudah restart dev server setelah ubah env
- [ ] Browser console tidak ada CORS error
- [ ] Backend endpoint ada di routes (check backend code)

---

## 🆘 Contact

Jika masih bermasalah setelah semua langkah:
1. Screenshot browser console (F12)
2. Screenshot backend terminal/logs
3. Copy paste error message lengkap
4. Tanya di chat!
