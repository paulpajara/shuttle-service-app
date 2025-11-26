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
- area = the part of the project you’re working on (e.g., frontend, backend)
- descriptive-title = short, readable summary (kebab-case), and for end users = endUser + short, readable summary (kebab-case)

**Examples**

- If you're working on the frontend processing for the Passenger page:
```
git checkout -b feature/frontend/passenger-page-processing
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
1. Run this script inside the project root directory of whichever code editor u use
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   **note: this is only temporary and u will need to run it again once you close ur code editor (for safety reasons this is the most secure setup)**
3. Install deps:
   ```
   npm install
   ```
4. Start MongoDB locally or use Atlas.
5. Seed sample users:
   ```
   npm run seed
   ```
   will upload later for backend testing
6. Start server:
   ```
   npm run dev
   ```
   or
   ```
   npm start
   ```
7. Frontend Testing (w/ Expo)
   ```
   npm run exp
   ```
   **important: wont run in expo go due to deprecated native library support**

   to switch to dev build (only once you run npm run expo; the instructions are in the cmd line anyway)
   ```
   s
   ```

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/driver/apply
- GET /api/admin/driver-applications
- POST /api/admin/driver-applications/:id/approve
- GET /api/trips

## TODO
1. Passenger Features **(High Priority)**
1.1 Ride Status Views

 - Add screen to show current ride status (Waiting → Assigned → Boarded → Completed)

 - Listen for ride socket events:
   ```
   ride:booked
   ```
   ```
   ride:boarded 
   ```
   ```
   ride:completed
   ```
 - Update UI state automatically when events are received

1.2 Trip Filtering (Required in Requirements)

 - Add filter UI (time picker / dropdown)

 - Filter /api/trips by:

   - departure time range

   - earliest / latest

   - nearby campus zones (optional)

1.3 Improved Trip Detail Map

 - Add shuttle direction/heading rotation

 - Add recenter button

 - Show distance to next stop

 - Show estimated arrival time countdown (live)

 - Improve marker icons (shuttle icon, stop icons)

1.4 Driver & Shuttle Info

 - Display driver name

 - Display shuttle identifier

 - Display number of passengers boarded / waiting (optional)

2. Driver Features **(High Priority)**
2.1 Passenger List Screen

 - Add screen showing passengers booked for current trip
   ```
   Endpoint: GET /api/rides?tripId=<tripId>

2.2 Boarding Workflow

 - Add UI for “Board Passenger”

 - Call endpoint:
   ```
   PATCH /api/rides/:rideId/board

 - Update local state + emit socket events

2.3 Completing Ride

 - Add UI for “Complete Ride”

 - Call endpoint:
   ```
   PATCH /api/rides/:rideId/complete

 - Handle auto-trip-complete event from backend

2.4 Driver Live Map

 - Add map showing:

   - route path

   - stops

   - driver location

   - passenger pickup points (optional)

3. Admin Dashboard **(Medium Priority)**
3.1 Manage Routes

 - List routes

 - Add/edit/delete routes

 - Add/edit/remove route stops

3.2 Manage Trips

 - View trip schedules

 - Create trip with:

   - route

   - driver

   - departure time

   - Edit/delete trips

3.3 Manage Users

 - View users

 - Edit user role/status

 - Delete user accounts

 - Reset passwords (optional)

4. Notifications UX **(Medium Priority)**
4.1 Foreground Notification Handling

 - Add listener:
   ```
   Notifications.addNotificationReceivedListener

 - Display in-app banner for:

   - shuttle arrival alerts

   - ride completed

4.2 Notification Actions

 - Open Trip Detail or Ride Status screen when notification tapped
   (addNotificationResponseReceivedListener)

4.3 Push Token Refresh Strategy

 - Re-register token on AppState change (already done)

 - Handle Expo “DeviceNotRegistered” errors (backend response)

5. Core App Improvements **(Medium / Low Priority)**
5.1 Loading & Error UI

 - Replace alert() with custom toast/snackbar

 - Add global error boundary

 - Add global loading overlay (context-driven)

5.2 Environment Setup 

 - Support .env files for API URL

 - Dev / Prod build configs

 - Detect local IP automatically when on WiFi (optional)

5.3 Caching & Performance

 - Cache trips locally (AsyncStorage)

 - Cache route static data (stops, names)

 - Reduce map rerenders (memoization + smoother shuttle animation)

6. **Optional** Enhancements

 - Passenger “Next Shuttle” widget

 - Multi-device driver mode (fallback GPS)

 - Animated shuttle movement interpolation

 Offline mode (view cached trips/routes)
 ```
   GET /api/trips/:id/eta
   GET /api/trips/:id/eta-segmented
   POST /api/rides
   GET /api/rides
   POST /api/rides/:id/board
   POST /api/rides/:id/complete
```

**!!!NOTE!: THE BACKEND ALREADY SUPPORTS ALL OF THESE FRONTEND INTEGRATIONS**
