# Shuttle Backend (Express + MongoDB + Socket.IO)

## Setup
1. Copy `.env.example` to `.env` and fill values (MONGO_URI, JWT_SECRET).
2. Install deps:
   ```
   npm install
   ```
3. Start MongoDB locally or use Atlas.
<!-- 4. Seed sample users:
   ```
   npm run seed
   ``` -->
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

## Socket.IO
Connect to the same origin and emit:
- join room: { room: "trip:<id>" } or room: "admin:notifications" or "passenger:<id>"
- shuttle:update: { tripScheduleId, routeId, shuttleId, lat, lng, speed }



# New endpoints added
- POST /api/telemetry
- GET /api/driver/assignments
- PATCH /api/driver/assignments/:tripId/start
- Routes CRUD under /api/routes (admin)
- Trips CRUD under /api/trips-admin (admin)
- Admin user management under /api/admin/users (admin)
- Telemetry POST is authenticated and mirrors socket telemetry logic


# Push Notifications (Expo)
- POST /api/notifications/register (authenticated) -> { token }
- registers Expo push tokens for passengers and drivers.
- Server will send push notifications (via Expo) for arrival alerts and trip completion.
