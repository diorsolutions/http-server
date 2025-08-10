# CRUD Users — 0% dan 100% gacha Roadmap (loyiha rejasi)

Ushbu yo‘l xarita sizga mutlaqo “clean” papkadan boshlagan holda loyihani ishga tushirish, tekshirish va deploy qilishni bosqichma-bosqich ko‘rsatadi. Ikki deploy varianti bor:
- Variant A: To‘g‘ridan-to‘g‘ri Vercel (eng oson, demo). Eslatma: serverless muhitda faylga yozish (data/users.json) doimiy saqlanmasligi mumkin.
- Variant B: Production-ga yaqin (doimiy yozish) — Frontend Vercel’da, Backend (scripts/index.js) Render/Railway’da. Frontend /api/users so‘rovlarini backendga proksi (rewrites) qiladi. Bu holda data/users.json ga real yoziladi.

Iltimos, variantni maqsadingizga qarab tanlang. Kod fayllarini o‘zgartirish shart emas (B variantda rewrites’ni Vercel Dashboard’da qo‘lda sozlaysiz).


01) 0% — Muhitni tayyorlash
- Talablar:
  - GitHub akkaunti
  - Node.js 18+ (npm bilan birga) — tekshirish: node -v va npm -v
  - Vercel akkaunti (vercel.com)
  - Render (render.com) yoki Railway (railway.app) akkaunti — faqat Variant B uchun
- Papka yaratish:
  - Kompyuteringizda bo‘sh papka yarating: CRUD-Users
- Kodni olish:
  - Yoki mavjud GitHub repodan clone qiling:
    - git clone <repo_url> CRUD-Users
    - cd CRUD-Users


02) 10% — Lokal ishga tushirish
- Paketlarni o‘rnating:
  - npm install
- Dev serverni ishga tushiring:
  - npm run dev
- Brauzerda tekshiring:
  - http://localhost:3000
- UI funksiyalarini tekshiring:
  - Amal tanlash (Qidirish, Tahrirlash, Qo‘shish, O‘chirish)
  - Qidirish: ID kiriting → Qidirish
  - Tahrirlash: ID → Yuklash → maydon tanlash → qiymat kiritish → O‘zgartirish
  - O‘chirish: ID kiriting — “live” user chiqishi → O‘chirish
  - Qo‘shish: Yangi ID kiriting → “Mavjud/Band” ko‘rinadi → formani to‘ldiring → Qo‘shish
- Eslatma: Lokal muhitda data/users.json ga yozish ishlaydi.


03) 20% — GitHub’ga push
- Git init (agar repo bo‘lmasa):
  - git init
  - git add .
  - git commit -m "Initial commit"
- GitHub’da yangi repo yarating (private yoki public).
- Remote qo‘shing va push qiling:
  - git remote add origin <github_repo_url>
  - git push -u origin main


04) 40% — Variant A (eng oson demo): Vercel’da to‘g‘ridan-to‘g‘ri deploy
- New Project → Import Git Repository
- Framework: Next.js (App Router) avtomatik taniladi
- Environment Variables: None (hozircha kerak emas)
- Deploy tugmasini bosing
- Tekshirish:
  - https://<project-name>.vercel.app oching
  - UI funksiyalarini sinab ko‘ring
- Muhim eslatma:
  - Serverless muhitda faylga yozish doimiy saqlanmasligi mumkin (Add/Edit/Delete natijalari keyingi chaqiriqlarda yo‘qolishi ehtimoli bor). Demo uchun normal.
- Agar aynan “doimiy yozish” kerak bo‘lsa — Variant B ga o‘ting.


05) 60% — Variant B (tavsiya): Frontend (Vercel) + Backend (Render/Railway) bilan doimiy yozish
Maqsad: scripts/index.js ni alohida Node servis sifatida deploy qilish, data/users.json’ga real yozish. Frontenddan /api/users so‘rovlar backendga proksi qilinadi (Vercel Dashboard’dagi Rewrites bilan). Kod fayllarini o‘zgartirish shart emas.

B1. Backend uchun minimal repo tayyorlash (alohida kichik repo)
- Yangi papka yarating, masalan: users-json-backend
- CRUD-Users loyihangizdan quyidagilarni nusxa ko‘chiring:
  - scripts/index.js (o‘zgarishsiz)
  - data/users.json (o‘zgarishsiz)
- GitHub’da yangi repo yarating: users-json-backend
- Bu repoga push qiling:
  - git init
  - git add .
  - git commit -m "Backend JSON service"
  - git remote add origin <backend_repo_url>
  - git push -u origin main
