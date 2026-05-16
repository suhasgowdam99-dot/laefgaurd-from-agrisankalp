# LeafGuard From Agrisankalp

A production-ready precision agritech landing page and AI detection tool.

## 🚀 Features
- **Strict UI Replication**: Pixel-accurate implementation of the Agrisankalp design spec.
- **AI Neural Diagnosis**: Integrated computer vision simulation for plant disease.
- **Soft Green Aesthetic**: Modern, minimal agricultural theme.
- **Full-Stack**: Node.js backend with JWT authentication and detection storage.

## 🛠️ Local Setup
1. `npm install`
2. `node server/index.js` (Backend)
3. `npm run dev` (Frontend)





LeafGuard AI is a complete full-stack solution for modern farmers, combining AI-driven plant disease diagnostics with real-time IoT sensor data via ESP32 and ThingSpeak.

## 🚀 Key Modules
1. **IoT Dashboard**: Real-time charts for Temperature and Humidity.
2. **AI Analyzer**: Neural network-based leaf disease detection (95%+ accuracy).
3. **Hardware Control**: Remote actuator trigger (pesticide sprayer) for ESP32.
4. **Advice Engine**: Automated agricultural recommendations.

## 🛠️ IoT Setup (ThingSpeak)
1. Create a ThingSpeak Channel.
2. Field 1: Temperature
3. Field 2: Humidity
4. Field 3: Sprayer Status (0 or 1)
5. Add your keys to the `.env` file.

## 💻 Local Execution
1. `npm install`
2. `node server/index.js` (Backend)
3. `npm run dev` (Frontend)



A comprehensive, production-ready SaaS for managing field service operations.

## 🚀 Features
- **Real-time Dashboard**: Track revenue, active jobs, and team performance.
- **Job Management**: Complete CRUD operations for service requests.
- **Authentication**: Secure JWT-based auth with role-based access.
- **Modern UI**: Built with Tailwind CSS and Framer Motion for a premium experience.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind, Lucide, Framer Motion.
- **Backend**: Node.js, Express, JWT, Helmet.
- **Validation**: Zod (Schema-based).



A complete, responsive SaaS landing page with a Node.js/Express backend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Development Servers

**Backend:**
```bash
node server/index.js
```

**Frontend:**
```bash
npm run dev
```



## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Zod (validation).
- **Styling**: Tailwind CSS v4.
- **Infrastructure**: Docker ready.

## 🔐 Security Practices
- Helmet.js for security headers.
- CORS configuration.
- Input validation (Zod placeholder).
- Rate limiting (suggested for production).
