# BloodConnect — Taspia Backend (Member 1)

এটি **শুধু Member 1-এর Backend module**। Node.js + Express.js (ES Modules) + MongoDB/Mongoose ব্যবহার করে বানানো। Mam-এর চাওয়া `routes → controllers → logic → models → MongoDB` flow মেনে চলে; reusable code `utils` এবং security/access `middleware`-এ আছে।

## কী কী আছে

| Module | Method | API URL | Access |
|---|---|---|---|
| Health check | GET | `/api/health` | Public |
| Register | POST | `/api/auth/register` | Public (`donor` বা `recipient` only) |
| Login | POST | `/api/auth/login` | Public (সব existing role) |
| My account | GET | `/api/auth/me` | Bearer token |
| Home Send Message | POST | `/api/contact` | Public |
| Contact Inbox (Admin teammate integration) | GET | `/api/contact/messages?page=1&limit=20` | Admin only |

**Admin/Hospital Staff account create/seed করার code এই ZIP-এ নেই।** ওই account অন্য Member-এর Backend দায়িত্ব। তারা একই `User` model এবং auth API ব্যবহার করবে।

Contact message MongoDB-তে **save** হয়; ইমেইল/SMS পাঠানো হয় না। Admin role থাকলে `/api/contact/messages` থেকে contact data দেখা যায়।

## 1. ZIP কোথায় Extract করবে?

ZIP-এর ভেতরে `backend/` নামে folder আছে। GitHub repository-এর root-এ extract করো, যেন:

```text
Emergency-Hospital-Bed-ICU-Blood-Matchmaker/
├── frontend/              # আগে থেকেই আছে
└── backend/               # এই ZIP-এর folder
    ├── src/
    ├── docs/
    ├── postman/
    ├── tests/
    ├── package.json
    └── .env.example
```

**যদি teammate ইতিমধ্যে `backend` তৈরি করে থাকে, পুরো folder replace করবে না!** নিজের Auth/Contact module-এর fileগুলো তাদের branch-এর সঙ্গে merge করবে। Shared `app.js`, `User.model.js` এবং `db.js` পরিবর্তনের আগে team-এর সঙ্গে coordinate করবে।

## 2. কী লাগবে?

- Node.js **20.19+** (Node 22/24 recommended)
- MongoDB (local MongoDB অথবা MongoDB Atlas)
- GitHub Codespaces / VS Code Terminal
- Postman (API পরীক্ষা করার জন্য)

## 3. Install

Repository root থেকে:

```bash
cd backend
npm install
```

তারপর `.env.example` copy করে `.env` তৈরি করো। Linux/Codespaces-এ:

```bash
cp .env.example .env
```

`.env`-এ `MONGO_URI`, `JWT_SECRET`, `FRONTEND_ORIGINS` ঠিক করো। MongoDB Atlas ব্যবহার করলে Atlas-এর URI গোপন রাখবে; GitHub-এ কখনো commit করবে না।

`JWT_SECRET`-এর জন্য local terminal-এ random string তৈরি করো:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Output string `.env`-এ JWT_SECRET-এর value হিসেবে বসাও। `JWT_SECRET` কমপক্ষে ৩২ character হতে হবে।

**Codespaces:** Codespaces-এর `localhost:27017`-এ MongoDB সাধারণত চালু থাকে না। Atlas connection URI ব্যবহার করা সহজ হতে পারে। Atlas-এ user/password ও network access সঠিকভাবে configure করতে হবে। IP access যতটা সম্ভব সীমিত রাখবে; production database কখনো public করে রেখো না।

## 4. Run

```bash
npm run dev
```

MongoDB-তে সত্যি connect হলে Terminal-এ দেখা যাবে:

```text
MongoDB connected
API listening on http://localhost:5000
```

পরে `http://localhost:5000/api/health` call করো। `data.database` = `connected` হওয়া উচিত।

**Codespaces + desktop Postman:** Laptop-এ Postman থাকলে remote Codespaces-এর `localhost:5000` তোমার Laptop নয়। Ports tab থেকে 5000 port forward করে approved URL ব্যবহার করো, অথবা Codespaces-এর ভিতরের terminal/curl দিয়ে test করো। Private forward রাখার চেষ্টা করো।

## 5. Postman পরীক্ষা