- Eslatma: Node ESM (import) uchun Render/Railway “Start Command” orqali bevosita node scripts/index.js ishlaydigan qilib tanlang. (Ko‘pchilikda bu muammo bo‘lmaydi; Node 18+ ESM’ni qo‘llab-quvvatlaydi. Agar start paytida ESM xatosi bo‘lsa, Render’da “Start Command” ga node --experimental-modules scripts/index.js qo‘yib ishga tushiring yoki package.json’ga "type":"module" qo‘shish zarur bo‘ladi — buni keyinroq istasangiz qo‘lda qilishingiz mumkin, lekin hozircha kodni o‘zgartirmaslik sharti bilan “--experimental-modules” flag yetishi mumkin.)

B2. Backendni Render’da ishga tushirish
- Render.com → New Web Service → GitHub repo: users-json-backend
- Runtime: Node 18+
- Build Command: (bo‘sh qoldirishingiz mumkin)
- Start Command: node scripts/index.js
  - Agar ESM xatosi chiqsa: node --experimental-modules scripts/index.js
- Deploy tugmasi
- URL ni oling, masalan: https://your-json-backend.onrender.com
- Tekshirish:
  - Brauzer orqali GET https://your-json-backend.onrender.com/users
  - Yoki GET https://your-json-backend.onrender.com/users/20


06) 80% — Frontendni Vercel’da backendga ulash (rewrites, kodni o‘zgartirmay)
- Vercel Dashboard → Projects → CRUD Users loyihangiz → Settings → Routing (Redirects/Rewrites) bo‘limi
- Rewrites qo‘shing (2 ta qoidani UI orqali kiriting):
  - Source: /api/users
    Destination: https://your-json-backend.onrender.com/users
  - Source: /api/users/(.*)
    Destination: https://your-json-backend.onrender.com/users/$1
- Saqlang va “Redeploy” qiling (yoki yangi commit bilan autodeploy kuting)
- Mazkur rewrites bilan UI’dagi barcha /api/users so‘rovlari backendga boradi, backend esa data/users.json ga doimiy yozadi.


07) 90% — Yakuniy tekshiruvlar
- Frontend URL: https://<project-name>.vercel.app
- Test ssenariylari:
  - Qidirish (Get): ID kiriting → Qidirish → Markazda bitta user chiqsin
  - Tahrirlash (Edit): ID → Yuklash → “Maydonni tanlang” → qiymat → O‘zgartirish → xabar chiqsin
  - Qo‘shish (Add): Yangi ID kiriting → “Mavjud”/“Band” indikator → formani to‘ldiring → Qo‘shish → xabar
  - O‘chirish (Delete): ID kiriting → live natija ko‘rinsin → O‘chirish → xabar
- Backend JSON ni tekshirish (doimiy yozish):
  - GET https://your-json-backend.onrender.com/users oching va yangi foydalanuvchi ko‘rinayotganini tasdiqlang


08) 100% — Troubleshooting va maslahatlar
- Variant A’da ma’lumot saqlanmasligi:
  - Bu serverless muhitning tabiati, demo uchun OK. Doimiy yozish uchun Variant B’dan foydalaning.
- Render’da sekin javob:
  - Free planlarda “cold start” bo‘lishi mumkin. Pro/Hobby rejaga o‘ting.
- CORS xatosi:
  - scripts/index.js serveri “Access-Control-Allow-Origin: *” header’larini yuboradi, shuning uchun odatda muammo bo‘lmaydi. Agar custom domen/strict header sozlash kerak bo‘lsa, Render’da qo‘shimcha sozlashlar kiriting.
- Rewrites ishlamayapti:
  - Vercel Settings → Routing → Rewrites qoidalarini aniq tekshiring.
  - Source yo‘llar aynan /api/users va /api/users/(.*) ekanligiga ishonch hosil qiling.
- Audit (ixtiyoriy):
  - Agar kelajakda haqiqiy ma’lumotlar bo‘lsa, URL yoki query string orqali nozik ma’lumotlarni yubormang. (Vaqt o‘tib Analytics yoki Logs qo‘shsangiz, maxfiylikka e’tibor bering.)


Qo‘shimcha eslatmalar
- Variant B — ishlab chiqarishga yaqin: Frontend Vercel’da, JSON backend Render’da, rewrites orqali bog‘langan. Kodni o‘zgartirmasdan sozlash imkonini beradi.
- Keyinchalik real DB (Supabase/Neon) ga o‘tishni istasangiz, kichik kod o‘zgarishlari bilan Route Handlers orqali BFF yondashuviga o‘tasiz. Hozircha bu roadmap kodni o‘zgartirmaydi.


Qisqa xulosa
- Demo (eng oson): Vercel’da to‘g‘ridan-to‘g‘ri deploy → Ishlaydi, lekin faylga yozish saqlanmasligi mumkin.
- Production-ga yaqin (tavsiya): Backendni Render’da ishga tushiring, Frontendni Vercel’da saqlang, Vercel’da Rewrites orqali /api/users ni backendga yo‘naltiring → data/users.json ga doimiy yozish ta’minlanadi.
```
