# Merchant Management System

Angular 20 standalone frontend + Express mock API.

## Requirements
- Node.js 20.19+ (or a version supported by Angular 20)
- npm

## Run the backend
```bash
cd merchant-api
npm install
npm run dev
```
API runs at http://localhost:3000.

Demo accounts (password is `password123`):
- sales@test.com
- reviewer@test.com
- admin@test.com

## Run the frontend
In another terminal:
```bash
cd merchant-frontend
npm install
npm start
```
Open http://localhost:4200.

## Notes
- This is an educational starter implementation with in-memory mock data.
- Backend data resets when the server restarts.
- The mock backend uses demo JWT secrets and simplified refresh-token storage. Do not deploy it as-is.
- Frontend role guards improve navigation UX; backend middleware enforces API authorization.
- Sensitive values are masked in the UI; backend routes enforce role/assignment checks.
- CSP must be configured as an HTTP response header by the production web server. See `merchant-frontend/CSP-EXAMPLE.md`.
