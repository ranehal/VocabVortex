# VocabVortex

## Super Detailed Project Description

VocabVortex is an advanced, AI-driven educational platform designed to elevate vocabulary mastery. Built as a monorepo, it features a React Native/Expo mobile application, a Next.js server for backend operations, and a scalable web interface. The core philosophy of VocabVortex is to move beyond rote memorization by providing contextually rich, interactive, and highly engaging learning experiences.

The application leverages Large Language Models (LLMs) via the Groq API (utilizing models like Llama 3) and Gemini API to dynamically generate comprehensive educational content for any given word. This includes phonetic transcriptions, grammatical categorization, synonyms, antonyms, tailored short stories, and context-specific sentence drills with explanations. To ensure cultural relevance for target demographics, it also provides localized definitions (e.g., Bengali meanings).

The user interface is designed with a "rich aesthetic," featuring immersive themes (like Space AMOLED and Verdant Luxe), fluid animations using Framer Motion and Moti, and interactive mini-games to maintain user engagement. The platform supports user authentication via Google, allowing learners to sync their progress (bookmarks and mastered words) across devices.

---

## Technical Documentation

### Architecture Overview

VocabVortex follows a decoupled monorepo architecture:

1. **`server/` (Backend):**
   - **Framework:** Next.js (App Router) acting as a serverless API provider.
   - **Database:** MongoDB, connected via Mongoose. Uses a global caching strategy in `src/lib/mongodb.ts` to manage connection pools efficiently in serverless environments.
   - **Security:** Implements basic Bearer token authentication and strict input validation (`src/lib/auth.ts`). Includes robust error handling to prevent leakage of sensitive stack traces.
   - **Testing:** Configured with Jest and `ts-jest` for unit testing core logic.
   - **Key Endpoints:** 
     - `POST /api/word`: Core logic for fetching/generating word data. Uses a fallback mechanism (checks DB first, calls Groq API if missing, saves to DB).
     - `POST /api/user`, `GET /api/user`: Manages user synchronization and progress state.

2. **`mobile/` (Mobile Application):**
   - **Framework:** React Native managed by Expo.
   - **Styling:** TailwindCSS/NativeWind with custom themes.
   - **Animations:** `moti` for complex, hardware-accelerated animations.
   - **State & Data:** Uses `AsyncStorage` for offline capability and synchronizes with the Next.js server when online.
   - **Auth:** Expo Auth Session for Google OAuth.

3. **`web/` (Web Application):**
   - **Framework:** React (Vite/Create React App structure).
   - **Styling:** TailwindCSS.
   - **Animations:** `framer-motion` for fluid web interactions.

### Security Measures Implemented

- **Input Validation:** All incoming requests (POST/GET parameters) are validated using the `isValidString` helper to prevent injection attacks and ensure data integrity.
- **Authorization Check:** API routes are protected by the `isAuthenticated` middleware helper, which verifies the presence and format of an Authorization header.
- **Error Obfuscation:** The server catches internal errors (like Database connection failures) and returns generic `500 Internal Server Error` responses to the client, preventing the exposure of database URIs or internal stack traces.
- **ReDoS Prevention:** Inputs used in Regular Expressions (like the word lookup in MongoDB) are sanitized (`word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`) to prevent Regular Expression Denial of Service attacks.
- **Environment Variables:** API Keys (Groq, MongoDB URI) are strictly managed via environment variables and are never exposed to the client.

### Code Quality & Maintenance

- Comprehensive JSDoc comments have been added to all critical functions, models, and utility scripts across the server and frontend applications.
- Jest unit tests have been introduced to verify security and validation logic, ensuring future changes do not introduce regressions.

---

## Future Work & Roadmap

1. **Advanced Authentication:** Migrate from basic Bearer token checks to a robust JWT-based system or integration with NextAuth.js for the backend.
2. **Rate Limiting:** Implement API rate limiting (e.g., using Upstash or Redis) to protect the LLM endpoints from abuse and control API costs.
3. **Spaced Repetition System (SRS):** Enhance the "Mastery Dashboard" with an algorithm like SM-2 to prompt users to review words at optimal intervals.
4. **Social & Leaderboards:** Introduce a competitive element where users can see friends' progress or participate in global vocabulary challenges.
5. **Offline Mode Refinement:** Improve the mobile app's offline caching to allow users to review their queued words even without internet access, syncing once connection is restored.
6. **E2E Testing:** Implement end-to-end tests using Detox (for mobile) and Cypress/Playwright (for web) to simulate real user flows.

---

## Q/A for Recruiters & Faculty

**Q: Why did you choose a monorepo structure for this project?**
**A:** A monorepo simplifies dependency management and allows for shared configurations (like TypeScript types or utility functions in the future). It also provides a single source of truth for the entire product lifecycle, making it easier to track holistic changes across the frontend and backend simultaneously.

**Q: How does the application handle the latency of AI generation?**
**A:** AI generation can be slow. To mitigate this, the backend first queries the MongoDB database. If a word has been requested before by *any* user, it is retrieved instantly. If it's a new word, the API fetches from Groq/Gemini, parses the JSON, and simultaneously returns it to the user while asynchronously saving it to the database for future requests. On the UI side, engaging loading animations (like the Word Builder Mini-Game) mask the wait time.

**Q: What security vulnerabilities did you consider, and how did you address them?**
**A:** Serverless APIs are prone to over-fetching and injection. I addressed authorization by adding middleware to ensure only authenticated clients can hit the endpoints. For database queries, I sanitized string inputs before using them in Regex to prevent ReDoS attacks. I also implemented strict error handling to ensure stack traces or database connection strings are never leaked to the client during a failure.

**Q: How is state managed across the mobile application?**
**A:** The mobile app uses a combination of local component state (React `useState`) for UI interactions and `AsyncStorage` for persistent offline data. When the user logs in via Google, their local state (bookmarks, learned words) is merged uniquely (using JavaScript Sets) with their remote data on the Next.js server, ensuring progress is never lost and is synced across devices.

**Q: What is the purpose of the `dbConnect` caching logic in `server/src/lib/mongodb.ts`?**
**A:** In a serverless environment like Next.js API routes, the code is executed on-demand. Without caching the MongoDB connection in the global scope, every single API request could potentially open a new database connection, rapidly exhausting the database's connection limit and causing crashes. The caching logic ensures that the connection is reused across warm serverless invocations.

**Q: Can you explain your testing strategy?**
**A:** For the current scope, I focused on testing the most critical logic: security and data validation. I set up a Node.js testing environment using Jest and `ts-jest` for the Next.js server. I wrote unit tests to verify the behavior of the `isAuthenticated` and `isValidString` helpers, ensuring they correctly accept valid data and reject malformed or missing headers. In the future, this will be expanded to integration tests mocking the database and external APIs.
