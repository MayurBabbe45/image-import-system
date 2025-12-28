# 🚀 ImageImportPro - Bulk Image Processing System

**A robust full-stack application designed to handle high-volume image migrations from Google Drive to Cloudinary using asynchronous background workers.**

![alt text](image.png)


---

## 📖 Overview

Uploading large batches of high-resolution images can crash standard web servers due to timeouts. **ImageImportPro** solves this by decoupling the "Upload Request" from the "Processing Logic."

When a user submits a Google Drive folder, the API instantly acknowledges the request and offloads the heavy lifting to a **Background Worker** via a **Redis Queue**. This ensures the UI remains responsive while thousands of images are processed, optimized, and stored securely in the cloud.

### ✨ Key Features

* **📂 Bulk Import:** Ingests images directly from public Google Drive folders.
* **⚡ Asynchronous Processing:** Uses **BullMQ (Redis)** to handle jobs in the background without blocking the main thread.
* **📊 Real-Time Progress:** Live progress bars powered by polling/webhooks to keep the user informed.
* **☁️ Cloud Storage:** Optimizes and stores assets in **Cloudinary**.
* **🗄️ Relational Data:** Metadata (size, format, URLs) stored in **PostgreSQL**.
* **🗑️ Management:** View, filter, and delete imported images instantly.

---

## 🛠️ Tech Stack

### **Frontend**

* **React.js (Vite)**
* **Tailwind CSS**
* **Axios** (API Communication)

### **Backend (Microservices)**

* **Node.js & Express**
* **BullMQ (Redis/Valkey)** - Job Queues
* **Google Drive API v3** - Source integration
* **Cloudinary SDK** - Destination storage

### **Database & DevOps**

* **PostgreSQL**
* **Render Cloud** (Hosting)
* **Docker** (Optional for local dev)

---

## 🏗️ Architecture

The system follows a **Producer-Consumer** pattern to ensure scalability.

![alt text](image-1.png)

---

## 🚀 Getting Started Locally

Follow these steps to run the complete system on your machine.

### Prerequisites

* Node.js (v18+)
* PostgreSQL (Local or Cloud URL)
* Redis (Local or Cloud URL)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/image-import-system.git
cd image-import-system

```

### 2. Environment Setup

Create a `.env` file in **both** `api-service` and `worker-service` folders:

```env
# Shared Configuration
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgres://user:pass@localhost:5432/image_db

# Queue (Redis)
REDIS_URL=redis://localhost:6379

# Cloud Services
GOOGLE_API_KEY=your_google_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

```

### 3. Install Dependencies

You need to install packages for the API, Worker, and Frontend.

```bash
# API Service
cd api-service && npm install

# Worker Service
cd ../worker-service && npm install

# Frontend
cd ../frontend && npm install

```

### 4. Initialize Database

Run the setup script to create the necessary tables (`images`, `import_jobs`).

```bash
cd api-service
node scripts/setup-db.js

```

### 5. Run the System

You need 3 terminals running simultaneously:

**Terminal 1 (API):**

```bash
cd api-service && npm run dev

```

**Terminal 2 (Worker):**

```bash
cd worker-service && npm run dev

```

**Terminal 3 (Frontend):**

```bash
cd frontend && npm run dev

```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/import` | Accepts a Google Drive Folder URL and starts a job. |
| `GET` | `/api/import/:id` | Returns the status (0-100%) of a specific job. |
| `GET` | `/api/images` | Fetches a paginated list of all imported images. |
| `DELETE` | `/api/images/:id` | Deletes an image from DB and Cloudinary. |

---

## 🧠 Challenges & Solutions

* **Redis Connection in Production:**
* *Challenge:* Localhost Redis works differently than Cloud Redis (Render/Valkey) regarding TLS/SSL connections.
* *Solution:* Implemented logic to strictly use `rediss://` (secure) protocols in production while allowing standard connections locally.


* **Database Schema Drift:**
* *Challenge:* The worker code expected columns (`folder_id`) that the initial database script didn't create.
* *Solution:* Wrote a dedicated `fix-db.js` migration script to align the PostgreSQL schema with the application logic without data loss.



---

