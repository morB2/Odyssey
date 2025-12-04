**Odyssey**

- **Project**: Full-stack social/trip planning application (React + Vite front-end, Express + Node back-end).

**Project Overview**:
- **Client**: A TypeScript React app (Vite) in `Client/` providing UI, authentication, real-time chat, and trip planning features.
- **Server**: An Express-based API in `Server/` implementing auth, file uploads, sockets (Socket.IO), and persistence via MongoDB. Redis is used for caching/real-time features.

**Website Description**:
- Odyssey is a social-first trip planning platform that helps users discover, create, and collaborate on travel experiences.
- Core features:
  - **User accounts & profiles**: Sign up / log in (including Google OAuth), editable profiles with avatars and bio.
  - **Social feed**: Create posts with text and images, follow other users, like and save posts, and explore a personalized feed.
  - **Trip creation & planning**: Create trips with titles, dates, locations, and optional itineraries. Share trips publicly or keep them private.
  - **Search & discovery**: Search trips, users, and posts; filter by destination, date, and tags.
  - **Real-time chat & notifications**: One-on-one and group messaging using Socket.IO, plus live updates for actions like messages and likes.
  - **Media uploads**: Upload images/files (local `uploads/` and Cloudinary integration supported).
  - **Moderation & reporting**: Report content or users; admin tools to review and act on reports.
  - **Internationalization**: UI translations (English, Hebrew) and RTL support for Hebrew.

**Typical user flows**:
- Sign up, complete a profile, and follow other travelers.
- Create a trip, add itinerary items and images, then publish the trip to your feed.
- Discover trips via search or the feed, like/save them, and message the author for more details.
- Report inappropriate content; admins can review reports via server-side tools.

**Repo Structure**:
- **`Client/`**: front-end app (React, TypeScript, MUI, Zustand, Socket.IO client)
- **`Server/`**: back-end API (Express, Mongoose, Socket.IO, Cloudinary integration)

**Prerequisites**:
- **Node.js** 18+ (use a current LTS)
- **npm** (or a compatible package manager)
- **MongoDB** running (Atlas or local)
- **Redis** if you use caching/real-time features (optional for basic run)

**Environment**
Create a `.env` file in `Server/` (don't commit it). Example variables used by the server (from `Server/config/secret.js`):

```
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=mongodb+srv://<user>:<pass>@cluster0/yourdbname
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your_jwt_secret
SALT_ROUNDS=12
GMAIL_USER=your@gmail.com
GMAIL_APP_PASS=app-password
APP_NAME=Odyssey
PORT=3000
```

Add any Cloudinary-related env vars if you configure Cloudinary (see `Server/config/cloudinary.js`).

**Client: Installation & Run**
1. Open a terminal and change to the client folder:

```pwsh
cd Client
npm install
```

2. Run development server (Vite):

```pwsh
npm run dev
```

3. Build for production:

```pwsh
npm run build
```

**Server: Installation & Run**
1. Open a terminal and change to the server folder:

```pwsh
cd Server
npm install
```

2. Create `Server/.env` with the variables from the example above.

3. Start the server:

```pwsh
npm start
# or for live reload during development (nodemon is a devDependency):
npx nodemon app.js
```

4. The server serves uploads at `/uploads` and starts Socket.IO on the same HTTP server.

**Useful Scripts**
- Client (`Client/package.json`):
  - `npm run dev`: Start Vite dev server
  - `npm run build`: Build client
  - `npm run lint`: Run ESLint
  - `npm run preview`: Preview built app
- Server (`Server/package.json`):
  - `npm start`: Start server (`node app.js`)

**Notes & Implementation Details**
- Real-time features use Socket.IO (see `Server/config/socket.js` and `Client` socket hooks).
- Authentication uses JWT (`jsonwebtoken`) and password hashing with `bcrypt`.
-images are uploaded to Cloudinary (see `Server/config/cloudinary.js`).

**Troubleshooting**
- If the client can't reach the API, ensure `FRONTEND_URL` and `DB_CONNECTION` are set correctly and CORS is configured.
- If uploads are failing, check `uploads/` permissions and Cloudinary credentials.

**Contributing**
- Pull requests are welcome. For major changes, open an issue first to discuss.

**License**
- Add a license to the repo as needed (no license included by default).

**Contact**
- For questions about this repo contact the maintainer or open an issue.
