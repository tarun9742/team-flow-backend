# TeamFlow Backend

## What is this?

TeamFlow Backend is a powerful API built for managing teams, projects, and tasks. It's designed to help teams collaborate smoothly with features like real-time messaging, user authentication, and role-based access. Whether you're building a team management app or integrating backend services, this API makes it easy to handle everything from user logins to project tracking.

## Key Features

- **User Authentication**: Secure login and registration using JWT tokens and Firebase integration.
- **Role-Based Access**: Different permissions for Admins, Managers, and regular users to control what people can do.
- **Team Management**: Create and manage teams, assign members, and organize your group.
- **Project & Task Handling**: Set up projects, break them into tasks, and track progress.
- **Real-Time Messaging**: Chat within teams using Socket.IO for instant communication.
- **Database Integration**: Uses MongoDB to store all your data reliably.

## Tech Stack

This project is built with modern tools to keep things fast and scalable:
- **Node.js** and **TypeScript** for the core server.
- **Express.js** for handling API requests.
- **MongoDB** with **Mongoose** for the database.
- **Socket.IO** for real-time features.
- **Firebase Admin** for additional authentication and services.
- **JWT** for secure token-based auth.
- Other helpers like **bcryptjs** for password hashing, **cors** for cross-origin requests, and **helmet** for security.

## Getting Started

Follow these simple steps to get the backend running on your machine.

### Prerequisites
- Make sure you have Node.js (version 14 or higher) installed.
- You'll need a MongoDB database (local or cloud like MongoDB Atlas).
- Set up a Firebase project and download the service account key.

### Installation
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd teamflow-backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key-for-jwt
   PORT=5000
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```
   (You'll need to add your Firebase service account details too – check the `firebase-service-account.json` file.)

4. **Run the application**:
   - For development: `npm run dev`
   - To build and start in production: `npm run build && npm start`

The server will start on `http://localhost:5000` (or whatever port you set).

## How to Use

Once running, you can interact with the API using tools like Postman or your frontend app. Here are the main endpoints:

- **Authentication** (`/api/auth`):
  - `POST /api/auth/login` – Log in a user.
  - `POST /api/auth/create-user` – Create a new user (Admin only).
  - `GET /api/auth/me` – Get current user info.

- **Teams** (`/api/teams`):
  - Manage team creation, updates, and member assignments.

- **Users** (`/api/users`):
  - Handle user profiles and permissions.

- **Projects** (`/api/projects`):
  - Create, update, and track projects.

- **Tasks** (`/api/tasks`):
  - Manage tasks within projects.

- **Messages** (`/api/messages`):
  - Send and retrieve messages, with real-time updates via Socket.IO.

For real-time messaging, connect to the Socket.IO server and join team rooms.

## Project Structure

Here's a quick overview of the codebase:
- `src/server.ts` – Main server file.
- `src/routes/` – API route definitions.
- `src/controllers/` – Business logic for each feature.
- `src/models/` – Database schemas (User, Team, Project, etc.).
- `src/middleware/` – Auth and role-checking middleware.
- `src/socket/` – Socket.IO setup for real-time features.
- `src/config/` – Configuration files (e.g., Firebase setup).

## Contributing

We welcome contributions! If you want to add features, fix bugs, or improve docs:
1. Fork the repo.
2. Create a new branch for your changes.
3. Make your updates and test them.
4. Submit a pull request with a clear description.

Please follow the existing code style and add tests if possible.

## License

This project is licensed under the ISC License. Feel free to use it for your own projects.

## Need Help?

If you run into issues or have questions, check the code comments or open an issue on GitHub. Happy coding!
