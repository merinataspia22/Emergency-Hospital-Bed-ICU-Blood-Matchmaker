# Connecting existing React pages (later step)

এই ZIP **Frontend code replace করে না**। তোমার আগের Home/Login/Registration design অক্ষত থাকবে। Backend Postman-এ কাজ করার পর frontend integration করবে।

## Proposed frontend API calls

| Existing UI | API to call | Body keys |
|---|---|---|
| RegistrationForm.jsx | `POST /api/auth/register` | `name,email,password,phone,role,bloodGroup,location,lastDonation,terms` |
| LoginForm.jsx | `POST /api/auth/login` | `email,password` |
| Home ContactPreview.jsx | `POST /api/contact` | `name,email,message` |
| Current profile | `GET /api/auth/me` | `Authorization: Bearer <token>` |

**Important:** DemoAuth localStorage accounts and MongoDB real accounts are different. When switching to backend auth, `AuthContext.jsx` should call these APIs and preserve the existing role-based redirect:

- `donor` → `/donor-dashboard`
- `recipient` → `/recipient-dashboard`
- `staff` → `/bloodbank-dashboard`
- `admin` → `/admin-dashboard`

The backend does **not** create Admin/Staff accounts, but the shared login works for those roles after team members provision them.

## Fetch example (browser; illustration)

```js
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});
const payload = await response.json();
if (!response.ok) throw new Error(payload.message || "Login failed");
const { user, token } = payload.data;
```

Store tokens with an appropriate security design; this example does not prescribe a production token-storage mechanism. Later replace frontend mock session code and implement authenticated requests consistently.

## Local Vite proxy option (recommended in development)

In `frontend/vite.config.js`, integrate a `server.proxy` option, preserving its existing plugins/options:

```js
server: {
  proxy: { "/api": "http://localhost:5000" }
}
```

Then React calls `/api/...` (relative URLs). Codespaces frontend preview routes `/api` to backend on port 5000. If you instead directly call a forwarded backend URL, configure CORS `FRONTEND_ORIGINS` to allow the exact frontend origin.

**Do not replace the entire Vite config blindly.** Keep team settings intact.

## Contact note

The old `ContactPreview.jsx` uses demo success text and does not call an API. After connecting:

- Send `{name,email,message}` to `POST /api/contact`
- Show success only when HTTP status is `201`
- Show backend validation messages on error
- Disable double submit while the request is pending
- Replace the stale “Demo form. No message is sent.” caption

Contact messages are saved to MongoDB only. Email notifications are **not** part of this ZIP.
