WorkSpace Pro - Real-time Collaboration Platform
WorkSpace Pro is a full-stack, real-time collaboration platform designed for teams. It features a modern frontend built with React and a robust backend powered by Node.js, Express, and MongoDB. The platform supports concurrent document editing, workspace management, role-based access control, and more, all facilitated by WebSockets.

✨ Features
Real-time Document Editing: Multiple users can edit the same document simultaneously, with changes broadcasted instantly.
Workspace Management: Organize documents and teams into separate workspaces.
User Authentication: Secure user registration and login using JWT (Access + Refresh tokens).
Role-Based Access Control (RBAC): Assign roles (Owner, Editor, Reader) to users within a workspace.
Full-Text Search: Quickly find documents across workspaces with relevance-based scoring.
File Uploads: Attach images and other files to documents.
Background Jobs: Asynchronous tasks like sending email invitations are handled by a Bull queue.
Dockerized Environment: Fully containerized for easy setup and consistent development/production environments.
🏗️ Architecture
The application is a monorepo with a decoupled frontend and backend. The backend exposes a RESTful API for standard CRUD operations and a WebSocket server for real-time events. The frontend is a single-page application (SPA) built with React.

text

+------------------+           +------------------+
|                  |           |                  |
|  React Frontend  | <------>  |   NGINX Server   |
| (localhost:3000) |           | (Docker - Prod)  |
|                  |           |                  |
+------------------+           +------------------+
        |                               |
        | REST (HTTP/S) & WebSocket     | REST & WebSocket
        |                               |
        v                               v
+--------------------------------------------------+
|                                                  |
|  Node.js Backend (Express + Socket.IO)           |
|  (localhost:5000 / Docker)                       |
|                                                  |
|  +----------------+   +------------------------+ |
|  |  RESTful API   |   |  WebSocket Server      | |
|  | (Auth, Docs,  |   | (Real-time events,    | |
|  | Workspaces)   |   | OT/CRDT, Cursors)      | |
|  +----------------+   +------------------------+ |
|                                                  |
+--------------------------------------------------+
        |                 |                  |
        v                 v                  v
+--------------+   +-------------+   +---------------+
|              |   |             |   |               |
|  MongoDB     |   |    Redis    |   | File Storage  |
| (Database)   |   | (Bull Queue)|   |  (Uploads)    |
|              |   |             |   |               |
+--------------+   +-------------+   +---------------+
🚀 Getting Started
Prerequisites
Node.js (v18.x or later)
npm
Docker & Docker Compose
MongoDB (if running locally without Docker)
Redis (if running locally without Docker)
📦 Setup & Run (Docker - Recommended)
This is the easiest way to get the full stack (frontend, backend, database, queue) running locally.

Clone the repository:

Bash

git clone https://github.com/bpdtaran/collab-platform
cd collab-platform
Create Environment Files:
Create a .env file in the backend directory by copying the example:

Bash

cp backend/.env.example backend/.env
Create a .env file in the frontend directory:

Bash

cp frontend/.env.example frontend/.env
Note: The default values in the .env.example files are already configured for Docker.

Build and run the containers:
From the root directory (collab-platform), run:

Bash

docker-compose up --build
Access the application:

Frontend: http://localhost:3000
Backend API: http://localhost:5000/api/health
🛠️ Setup & Run (Local - Without Docker)
If you prefer to run the services directly on your machine.

Clone the repository and install dependencies:

Bash

git clone https://github.com/your-username/collab-platform.git
cd collab-platform

# Install backend dependencies
cd backend
npm install
cp .env.example .env # Edit MONGODB_URI to point to your local instance

# Install frontend dependencies
cd ../frontend
npm install
cp .env.example .env # The default API URL should work
Start your database and queue:
Make sure your local MongoDB and Redis servers are running.

Start the backend server:
In a new terminal, from the backend directory:

Bash

npm run dev
The server will be available at http://localhost:5000.

Start the frontend development server:
In another terminal, from the frontend directory:

Bash

npm start
The application will be available at http://localhost:3000.

⚙️ Environment Variables
Backend (backend/.env)
Variable	Description	Default (for Docker)
PORT	The port the backend server will run on.	5000
NODE_ENV	Application environment.	development
MONGODB_URI	Connection string for the MongoDB database.	mongodb://mongo:27017/collab-platform
ACCESS_TOKEN_SECRET	Secret key for signing JWT access tokens.	your_dev_access_secret ( Change in prod! )
REFRESH_TOKEN_SECRET	Secret key for signing JWT refresh tokens.	your_dev_refresh_secret ( Change in prod! )
FRONTEND_URL	The URL of the frontend application for CORS configuration.	http://localhost:3000
REDIS_HOST	Hostname for the Redis server used by Bull queue.	redis
REDIS_PORT	Port for the Redis server.	6379
Frontend (frontend/.env)
Variable	Description	Default (for Docker & Local)
REACT_APP_API_URL	The base URL for the backend RESTful API.	http://localhost:5000/api
REACT_APP_SOCKET_URL	The base URL for the backend WebSocket server.	http://localhost:5000