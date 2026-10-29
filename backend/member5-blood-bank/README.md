# Member 5 — Blood Bank & Hospital Dashboard

This is an isolated module intended to reduce merge conflicts. It does **not** modify the shared `backend/src/app.js`, shared models, package.json, or authentication middleware.

## Contents
- `src/models/BloodStock.model.js`: inventory model, unique per hospital + blood group.
- `src/controllers/member5.controller.js`: stock dashboard/update, hospital request dashboard, staff listing.
- `src/routes/member5.routes.js`: route definitions expecting the shared `protect` and `authorizeRoles` middleware.
- `src/models/StaffProfile.model.js`: links a staff user to their hospital.
- `src/scripts/seedStaff.js`: creates a demo staff account, hospital link and starter stock.
- `docs/INTEGRATION.md`: mount steps and endpoints.

## Current assumptions
- Shared backend is ES modules and uses Mongoose.
- Auth middleware (`protect`, `authorizeRoles`) comes from `backend/src/middleware/auth.middleware.js`.
- `BloodRequest` has `hospitalName`, `hospitalLocation`, `bloodGroup`, `units`, `status`.
- Hospital ownership is stored in this module's `StaffProfile` (shared `User` model is untouched). The hospital is derived from the logged-in user, never from client input.
