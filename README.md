# WorkSpace Pro - Real-time Collaboration Platform

<div align="center">

[![Build Status](https://img.shields.io/github/actions/workflow/status/bpdtaran/collab-platform/ci.yml?branch=main&style=for-the-badge)](https://github.com/bpdtaran/collab-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

**WorkSpace Pro** is a full-stack, real-time collaboration platform designed for modern teams. It features a responsive frontend built with **React & Material-UI** and a robust backend powered by **Node.js, Express, and MongoDB**. The platform supports concurrent document editing, workspace management with role-based access, full-text search, and more, all facilitated by **Socket.IO** for a seamless, live experience.

---

## ✨ Key Features

-   **🚀 Real-time Document Editing**: Multiple users can edit the same document simultaneously, with changes and cursors broadcasted instantly.
-   **🗂️ Workspace Management**: Organize documents and teams into separate, secure workspaces.
-   **🔐 Secure Authentication**: Robust user registration and login using JWT (Access + Refresh Token flow) with `bcryptjs` hashing.
-   **👥 Role-Based Access Control (RBAC)**: Assign roles (`Owner`, `Editor`, `Reader`) to users within each workspace to manage permissions.
-   **🔍 Full-Text Search**: Quickly find documents across workspaces with relevance-based scoring using MongoDB's native text indexes.
-   **📎 File Uploads**: Attach images to documents with size and MIME type validation, served from the backend.
-   **Background Jobs**: Asynchronous tasks like sending email invitations are handled efficiently by a **BullMQ** queue with Redis.
-   **🐳 Dockerized Environment**: Fully containerized for one-command setup and consistent development/production environments.

---

## 🛠️ Tech Stack

| Category      | Technology                                                                                                                                                             |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=react-router) ![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?logo=mui) ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios) |
| **Backend**   | ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs) ![Express](https://img.shields.io/badge/Express-000000?logo=express) ![Socket.IO](https://img.shields.io/badge/Socket.io-010101?logo=socketdotio) ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens)             |
| **Database**  | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb)                                                                                                    |
| **Queue**     | ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis) ![BullMQ](https://img.shields.io/badge/BullMQ-D12A18?logo=bull)                                            |
| **DevOps**    | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker) ![Nginx](https://img.shields.io/badge/NGINX-009639?logo=nginx) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions) |

---

## 🏗️ Architecture

The application follows a decoupled monorepo structure. The backend exposes a RESTful API and a WebSocket server, while the React frontend consumes these services.

```mermaid
graph TD
    subgraph User Endpoints
        A[Browser <br> React SPA]
    end

    subgraph Infrastructure
        B[NGINX <br> (Reverse Proxy)]
    end
    
    subgraph Application Layer
        C[Backend API <br> (Node.js/Express)]
        D[WebSocket Server <br> (Socket.IO)]
    end

    subgraph Data & Services
        E[MongoDB <br> (Database)]
        F[Redis <br> (Queue/Cache)]
        G[File Storage <br> (Local/S3)]
    end

    A -- HTTP/S --> B
    B -- Proxy Pass --> C
    A -- WebSocket --> D
    C --- E
    C --- F
    C --- G
    D --- E
    D --- F

    style A fill:#cde4ff,stroke:#333,stroke-width:2px
    style B fill:#e6ffcc,stroke:#333,stroke-width:2px
    style C fill:#d2ffd2,stroke:#333,stroke-width:2px
    style D fill:#d2ffd2,stroke:#333,stroke-width:2px