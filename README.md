# ⚛️ Quantum Lab (Lab Quântico) — Physical Chemistry Computational Platform

> **Object-Oriented Reimplementation & Gamified Full-Stack Web Platform for Interactive Physical Chemistry**  
> *Based on the article by Ardith D. Bravenec & Karen D. Ward (Journal of Chemical Education, 2023)*

---

## 🌟 Project Overview / Visão Geral do Projeto

**Quantum Lab (Lab Quântico)** is a bilingual (**English default** 🇺🇸 / **Portuguese** 🇧🇷) computational simulation and gamified learning platform developed for the **Computational Physical Chemistry / Object-Oriented Programming** course.

The project rebuilds the scientific models of chemical kinetics, kinetic theory of gases (Maxwell-Boltzmann), and Differential Scanning Calorimetry (DSC) in **Java 21**, providing:
1. **Full-Stack Gamified Web Application (Official `main` branch):** **Spring Boot 3.3.4 REST API** + **React 18 + TypeScript + Vite + TailwindCSS + Chart.js**, featuring a Hybrid Scientific Engine (Java REST API with automatic zero-latency browser mathematical fallback).
2. **Desktop GUI & CLI:** Native **JavaFX + XChart** interactive desktop application and console runner.

---

## 🚀 Key Features / Funcionalidades Implementadas

### 1. 🧮 Unified Formulas & Calculators Hub (`/formulas`)
All physical chemistry calculators are organized into **5 interactive blocks** within a single unified tab (`/formulas`):
* **Block 01 — Zero-Order Kinetics ($A \rightarrow B$):** $[A](t) = \max(0, [A]_0 - kt)$, analytical $1^{\text{st}}, 2^{\text{nd}}, 3^{\text{rd}}$ half-lives ($t_{1/2}^{(n)} = \frac{[A]_0}{2^n k}$), and total depletion time ($t_{\text{final}} = [A]_0 / k$).
* **Block 02 — First-Order Kinetics ($A \rightarrow B$):** $[A](t) = [A]_0 e^{-kt}$, constant half-life ($t_{1/2} = \ln(2)/k$), and $e$-folding chemical lifetime ($\tau = 1/k$).
* **Block 03 — Maxwell-Boltzmann Speed Distribution $f(v)$:** Log-domain normalized probability density, noble/diatomic gas comparison ($\text{He}, \text{H}_2, \text{N}_2, \text{O}_2, \text{Ar}$ + custom gas molar mass and $\gamma$), and characteristic speeds ($v_{mp}$, $v_{avg}$, $v_{rms}$, speed of sound $c = \sqrt{\gamma R T / M}$).
* **Block 04 — Kinetic Energy Distribution $f(E)$ & Activation Energy ($E_a$):** Molecular energy distribution in $\text{kJ/mol}$ and numerical integration of the reactive fraction $E \ge E_a$.
* **Block 05 — DSC Calorimetry & Numerical Integration ($\Delta H$):** Lysozyme protein thermal denaturation dataset (23 experimental $C_p$ points), Natural Cubic Spline interpolation, and baseline-corrected enthalpy integration via **Composite Trapezoidal Rule** and **Composite Simpson's 1/3 Rule**.

### 2. 🌐 Bilingual Interface (🇺🇸 English Default + 🇧🇷 Portuguese)
* **English (`en`)** is the default language across the entire application, with instant 1-click switching to **Portuguese (`pt`)** in the Navbar and Authentication screens.
* Features custom inline **SVG Country Flags** (USA and Brazil) and translates 100% of the UI, formulas, chart axes, ACS article presets, badges, and the 10-question scientific exercise bank (`?lang=en` / `?lang=pt`).

