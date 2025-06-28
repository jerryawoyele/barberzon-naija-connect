# How to Run Barberzon Naija Connect

## Quick Start (Both Servers)

To run both the backend and frontend servers simultaneously:

```bash
npm run dev:full
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:8080

## Individual Servers

### Backend Only
```bash
cd backend
npm start
```
Server runs on: http://localhost:5000

### Frontend Only
```bash
npm run dev
```
Server runs on: http://localhost:8080 (or next available port)

## Important Notes

1. **Both servers must be running** for the app to work properly
2. The frontend proxies API calls to the backend via `/api/*`
3. Make sure no other services are using ports 5000 or 8080

## Testing the Application

1. Open browser to http://localhost:8080
2. Navigate to different pages to test functionality:
   - Home page with barber listings
   - Booking flow
   - User authentication
   - Wallet management

## Database

The backend uses SQLite with Prisma ORM. The database file is automatically created in the backend directory.

## Troubleshooting

### API Errors (500 Internal Server Error)
- Make sure backend server is running on port 5000
- Check that both servers are running simultaneously
- Verify no port conflicts

### CORS Issues
- Frontend should be running on port 8080 for proxy to work
- If frontend runs on different port, update vite.config.ts proxy settings

### Build Issues
- Run `npm install` in both root and backend directories
- Ensure all dependencies are installed
- Check that TypeScript compilation succeeds with `npm run build`
