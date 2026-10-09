# LifeLink — Registration Page (HTML/CSS/JS)

## Open in VS Code
1. Extract the ZIP.
2. Open the extracted `lifelink-register` folder in VS Code.
3. Open `index.html` and right-click **Open with Live Server**.
4. Do not move `index.html` into `css` or `js`.

## Folder layout
```
lifelink-register/
├── index.html
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── form.css
│   └── responsive.css
└── js/
    ├── validation.js
    └── register.js
```

## What works
- Register / Log in tabs
- Patient, Donor, and Hospital role selection
- Role-specific form fields
- Bangladeshi mobile number, email, and password validation
- Last donated date cannot be in the future
- Mobile, tablet, and desktop layouts

## Important
This is a FRONTEND prototype based on the supplied Figma screenshot.
No user data is sent to or stored on a server. Registration and login
need a backend/database for real authentication. JWT, bcrypt, and access
control are interface labels only until backend implementation.

The HTML, CSS, and JS files are each shorter than 100 lines.