### 3. 🛡️ Security Hardening & Anti-Inspection Protection
* **Password Protection (`WRITE_ONLY` & SHA-256 + Salt):** `Usuario.senha` uses `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` so password hashes are never serialized in API responses. Passwords are hashed with salted `SHA-256` on both backend and offline fallback, and stripped before saving user sessions to `localStorage`.
* **DevTools & Context Menu Blocking (`ProtecaoInspecao.tsx`):** Blocks right-click context menu (`contextmenu` / *"Inspect"*) and keyboard shortcuts (`F12`, `Ctrl+Shift+I/J/C/K`, `Ctrl+U`, `Cmd+Option+I/J/C/K/U`) for external users.
* **Production Hardening:** Public H2 console disabled by default (`H2_CONSOLE_ENABLED=false`) and HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`) configured in `netlify.toml`.

### 4. 🎮 Gamification, GymRats Squads & Scientific Exercises
* **Specialized Exercise Modules (`/exercicios`):** 18 bilingual questions distributed across 4 core modules (Kinetics, Maxwell-Boltzmann, DSC Calorimetry, Advanced Numerical Methods & Thermodynamics), with modular entry cards, ergonomic back navigation, expandable problem statements (`TextoExpansivel`), and progressive hint economy (-20 PTS formula, -40 PTS step-by-step).
* **GymRats-Style Class Squads (`/ranking`):** Students can create and join custom classroom squads using invite codes (e.g. `UNIT-FQ1`), view daily streak flames (🔥), class podiums, and track cumulative squad scores alongside the global leaderboard.
* **Custom Profile & Security Customization (`/perfil`):** High-contrast Dark Laboratory workspace for managing credentials, research bio/institution, password changes, unlockable academic titles, and pioneer avatar badges.
* **Modern Toast Notifications (`NotificacaoToast`):** Custom animated alerts replacing native browser prompts for feedback, rewards, and error handling.
* **Ambient Laboratory Particles & Smooth Transitions:** Particle canvas background and fluid screen cross-fade navigation.
* **CSV Data Export:** 1-click `.csv` export on all simulation modules.

---

## 🏛️ Software Architecture / Arquitetura do Projeto

```text
Java_Para_Fisico-Quimica/
 ├── src/main/java/com/unit/
 │    ├── AplicacaoWeb.java                <-- Spring Boot 3 Entry Point (Web API)
 │    ├── Main.java                        <-- Console Menu Entry Point
 │    ├── config/                          <-- CORS & Web Configuration
 │    ├── controller/                      <-- REST Controllers (Cinetica, Maxwell, Dsc, Quiz, Usuario, Health)
 │    ├── repositorio/                     <-- Spring Data JPA Repository (UsuarioRepositorio)
 │    ├── modelo/                          <-- Domain Entities & Polymorphic Models (ModeloCinetico, etc.)
 │    ├── numerico/                        <-- Numerical Integration (Simpson 1/3, Trapezoidal, Cubic Spline)
 │    ├── ui/                              <-- Desktop GUI (JavaFX + XChart)
 │    └── util/                            <-- Physical Constants, Numeric Validator & CSV Exporter
 │
 ├── frontend/                             <-- React 18 + TypeScript + Vite SPA
 │    ├── src/
 │    │    ├── components/                 <-- Navbar, AvatarBadge, ProtecaoInspecao (Anti-DevTools)
 │    │    ├── i18n/                       <-- Bilingual Context (EN/PT) & SVG Flags (FlagUS, FlagBR)
 │    │    ├── pages/                      <-- Formulas (5-Block Hub), Cinetica, Maxwell, Dsc, Exercicios, Loja, Ranking, Perfil
 │    │    └── services/                   <-- Hybrid API Client (api.ts) & Local Scientific Engine (motorCientifico.ts)
 │    ├── .env.example                     <-- Frontend environment variables template
 │    └── package.json
 │
 ├── Dockerfile                            <-- Cloud-agnostic multi-stage Docker build (Java 21 Alpine)
 ├── docker-compose.yml                    <-- Local PostgreSQL container setup
 ├── netlify.toml                          <-- Netlify SPA build rules & HTTP Security Headers
 ├── .env.example                          <-- Backend environment variables template
 └── GUIA_DEPLOY_E_ARQUITETURA.md          <-- Detailed Architecture & Cloud Deployment Guide
```

---

## ⚙️ Environment Variables (`.env`) / Variáveis de Ambiente

The project includes pre-configured `.env`, `.env.local`, and `.env.example` files for seamless local development (ignored by Git via `.gitignore`, except `.env.example`).

### Backend (`.env` in root)
```env
SPRING_PROFILES_ACTIVE=h2
PORT=8080
H2_CONSOLE_ENABLED=false
```

### Frontend (`frontend/.env`)
```env
# Leave empty for automatic environment detection (localhost:8080 in dev, Render URL in prod)
VITE_API_URL=
```

---

## 🛠️ How to Run Locally / Como Executar Localmente

### Prerequisites
- **Java 21** (JDK 21 configured in `JAVA_HOME`)
- **Node.js 18+** and **npm**
- **Maven** (included via `./mvnw` wrapper)

### 1. Run Full-Stack Web Platform (Official `main` branch)

#### A. Start Backend (Spring Boot 3 — Port `8080`):
```bash
# Run with embedded H2 database (zero external setup required):
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2

# OR with Docker PostgreSQL (port 5434):
docker compose up -d
./mvnw spring-boot:run
```

#### B. Start Frontend (React + Vite — Port `5173`):
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open in your browser: `http://localhost:5173`

> **💡 Hybrid Mode Note:** Even if the Java backend is not running locally, the React frontend automatically activates its built-in TypeScript scientific engine (`motorCientifico.ts`), allowing all simulations, charts, and quizzes to run at 100% capacity!

---

### 2. Run Desktop GUI (JavaFX + XChart) or Console Mode
```bash
# Desktop JavaFX Interface:
./mvnw javafx:run

# Console Interactive Menu:
./mvnw compile exec:java -Dexec.mainClass="com.unit.Main"
```

### 3. Run Automated Unit Tests (JUnit 5 + Frontend Build)
```bash
# Backend JUnit 5 Suite:
./mvnw test

# Frontend TypeScript & Vite Production Build:
cd frontend && npm run build
```

---

## ☁️ Cloud Deployment (Render / Railway + Netlify)

This repository is **cloud-agnostic** (no vendor lock-in files required):
1. **Backend (Render, Railway, Fly.io, Cloud Run):** Connect the GitHub repository using the root `Dockerfile` and set environment variables:
   - `SPRING_PROFILES_ACTIVE=h2`
   - `PORT=8080`
   - `H2_CONSOLE_ENABLED=false`
2. **Frontend (Netlify):** Import the repository on Netlify (`netlify.toml` automatically sets `base = "frontend"`, `command = "npm run build"`, `publish = "dist"`). Optionally set `VITE_API_URL` to your backend URL (do **not** mark *"Contains secret values"*).

See [`GUIA_DEPLOY_E_ARQUITETURA.md`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/GUIA_DEPLOY_E_ARQUITETURA.md) for the complete step-by-step guide.
