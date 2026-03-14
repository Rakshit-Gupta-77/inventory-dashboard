# CoreInventory – Inventory Management System Dashboard

This project is developed for **Odoo x Indus University Hackathon 2026**.

CoreInventory is a modular Inventory Management System (IMS) that digitizes and simplifies stock operations inside a business. It replaces manual registers and Excel sheets with a modern real-time dashboard.

---

## 🚀 Features

*   📊 **Dashboard with KPIs**: Real-time stats for Total Products, Low Stock, Pending Receipts/Deliveries, and Transfers.
*   📦 **Product Management**: Full CRUD for products with SKU, category, and UoM tracking.
*   📥 **Receipts (Incoming Stock)**: Process vendor shipments and automatically update stock levels.
*   📤 **Delivery Orders (Outgoing Stock)**: Manage customer shipments with automatic stock deduction and availability checks.
*   🔄 **Internal Transfers**: Move stock between different warehouse locations (e.g., Main Store → Production).
*   🏭 **Multi-Warehouse Support**: Manage inventory across multiple warehouses and specific locations.
*   ⚠ **Low Stock Alerts**: Visual pulsing alerts and dedicated dashboard section for items below minimum stock.
*   📜 **Move History Log**: A comprehensive audit trail (ledger) recording every single stock movement.
*   🔍 **Smart Filters**: Filter by Warehouse, Category, or Status, and robust search by Product Name or SKU.

---

## 🛠 Tech Stack

### Frontend
*   **React** (Vite)
*   **Tailwind CSS** (Styling)
*   **Shadcn UI** (Components)
*   **Framer Motion** (Animations)
*   **React Query** (State & Data Fetching)

### Backend
*   **Node.js & Express** (Server)
*   **SQLite** (Database via `better-sqlite3`)
*   **JWT & Bcrypt** (Authentication & Security)

---

## ▶ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)

### 1. Setup Backend
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Start the backend server:
```bash
node index.js
```
*The backend will run on `http://localhost:5001`. On the first run, it will automatically create `inventory.db` and seed it with initial data.*

### 2. Setup Frontend
Open a new terminal window in the root directory and install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
*The dashboard will run on `http://localhost:8084` (or the port specified in your terminal).*

---

## 🔑 Default Credentials

To explore the dashboard immediately, use the following admin account:

*   **Email**: `admin@example.com`
*   **Password**: `admin123`

---

## 📁 Project Structure
*   `/src`: Frontend React application code.
*   `/server`: Backend Express server and SQLite database logic.
*   `/server/db.js`: Database schema and automatic seeding script.
