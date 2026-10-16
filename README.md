# Agri to Harvest 🌱
### *"Turning Vegetable Waste into Farming Wealth"*

**Agri to Harvest** is a full-stack sustainable agriculture and municipal organic waste management platform built for a college **Design Thinking and Innovation (DTI)** project. It creates a closed-loop circular economy connecting three core stakeholders:

1. **Vegetable Shopkeepers & Rythu Bazars** – List unused, excess, and biodegradable vegetable market waste instead of dumping it in municipal landfills.
2. **Scientific Compost Producers** – Collect vegetable waste in sealed containers, process it through controlled biological decomposition (vermicomposting, aerobic windrows, Bokashi), and package verified organic humus.
3. **Farmers** – Browse and purchase certified organic compost, bio-fertilizers, and soil conditioners to revitalize depleted soils and reduce synthetic chemical inputs.
4. **Platform Administrator** – Oversee users, monitor collections, investigate complaints, track circular efficiency, and export CSV compliance logs.

---

## 🔄 Complete Circular Process Flow

```
+------------------------------------+
| 1. Vegetable Waste Listing         | -> Shopkeeper logs excess cuts, trimmings, peels & surplus produce
+------------------------------------+
                  |
                  v
+------------------------------------+
| 2. Waste Collection Reservation    | -> Producer reserves available quantity (concurrency-safe)
+------------------------------------+
                  |
                  v
+------------------------------------+
| 3. Controlled Pickup & Handover    | -> Shopkeeper accepts; producer dispatches crates & logs actual kg
+------------------------------------+
                  |
                  v
+------------------------------------+
| 4. Scientific Compost Production   | -> Producer logs batch (NPK ratio, moisture, pH, loss shrinkage)
+------------------------------------+
                  |
                  v
+------------------------------------+
| 5. Organic Product Marketplace     | -> Finished compost published with verified lab test notes
+------------------------------------+
                  |
                  v
+------------------------------------+
| 6. Farmer Purchase & Delivery      | -> Farmer adds to cart, selects delivery/pickup, checks out (demo UPI/Card)
+------------------------------------+
                  |
                  v
+------------------------------------+
| 7. Soil Health & Order Receipt     | -> Order lifecycle tracking, printable PDF invoice, farmer reviews
+------------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MySQL 8.0+ / Embedded SQLite (zero-config auto-fallback) |
| **Security** | Role-Based Access Control (RBAC), bcryptjs (salt=10), JWT tokens |
| **Geospatial** | Interactive SVG & OpenStreetMap geospatial node visualizer |
| **Fulfillment** | Multi-channel delivery calculation, simulated demo sandbox payment |
| **Localization** | Bilingual toggle: **English** and **Telugu (తెలుగు)** |

---

## 🔑 Demonstration Accounts & Credentials

The application includes a convenient **⚡ 1-Click Role Switcher** in the top navigation bar so evaluators can switch into any persona instantly with one click. You can also log in manually using the following credentials:

| Role | Name & Entity | Demo Email | Password |
|---|---|---|---|
| **Vegetable Shopkeeper** | Ramesh Babu (Rythu Bazar Stall #14) | `ramesh.veggies@gmail.com` | `password123` |
| **Compost Producer** | Suresh Reddy (GreenSoil Bio-Organics) | `suresh.compost@gmail.com` | `password123` |
| **Farmer** | Venkat Rao (Chevella Organic Farm) | `venkat.farmer@gmail.com` | `password123` |
| **System Admin** | AgriAdmin (Innovation Center) | `admin@agritoharvest.org` | `admin123` |

---

## 🚀 Quick Start Instructions

### Option 1: 1-Click Launch on Windows
Double-click `start.bat` in the project root directory. It will start both the backend server and the frontend client in separate terminal windows.

### Option 2: Manual Terminal Startup

#### 1. Backend Server
```bash
cd server
npm install
npm start
```
The server will run at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

#### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 🗄️ Database Configuration & Dual-Driver Support

The application is configured to run out-of-the-box with **zero database configuration required**:
- If you have MySQL 8.0 running locally with a password, open `server/.env` and provide your credentials (`DB_PASSWORD=your_password`).
- If MySQL is unconfigured or unavailable, the backend automatically uses embedded SQLite (`server/agri_to_harvest.db`), seamlessly pre-populating all schema tables, seed accounts, waste listings, production batches, and organic products.
- Standard SQL schema and seed files are also provided in the `database/` directory:
  - `database/schema.sql` (Complete MySQL DDL table definitions with constraints and indexes)
  - `database/seed.sql` (Initial demonstration records)

---

## 🧪 Automated Testing

To run the automated API and circular business logic verification suite:
```bash
cd server
npm test
```
The test suite verifies:
1. Database connectivity and 4 distinct role accounts
2. Secure password hashing with bcryptjs
3. Vegetable waste listing creation
4. Concurrency-safe collection request reservations
5. Compost production batch initialization
6. Product stock deduction upon order placement
7. Audit log generation and cleanup

---

## 📊 Key Highlights for DTI Presentation
- **Real Database Integration:** Computes physical statistics from real records (kg diverted, finished compost yield, active farmers) instead of hardcoding figures.
- **EPA WARM Methodology:** CO₂ greenhouse gas avoidance is calculated using standard organic waste diversion benchmarks (~0.45 kg CO₂e avoided per kg diverted municipal waste).
- **Printable Receipts:** Farmers can view itemized orders and print official invoices directly via `window.print()`.
- **Telugu Language Toggle:** Supports regional farmers and market stall owners with bilingual English/Telugu UI.
