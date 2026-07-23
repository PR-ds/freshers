# 📋 Project Feature Extraction Prompt & Comprehensive Project Breakdown

Below is the **reusable prompt template** for extracting detailed project features from any application, followed by the **full feature & architectural breakdown** for the **University Freshman Academic & Campus Portal**.

---

## 📄 Reusable Prompt Template

```markdown
You are a technical product analyst and software architect. Your task is to generate a comprehensive feature breakdown, system architecture overview, and detailed explanation for the project.

Please provide a complete analysis structured into the following sections:

1. **Executive Summary**: Core purpose, primary user personas, and design aesthetic/tech stack.
2. **Core Features Breakdown**: Categorized list of all functional modules. For each feature include:
   - Feature Name & Purpose
   - How It Works (Technical mechanism & control flow)
   - Key Capabilities & User Actions
   - Integration & Data Dependencies
3. **Backend & Data Architecture**: API routes, persistence layers, fallbacks, and security mechanisms.
4. **UI/UX & Design System**: Styling approach, micro-animations, glassmorphism, and 3D visual elements.
5. **Real-world Use Cases**: Practical scenarios demonstrating value for both technical and non-technical stakeholders.

If any technical details are missing or simulated in the environment, clearly identify the implementation state and necessary production steps.
```

---

# 🚀 Full Project Features Breakdown & Technical Explanation

### **Project Name**: University Freshman Academic & Campus Portal
### **Built By**: Antigravity Pair-Programming Agent
### **Tech Stack**: React.js, Three.js (WebGL), Vanilla CSS3 Glassmorphism, Tailwind CSS, Express.js (Node.js), REST API, `db.json` Local Storage Emulator, Resend API / Terminal Email Transmitter.

---

## 1. 🌐 Interactive 3D WebGL Canvas (`ParticleBackground3D`)

* **Purpose**: Creates an immersive, state-of-the-art dark glassmorphic environment with floating 3D tech stack brand objects that react dynamically to user navigation.
* **How It Works**:
  * Built using **Three.js** with custom physical materials (`MeshPhysicalMaterial`), extrusions, and geometric meshes.
  * Renders 9 distinct 3D tech logos floating in 3D space:
    * **React.js**: Cyan atom torus rings surrounding a yellow glowing sphere core.
    * **Firebase**: 3-layered volumetric flame (Red, Orange, Yellow).
    * **Node.js**: Green 3D hexagon cylinder with extruded letter "N".
    * **Tailwind CSS**: Dual-layered extruded wave paths.
    * **Google Cloud**: Multi-colored sphere cluster in Google brand colors.
    * **Next.js**: Dark metallic disc with green and white slashes.
    * **Python**: Interlocking blue and yellow snake shapes.
    * **Supabase**: Extruded emerald lightning bolt.
    * **Three.js**: Red triangular prism.
  * Uses `requestAnimationFrame(timestamp)` for smooth, zero-warning 60fps rotation and floating sin-wave oscillation.
  * **Parallax Scrolling**: Mouse movements and tab shifts (`activeTab`) trigger smooth camera interpolation (`PerspectiveCamera`) across the 3D scene.

---

## 2. 🔑 Dual-Role University SSO & Authentication Pipeline

* **Purpose**: Enables frictionless Single Sign-On for both **Students** and **Faculty/Admins** with automated offline simulation fallbacks.
* **How It Works**:
  * **Role Selector**: Instant tab switch between **Student SSO** (`student@college.edu`) and **Admin Portal** (`staff@college.edu`).
  * **Resilient Network Handler**: Dispatches POST requests to `${API_BASE}/auth/sso/login` wrapped in an `AbortController` (1.2s timeout).
  * **Bulletproof Fallback**: If backend connection is delayed or offline, the app automatically transitions to a simulated institutional session without locking the user out.
  * **Safe Storage Wrapper (`safeStorage`)**: Protects `localStorage` access with `try...catch` blocks to prevent crashes in private browsing or strict cookie environments.
  * **Dynamic API Base Resolution**: `API_BASE` dynamically inspects `window.location.hostname` to align port 3000 API calls whether running on `localhost`, `127.0.0.1`, or local network IP addresses.

---

## 3. 📊 Academic Dashboard & Task Management Workspace

* **Purpose**: Serves as the central command center for tracking weekly performance, daily to-dos, and AI growth metrics.
* **Key Capabilities**:
  * **Weekly Performance Summary**: Visual progress metrics displaying logged study hours, syllabus completion percentages, and gap analysis alerts (e.g., SQL Indexing).
  * **Interactive Task Manager**: Add, toggle completion status, or delete daily action items.
  * **REST Sync & Optimistic UI**: Syncs with `/api/todo` endpoints on the server while updating the UI state immediately for zero latency.

---

## 4. 🤖 AI Growth Mentor Chatbot

* **Purpose**: Provides real-time academic guidance, study strategy advice, and domain recommendations.
* **How It Works**:
  * Communicates via REST endpoint `${API_BASE}/mentor/chat`.
  * Maintains thread history in state and persists chats under the user's ID.
  * Features a custom **Gemini API Key** settings modal, allowing users to input private keys stored safely via `safeStorage`.

---

## 5. 📚 Academics & Semester Syllabus Explorer

* **Purpose**: Gives students instant access to course curricula, unit breakdowns, and curated study resources tailored to their engineering discipline.
* **Key Capabilities**:
  * **Department Mapping**: Automatically displays subjects matching the student's department (e.g., Computer Science, AI & DS, ECE, Mechanical, Civil).
  * **Syllabus Modal**: High-definition popup modal detailing Unit 1 through Unit 5 syllabus topics.
  * **Video Integration**: Direct external links to recommended YouTube tutorial playlists and channels (MIT OpenCourseWare, freeCodeCamp, Programming with Mosh).

---

## 6. 🛠️ Skills, Domain Tracks & Departmental Clubs

* **Purpose**: Guides students through career specialization tracks and connects them with campus technical organizations.
* **Key Capabilities**:
  * **9 Specialized Domain Tracks**: Web Dev, AI & ML, Cyber Security, Cloud & DevOps, Mobile Apps, Game Dev, Blockchain, Data Science, Embedded Systems.
  * **Interactive 3D Knowledge Graph (`KnowledgeGraph3D`)**: An interactive WebGL node graph where users can orbit and inspect skill prerequisite connections.
  * **Departmental Clubs Directory**: Mapped to college engineering branches with one-click "Request Join Token" action triggers.

---

## 7. 📅 College Event Management & Automated Google Doc Builder

* **Purpose**: Enables admins to publish campus events and students to register team proposals with auto-generated documentation.
* **Key Capabilities**:
  * **Admin Event Creator**: Allows faculty admins to post hackathons, workshops, and symposiums directly to the student portal in real-time (`/api/events`).
  * **Team Registration Modal**: Multi-member team registration form.
  * **Automated Google Doc Link Generation**: Generates live Google Doc project proposal URLs for registered teams upon submission (`/api/events/register`).

---

## 8. ⚡ Express REST Backend & Database Emulator (`server/index.js`)

* **Purpose**: Provides high-performance RESTful API services and persistent data storage.
* **Key Capabilities**:
  * **Local DB Emulator**: Serves as a local file-backed database (`server/db.json`) when Google Cloud Storage (GCS) credentials are not configured.
  * **Integrated Email Transmitter**: Uses Resend API (or terminal log fallback) to dispatch welcome emails and security login alerts upon SSO entry.
  * **CORS Enabled**: Configured to process cross-origin requests securely from Vite client ports (`4173` and `5173`).
