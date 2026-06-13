# 🌌 VocabVortex: The Ultimate Vocabulary Mastery Ecosystem

**VocabVortex** is a cutting-edge, full-stack educational ecosystem designed to transform how users learn, retain, and master new vocabulary. By blending immersive reading, cinematic learning, competitive gaming, and AI-powered productivity tools, VocabVortex creates a "flow-state" environment for language acquisition.

---

## 🏗️ System Architecture & Core Modules

VocabVortex is built on a **modern monorepo architecture**, separating concerns between a highly interactive mobile interface and a robust, AI-integrated backend.

### 1. 📱 Mobile Interface (Expo / React Native)
The frontend is a high-performance React Native application powered by **Expo SDK 54**. It focuses on "Fluid UI" principles using **Moti** and **Reanimated** for physics-based animations.
*   **Navigation:** File-based routing via `expo-router`.
*   **State Management:** Context API for global theme and user state; `AsyncStorage` for high-speed local persistence.
*   **Theme Engine:** A custom "Multi-Universe" theme system (AMOLED, Verdant, Crimson, etc.) that dynamically re-skins the entire app.

### 2. ⚡ Backend & AI Orchestration (Next.js / Node.js)
The backend acts as the brain of the ecosystem, handling complex data relationships and AI interfacing.
*   **Framework:** Next.js 16 (App Router) for high-performance API routes.
*   **Database:** MongoDB Atlas with Mongoose for flexible, schema-based document storage.
*   **AI Engine:** **Groq API** integration utilizing the **Llama 3.3-70b-versatile** model for sub-second inference speeds.
*   **Authentication:** Multi-layered auth supporting Google OAuth and secure session management.

---

## 🚀 Deep-Dive Features

### 📝 Smart Notepad (Google Docs Evolution)
The centerpiece of user productivity. Not just a text editor, but a "Learning Processor."
*   **Cloud-Sync & Autosave:** Real-time debounced syncing between `AsyncStorage` and MongoDB.
*   **AI Suite:**
    *   **Grammar Fix:** Real-time professional editing.
    *   **Summarize:** Distills long notes into core concepts.
    *   **Expand:** Generatively builds upon user ideas.
    *   **Simplify:** Re-writes content for A2/B1 proficiency levels.
    *   **Translate:** Context-aware translation to Bengali.
*   **TTS Integration:** Full note "Read Aloud" capability using `expo-speech`.
*   **Productivity Metrics:** Real-time word counts, character tracking, and reading time estimations.

### 📖 Immersive Reading
*   **Interactive Tapping:** Every word in a story or chapter can be tapped to trigger the **Global Word Insight Modal**.
*   **Dynamic Drills:** AI generates contextual sentences and Bengali definitions for any word on-demand.
*   **Progressive Difficulty:** Books and chapters are categorized by difficulty (A1 to C2).

### 🎬 Cinematic Learning (Movies)
*   **SRT/Subrip Integration:** Imports external subtitles and maps them to a synchronized learning experience.
*   **Line-by-Line Translation:** AI-powered translation of specific movie lines to aid contextual understanding.

### 🎮 Gaming Arena
*   **Guess & Match:** Interactive games that turn your bookmarked "mastery list" into a competitive challenge.
*   **Leaderboard System:** Global XP tracking and ranking system with level-up mechanics.

---

## 🛠️ Technical Stack

### **Mobile (Frontend)**
| Technology | Usage |
| :--- | :--- |
| **React Native / Expo** | Core Framework |
| **Moti / Reanimated** | UI/UX Animations |
| **NativeWind / Tailwind** | Responsive Styling |
| **Lucide React Native** | Vector Iconography |
| **Expo Speech** | Text-to-Speech Engine |
| **AsyncStorage** | Local Cache & Offline Sync |

### **Server (Backend)**
| Technology | Usage |
| :--- | :--- |
| **Next.js 16** | API Framework |
| **MongoDB / Mongoose** | Data Persistence |
| **Groq / Llama 3.3** | LLM Logic & Content Generation |
| **TypeScript** | Type-Safe Architecture |
| **JWT / OAuth** | Identity & Security |

---

## 📡 API Architecture

The system utilizes a structured RESTful API.

### **Notes Module**
*   `GET /api/notes?email=...`: Fetches all user notes.
*   `POST /api/notes`: Upserts (creates or updates) a note with title and content.
*   `DELETE /api/notes/[noteId]`: Securely deletes a specific note.

### **AI Processing**
*   `POST /api/ai/process-note`: Takes a `{ note, action }` payload.
    *   Supported Actions: `fix`, `summarize`, `expand`, `highlight`, `simplify`, `translate`.

### **Word Mastery**
*   `POST /api/word`: Generates educational drills and definitions for a specific word based on the user's level.

---

## 🔧 Installation & Setup

### **Backend Setup**
1.  Navigate to `/server`.
2.  Install dependencies: `npm install`.
3.  Configure `.env`:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    GROQ_API_KEY=your_groq_api_key
    ```
4.  Run development server: `npm run dev`.

### **Mobile Setup**
1.  Navigate to `/mobile`.
2.  Install dependencies: `npm install`.
3.  Configure `constants.js` to point to your backend URL.
4.  Launch with Expo: `npx expo start`.

---

## 🌟 Future Roadmap
*   **Offline First AI:** Utilizing local ONNX models for basic grammar checks.
*   **Multiplayer Arena:** Real-time head-to-head vocabulary battles.
*   **Custom Content Import:** Allow users to upload PDFs/EPUBs for AI-guided reading.

---

*Built with ❤️ by the VocabVortex Team.*
