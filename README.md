# 🌿 Centro

**The Digital Heart of Your Community.** *A modern, web-based community management platform purpose-built for residential subdivisions in the Philippines.*

---

## 📌 Project Overview
**Centro** centralizes communication, dues tracking, and emergency response into a single, accessible interface. It is designed to eliminate the fragmentation and safety gaps endemic to traditional paper-based or informal (Messenger/Viber) community management.

### 🏘️ The Problem
1. **Fragmented Communication:** Critical notices (water interruptions, repairs) reach residents late or are lost in chat noise.
2. **Inefficient Dues Management:** Manual tracking leads to balance invisibility and payment disputes.
3. **Inadequate Emergency Response:** Lack of a dedicated, high-priority digital channel between residents and security personnel.

### ✨ Our Solution
A unified, role-based platform built for:
- **🏠 Residents:** Pay dues, view announcements, and report emergencies.
- **💼 HOA Administrators:** Manage records, broadcast notices, and track finances.
- **🛡️ Security Guards:** Receive real-time alerts and manage visitor logs.

---

## 🛠️ Tech Stack
Centro is built using a modern, scalable **JAMstack** architecture for 99.5% uptime and high performance.

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS 3 |
| **Data Visualization** | Tremor |
| **Icons** | Lucide React |
| **Backend / BaaS** | Supabase (Auth, Realtime, Edge Functions) |
| **Database** | PostgreSQL with Row Level Security (RLS) |
| **Deployment** | Vercel |
| **Language** | TypeScript |

---

## 🚀 Key Features
### 1. Real-Time Announcement System
- Targeted broadcasts (by Phase/Block).
- Real-time updates via Supabase WebSockets.
- Priority-based rendering (General, Utility, Security, Emergency).

### 2. Homeowner Dues Tracking
- Transparent ledger history for residents.
- Automated balance calculations (Charges - Payments).
- Admin collection reports with Tremor visualization.

### 3. Emergency Alerts (Real-Time)
- One-tap "Panic Button" for residents.
- Instant Guard notification with 5-second target latency.
- Status tracking: `OPEN` → `RESPONDING` → `RESOLVED`.

### 4. Role-Based Access Control (RBAC)
- Strict security enforced via Supabase **Row Level Security (RLS)**.
- Data isolation: Residents can never access other units' financial data.

---

## 🏗️ System Architecture
