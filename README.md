# 👕 FashionHub Online Clothing Store

## Description

**FashionHub** is a premium, full-stack e-commerce platform designed for modern clothing brands. It features a sleek glassmorphic UI, a robust Node.js backend, and a comprehensive administrative portal for complete store management, from products to categories and orders.

---

## � Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Running Locally](#installation--running-locally)
- [Environment Variables](#environment-variables)
- [Admin Access](#admin-access)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## 🛠️ Technologies

- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MySQL (InnoDB)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Media:** Multer for product image uploads
- **Email:** Nodemailer for contact forms

---

## ✨ Features

### 👤 User Features

- **Premium UI:** Modern, responsive design with glassmorphism, smooth animations, and a premium aesthetic.
- **Product Discovery:** Seamlessly browse by category, search for items, and view high-quality product details.
- **Shopping Experience:** Interactive cart management and clear product specifications (colors, sizes, etc.).
- **Dynamic Content:** Responsive hero carousels and professional promotional video sections.

### 👨‍💼 Admin Features

- **Dashboard:** Real-time overview of store statistics and recent activities.
- **Product Management:** Full CRUD (Create, Read, Update, Delete) for products including multiple colors, sizes, and stock management.
- **Category Management:** Organize the store with custom categories, descriptions, and thumbnails.
- **Store Control:** Full management of user inquiries, orders, and promotional content directly from the panel.

---

## � Project Structure

```text
FashionHub/
├── backend/                # Node.js backend API
│   ├── src/
│   │   ├── config/         # DB and Env configurations
│   │   ├── controllers/    # API Request handlers
│   │   ├── middleware/     # Auth and Upload filters
│   │   ├── routes/         # Express routes
│   │   └── services/       # Business logic (email, etc.)
│   └── server.js           # Server entry point
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Full page views
│   │   └── config/         # API Base configuration
├── clothing_store.sql     # Database schema & initial data
├── Images/                # Reference design assets
├── .gitignore             # Git ignore rules
└── README.md              # Documentation
```

---

## � Installation & Running Locally

### Prerequisites

- Node.js (v16+)
- MySQL Server

### 1. Database Setup

1. Create a new database in MySQL:
   ```sql
   CREATE DATABASE clothing_store;
   ```
2. Import the schema:
   ```bash
   mysql -u root -p clothing_store < clothing_store.sql
   ```

### 2. Backend Setup

1. Navigate to `/backend` and install dependencies:
   ```bash
   npm install
   ```
2. Configure your `.env` file (see [Environment Variables](#environment-variables)).
3. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup

1. Navigate to `/frontend` and install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=clothing_store
JWT_SECRET=your_secure_random_string

# Admin Setup (Defaults)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123
```

---

## 🔑 Admin Access

- **Admin Portal:** `http://localhost:3000/admin/login`
- **Default Credentials:**
  - **Username:** `admin`
  - **Password:** `Admin@123`

> [!TIP]
> If you ever recreate the database and need to quickly reset the admin account, ensure the backend is running and visit:
> `http://localhost:5000/api/setup-admin`

---

## � Troubleshooting

| Issue                          | Solution                                                                        |
| :----------------------------- | :------------------------------------------------------------------------------ |
| **Database Connection Error**  | Verify MySQL is running and credentials in `.env` match.                        |
| **Broken Images**              | Ensure the `backend/uploads` folder exists and contains images.                  |
| **Invalid Token Error**        | Log out of the Admin Panel and log back in to refresh your session.             |
| **White Screen on Categories** | Ensure the backend is running; the frontend needs the API to render categories. |

---

## 👨‍💻 Author

**Pramod Chandima**
_Full-stack Developer | Tech Enthusiast_

---

## 📄 License

This project is for personal use and learning. All rights reserved.

---

_Happy Coding! 🚀_
