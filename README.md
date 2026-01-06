<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg" width="80" height="80" alt="WealthWise Logo" />
</p>

<h1 align="center">💰 WealthWise</h1>

<p align="center">
  <strong>AI-Powered Personal Finance Platform</strong><br>
  <em>Smart money management with intelligent insights • Built with MERN Stack</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AI-Groq%20LLM-FF6B6B?style=flat-square" alt="Groq AI" />
  <img src="https://img.shields.io/badge/Currency-INR%20₹-orange?style=flat-square" alt="INR Currency" />
</p>

---

## ✨ Overview

WealthWise is a **production-ready, full-stack personal finance application** that helps users track expenses, manage budgets, set savings goals, and gain AI-powered insights into their financial health. Built specifically for Indian users with INR (₹) currency support.

### 🎯 Key Highlights

- 🤖 **AI Financial Assistant** - Chat with an intelligent advisor powered by Groq LLM
- 📊 **Smart Dashboard** - Role-specific financial overviews (Individual/Student/Business)
- 💳 **Transaction Management** - Track income & expenses with smart categorization
- 📈 **Budget Tracking** - Set spending limits with real-time alerts
- 🎯 **Savings Goals** - Track progress towards financial targets
- 📱 **Fully Responsive** - Premium experience across all devices
- 🔔 **Real-Time Notifications** - Instant alerts via WebSocket

---

## 🚀 Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Comprehensive financial overview with charts and quick actions |
| **Transactions** | Full CRUD with filtering, search, and CSV export |
| **Budgets** | Category-based budget tracking with progress visualization |
| **Goals** | Savings goals with contribution tracking and milestones |
| **Bills** | Recurring bill reminders with due date alerts |
| **Investments** | Portfolio tracking with gain/loss calculations |
| **Reports** | Financial analytics and spending insights |
| **AI Assistant** | Chat-based financial advisor with personalized insights |

### AI-Powered Features

- 🏷️ **Smart Categorization** - AI automatically categorizes transactions
- 💡 **Spending Insights** - Personalized recommendations based on patterns
- 📉 **Pattern Analysis** - Identify spending trends and anomalies
- 🗣️ **Natural Language Chat** - Ask questions about your finances

### Security & Performance

- 🔐 JWT-based authentication with refresh tokens
- 🛡️ Rate limiting and input validation
- ⚡ Lazy-loaded routes for optimal performance
- 🚨 Error boundaries for graceful error handling
- 💾 Debounced API calls

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI framework with fast HMR |
| Zustand | Lightweight state management |
| React Router v6 | Client-side routing |
| Recharts | Data visualization |
| Framer Motion | Smooth animations |
| Socket.io Client | Real-time updates |
| React Hook Form + Zod | Form handling & validation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | RESTful API server |
| MongoDB + Mongoose | Database with ODM |
| JWT | Authentication |
| Groq SDK | AI/LLM integration |
| Socket.io | WebSocket server |
| Node-cron | Scheduled jobs |
| Winston | Logging |

---

## 📁 Project Structure

```
WealthWise/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   │   ├── shared/        # Shared components (ProtectedRoute)
│   │   │   └── ui/            # UI primitives (Button, Modal, etc.)
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Login, Register, Role Select
│   │   │   ├── dashboard/     # Dashboard views
│   │   │   ├── transactions/  # Transaction management
│   │   │   ├── budgets/       # Budget tracking
│   │   │   ├── goals/         # Savings goals
│   │   │   ├── bills/         # Bill management
│   │   │   ├── investments/   # Investment tracking
│   │   │   ├── reports/       # Financial reports
│   │   │   ├── ai-assistant/  # AI chat interface
│   │   │   └── settings/      # User settings
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities (API, currency, etc.)
│   │   └── stores/            # Zustand state stores
│   └── index.html
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, rate limiting, validation
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic (AI service)
│   │   └── utils/             # Helper functions
│   └── server.js              # Entry point
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **MongoDB Atlas** account (free tier works)
- **Groq API key** (for AI features) - [Get one here](https://console.groq.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kulpreetatwork-cloud/wealthwise.git
   cd wealthwise
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server && npm install

   # Frontend
   cd ../client && npm install
   ```

3. **Configure environment variables**

   **Backend** (`server/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://your_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_refresh_token_secret
   GROQ_API_KEY=gsk_your_groq_api_key
   CLIENT_URL=http://localhost:5173
   ```

   **Frontend** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

5. **Open** [http://localhost:5173](http://localhost:5173)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New transaction |
| `D` | Go to Dashboard |
| `T` | Go to Transactions |
| `B` | Go to Budgets |
| `G` | Go to Goals |
| `Esc` | Close modal |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env`

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/transactions` | Get transactions |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/budgets` | Get budgets |
| GET | `/api/goals` | Get goals |
| POST | `/api/ai/chat` | Chat with AI |
| GET | `/api/ai/insights` | Get AI insights |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ in India | © 2026 WealthWise
</p>
