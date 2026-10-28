# Integration notes — Member 5

## Keep changes isolated first
Copy this entire `member5-blood-bank` directory under the repository's `backend/` directory. Do not overwrite shared files.

## Route mount (only when team integration is approved)
In shared `backend/src/app.js`, add one import:

```js
import member5HospitalRoutes from "../member5-blood-bank/src/routes/member5.routes.js";
```

Then mount it before `notFound`:

```js
app.use("/api/hospitals", member5HospitalRoutes);
```

Do not make this shared-file edit until the integration owner approves it.

## Endpoints
- `GET /api/hospitals/me/stock?hospitalName=Example Hospital`
- `PATCH /api/hospitals/me/stock/:group?hospitalName=Example Hospital` with JSON body `{"unitsAvailable": 8, "hospitalLocation": "Dhaka"}`
- `GET /api/hospitals/me/requests?hospitalName=Example Hospital`
- `GET /api/hospitals/me/summary?hospitalName=Example Hospital`
- `GET /api/hospitals/staff` (admin only)

All endpoints require a Bearer token except none are public in this module.

## Important security/integration limitation
The shared User model currently has no hospital ID or staff-to-hospital mapping. Until that relationship is added and validated, the hospital name is supplied by query parameter/body. This is suitable only for initial local integration/testing, **not production authorization**: a staff user could try another hospital name. Before production, add a trusted `hospitalId`/membership relation to User (with the team agreeing on the schema) and derive the hospital from `req.user`, never from client input.

Inventory is stored in a separate `Member5BloodStock` collection/model to avoid colliding with other members' models. Existing `BloodRequest` records are read-only here; this module does not change request status or create duplicate request records.
