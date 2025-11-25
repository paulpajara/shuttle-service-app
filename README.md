## Dev Notes !IMPORTANT:
1. Be familiar with git conventions, DO NOT BATCH COMMIT (if this happens i will rollback your commit and make you recommit)
- for commits/changes that do not affect app functionality (e.g updating README.md or moving files from folders)
```
git commit -m "chore: <commit-message>"
```
- for commits/changes that affect app functionality (i.e adding new features)
```
git commit -m "feat: <commit-message>"
```
- for commits/changes that target bug fixes within the app
```
git commit -m "bugfix: <commit-message>" or git commit -m "fix: <commit-message>"
```
- for commits/changes that refactor code logic
```
git commit -m "refactor: <commit-message>"
```
- for commits/changes that add test files
```
git commit -m "test: <commit-message>"
```
- for commits/changes that change frontend styles / simply making aesthetic changes
```
git commit -m "style: <commit-message>"
```

**BE FAMILIAR WITH THESE COMMIT MESSAGES SO AS TO MAKE IT EASIER TO TRACK DEVELOPMENT**

2. Work on your own branches and name them specifically
- Use descriptive branch names
- Create a new branch every time you work on a specific task.

Follow this format:
```
git checkout -b <type>/<area>/<descriptive-title>
```

Where:
- type = feature, bugfix, chore, style, refactor, etc.
- area = the part of the project you’re working on (e.g., frontend, backend, passenger, driver, auth)
- descriptive-title = short, readable summary (kebab-case)

**Examples**

- If you're working on the frontend processing for the Passenger page:
```
git checkout -b feature/frontend/passenger/page-processing
```
b. The branch type must match the change you are working on

- Your root branch type should reflect the nature of your work:
```
New feature → feature/...
```
```
Fixing a bug → bugfix/...
```
```
Maintenance or cleanup → chore/...
```
```
UI/UX formatting only → style/...
```
```
Logic rewrites (no new behavior) → refactor/...
```

**More Specific Examples**

- Adding new backend API endpoint:
```
git checkout -b feature/backend/api-add-booking
```

- Fixing a crash in login:
```
git checkout -b bugfix/frontend/login-crash
```

- Cleaning unused imports:
```
git checkout -b chore/remove-unused-imports
```

## Setup
1. Copy `.env.example` to `.env` and fill values (MONGO_URI, JWT_SECRET).
2. Install deps:
   ```
   npm install
   ```
3. Start MongoDB locally or use Atlas.
4. Seed sample users:
   ```
   npm run seed
   ```
   will upload later for backend testing
5. Start server:
   ```
   npm run dev
   ```
   or
   ```
   npm start
   ```

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/driver/apply
- GET /api/admin/driver-applications
- POST /api/admin/driver-applications/:id/approve
- GET /api/trips
- GET /api/trips/:id/eta
- GET /api/trips/:id/eta-segmented
- POST /api/rides
- GET /api/rides
- POST /api/rides/:id/board
- POST /api/rides/:id/complete