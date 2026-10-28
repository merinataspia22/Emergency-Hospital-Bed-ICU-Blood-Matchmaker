# Member 5 — Blood Bank & Hospital Dashboard

This is an isolated module intended to reduce merge conflicts. It does **not** modify the shared `backend/src/app.js`, shared models, package.json, or authentication middleware.

## Contents
- `src/models/BloodStock.model.js`: inventory model, unique per hospital + blood group.
- `src/controllers/member5.controller.js`: stock dashboard/update, hospital request dashboard, staff listing.
- `src/routes/member5.routes.js`: route definitions expecting the shared `protect` and `authorizeRoles` middleware.
- `docs/INTEGRATION.md`: integration steps and important limitations.

## Current assumptions
- Shared backend is ES modules and uses Mongoose.
- Shared auth middleware exports `protect` and `authorizeRoles` from `backend/src/middleware/auth.middleware.js`.
- Existing `BloodRequest` model is `backend/src/models/BloodRequest.js` and has `hospitalName`, `hospitalLocation`, `bloodGroup`, `units`, `status`, and timestamps.
- `User` model has `name`, `email`, `phone`, and `role`.

This module is a starting implementation. Hospital ownership is not represented in the current shared User model, so routes use a required `hospitalName` query parameter for the dashboard and must be tightened with a real staff-to-hospital relationship before production. Only admin can list staff. Do not expose staff data publicly.