`postman/BloodConnect_Member1.postman_collection.json` Postman-এ Import করো। Collection variable `baseUrl`-এ local হলে `http://localhost:5000`, Codespaces হলে accessible forwarded backend URL দেবে।

**Register request** (POST `/api/auth/register`):

```json
{
  "name": "Test Donor",
  "email": "testdonor@example.com",
  "password": "ExamplePass123!",
  "role": "donor",
  "phone": "01712345678",
  "bloodGroup": "A+",
  "location": "Chattogram",
  "lastDonation": "2025-01-10",
  "terms": true
}
```

Success: `201 Created`. Login-এ একই email/password দেবে। Success: `200 OK` with `data.user.role` + `data.token`. Postman collection successful login-এর পরে token variable save করে, তাই `/api/auth/me` পরীক্ষা সহজ।

**Contact request** (POST `/api/contact`):

```json
{
  "name": "Test Visitor",
  "email": "visitor@example.com",
  "message": "I would like to know how to support blood donors."
}
```

Success: `201 Created`. Contact message database-এ save হবে; email পাঠানো হবে না।

**Admin inbox:** `/api/contact/messages` Admin JWT দিয়ে call করতে হবে। Admin account তৈরির কাজ Member 4-এর; এই module তা তৈরি করে না।

Important negative tests:

- Duplicate email: `409 Conflict`
- `role: "admin"` দিয়ে public register: `400 Bad Request`
- Wrong password: `401 Unauthorized`
- `/api/auth/me` token ছাড়া: `401 Unauthorized`
- Contact message ছোট (12-এর কম): `400 Bad Request`
- Non-admin দিয়ে `/api/contact/messages`: `403 Forbidden` (valid non-admin token থাকলে)

## গুরুত্বপূর্ণ validation notes

- Registration password-এ **কমপক্ষে ৮ character**, একটি letter ও একটি number থাকতে হবে। `bcryptjs`-এর ৭২-byte input limit এড়াতে Backend ৭২ UTF-8 byte-এর বেশি password reject করে। Frontend validation পরে একইভাবে update করবে।
- সব rate-limited API-তে `429` status-এর সঙ্গে একই JSON error format ফেরত আসে। Rate limit logic `src/utils/rateLimiter.js`-এ reusable রাখা হয়েছে (DRY)।
- ZIP-এ `node_modules` বা `.env` নেই, এগুলো নিজস্ব environment-এ তৈরি করতে হবে।

## 6. Automated check

Dependencies install হওয়ার পর:

```bash
npm test
```

Validation tests MongoDB ছাড়াই চলে; HTTP tests database না চালিয়েও invalid data ও unauthorized access পরীক্ষা করে। Real Register/Login/Contact save পরীক্ষা করতে **MongoDB ও Postman লাগবে**।

## 7. React Frontend কি নিজে নিজে connected?

**না।** পুরোনো Frontend-এ demo auth এবং demo contact submit থাকলে সেগুলো backend API call দিয়ে আলাদাভাবে replace করতে হবে। React design বদলানো লাগবে না। `docs/FRONTEND_CONNECTION_BN.md` দেখো।

## 8. Teammate integration

`docs/TEAM_HANDOFF_BN.md`-এ সব imports, shared User fields ও route responsibility লেখা আছে। `src/app.js` shared integration owner maintain করবে। **দুজন আলাদা `User` model বানাবে না।**

## 9. Security notes

- Plain password কখনো database/response-এ রাখা হয় না; `bcryptjs` hash save হয়।
- JWT token short-lived (default 1 hour); JWT logout server-side revoke করে না। Future production release-এ secure HttpOnly cookie/session বা revocation design করা উচিত।
- Rate-limiting আছে; production deployment-এ proxy, logging, monitoring, validation, privacy policy ও stronger anti-spam controls প্রয়োজন।
- Patient medical information এখানে save করার প্রয়োজন নেই। Contact form-এ real sensitive data পাঠাবে না।
- `.env` গোপন রাখবে; `.env.example`-এ secret নেই।

## Mam-এর architecture কোথায়?

`routes/` = endpoints, `controllers/` = thin request/response, `logic/` = business rules, `models/` = schema/password methods/database, `utils/` = DRY validation/response/errors/JWT, `middleware/` = auth/role/errors.
