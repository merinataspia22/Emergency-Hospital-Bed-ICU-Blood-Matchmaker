# Integration notes: Member 5

## 1. Folder
This folder lives at `backend/member5-blood-bank/`. It uses the backend's `.env`, `node_modules`, `protect`, `authorizeRoles` and `ApiError`. No separate `.env` or `package.json` needed.

## 2. Mount (2 lines in `backend/src/app.js`)
Add with the other imports:
```js
import member5Routes from "../member5-blood-bank/src/routes/member5.routes.js";
```
Add with the other `app.use(...)` lines (before `notFound`):
```js
app.use("/api/bloodbank", member5Routes);
```
(`/api/hospitals` is NOT used here: it is reserved for the public hospital list used by the Hospital Beds page.)

## 3. Create the staff account
```
cd backend
node member5-blood-bank/src/scripts/seedStaff.js
```
Default login: `staff@bloodconnect.test` / `Staff@12345678` (override with STAFF_EMAIL / STAFF_PASSWORD).
It also creates the staff-to-hospital link (`Member5StaffProfile`) and starter stock.

## 4. Endpoints (all need `Authorization: Bearer <token>`, role staff/admin)
- `GET   /api/bloodbank/me/stock`
- `PATCH /api/bloodbank/me/stock/:group`   body `{ "unitsAvailable": 8 }`
- `GET   /api/bloodbank/me/requests?status=Pending`
- `GET   /api/bloodbank/me/summary`
- `GET   /api/bloodbank/staff` (admin only)

The hospital always comes from the logged-in user's `StaffProfile`, never from the client.

## 5. Important
`BloodRequest.hospitalName` / `hospitalLocation` must match `StaffProfile` values exactly (same spelling), otherwise the staff will not see those requests.
Admin users have no `StaffProfile`, so `/me/*` returns 403 for them; only `/staff` works for admin.
