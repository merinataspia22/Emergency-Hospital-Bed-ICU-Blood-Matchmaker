# BloodConnect Member 1 — Team Handoff

## Shared contracts (fix these before teammates implement their modules)

**Runtime:** Node.js 20.19+; Express 5; MongoDB/Mongoose; ES Modules (`"type":"module"`).

**API prefix:** `/api`; consistent JSON response:

```json
{"success":true,"message":"...","data":{}}
```

Errors:

```json
{"success":false,"message":"..."}
```

**Roles (exact strings):** `donor`, `recipient`, `staff`, `admin`.

**Shared User model:** `src/models/User.model.js` (single source of truth):

- `_id`, `name`, `email`, `passwordHash`, `role`, `phone`, `bloodGroup`, `location`, `lastDonation`, `isActive`, `hospitalId`, timestamps
- `passwordHash` is `select:false`; do not return it in API responses
- `hospitalId` optional now; Member 4/5 will link staff to a real Hospital record
- For richer donor-specific data, Member 2 may create `DonorProfile` with `userId: ObjectId ref User`; do not create another User model

**Auth middleware imports:**

```js
import { requireAuth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

router.get("/private", requireAuth, allowRoles("recipient"), handler);
```

**JWT access:** `Authorization: Bearer <token>`; response from `POST /api/auth/login` has `data.token` and `data.user`. Token contains user ID as `sub` (not a trusted frontend role). `requireAuth` loads current user from MongoDB and checks `isActive`.

**Team split:**

| Member | Own module | Don't overwrite |
|---|---|---|
| 1 | Auth routes/controller/logic/User, Contact routes/controller/logic/ContactMessage, auth middleware | Other team models |
| 2 | Donor profile/search/availability | User auth fields |
| 3 | Blood requests/recipient flow | Shared auth routes |
| 4 | Admin/hospital/bed features, approved admin account provisioning | Member 1 public registration restriction |
| 5 | Blood bank stock, staff workflow, approved staff account provisioning | Shared User model |

**Admin and Staff creation:** Not in Member 1 ZIP. Member 4/5 should implement their own authorized process; do not expose `POST /api/auth/register` for admin/staff.

**Contact inbox integration for Admin Dashboard:** Member 4 can call admin-only `GET /api/contact/messages?page=1&limit=20`. No admin account provisioning is present here.

**Integration caution:** `src/app.js` now mounts `/api/auth` and `/api/contact`. Integration owner should add other team routers without creating a second Express app or another database connection. Keep middleware/error handler ordering correct.

**Backend data is not yet live in React:** Frontend API calls must be connected separately. Ask each member to test HTTP requests with Postman and then test browser Network tab. See `FRONTEND_CONNECTION_BN.md`.


**Reusable rate limits:** Other modules can import `createRateLimiter` from `src/utils/rateLimiter.js` for consistent JSON 429 responses.
