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


Centro follows a serverless architecture where security is enforced at the database level. 
- **Pattern:** Resident requests page → Middleware validates JWT → Server Component fetches data filtered by RLS.

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase Account
- Vercel CLI (optional)

### Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/centro.git](https://github.com/your-username/centro.git)
   cd centro

   Install dependencies:

    Bash
    npm install
    Set up Environment Variables:
    Create a .env.local file in the root directory:
    
    Code snippet
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    
    Run the development server:
    Bash
    npm run dev
    Open http://localhost:3000 to see the result.

##👥 The Team
Kien Serapio — Project Manager & Full Stack Developer
Vince Santos — Backend Developer & Database Engineer
Toni Narra — Frontend Developer (UI Systems)
Gvan Rocas — Frontend Developer (Mobile & Real-Time)
Lowel Rubino — Backend Developer & QA Specialist

##🛡️ Design System
Centro uses a Modern Minimalist SaaS aesthetic.
Font: Product Sans
Forest Green (#2D5A27): Primary actions & Success states.
Sunset Orange (#FF8C42): Emergency alerts & Urgent CTAs.
Surface: Minimal white (#FFFFFF) for high readability.

##📄 License
This project is for academic purposes. Confidential | Centro Development Team.
