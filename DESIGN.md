# CUZO - Kids Chess Adventure: Design Architecture

## Overview
CUZO is a polished, interactive web application designed to teach kids how to play chess in a fun, engaging, and supportive environment. It combines a fully functional chess engine (`chess.js`) with a comprehensive instructional curriculum, an AI mentor ("Chessy"), Boss Battles, Tactics Training, Post-game analysis, and whimsical visual and sound feedback to create an accessible learning experience.

## Core Pedagogical Features

### 1. User Profiles & Dashboard
- **Profile Creation:** Users can create an avatar via simple configuration upon first load.
- **Dashboard Hub:** A central screen tracking User Rating (Glicko-2 style integer), highest streak, levels completed (stars), and offering practice modes.
- **Spaced Repetition System (SRS):** Tracks mastery of learned concepts and automatically prompts the user to review older concepts via the Daily Challenge or specific dashboard recommendations.
- **Data Persistence:** Progress is saved accurately in `localStorage`.

### 2. The Curriculum System (World Map)
- **World Map:** A visually engaging map interface containing 10 themed worlds (e.g., "The Pawn Kingdom", "The Knight's Quest", "Grandmaster Academy"). 
- **Interactive Lessons:** Replaces simple text. Integrated lesson engine step-by-step guidance validating target moves, offering feedback on weak moves/blunders.
- **Boss Battles:** Culminating challenges at the end of worlds with distinct UI, enemy "health bars", and dynamic dialogue based on moves.
- **Star Rating:** Players earn up to 3 stars per level based on the number of mistakes made, encouraging replayability without feeling punitive.

### 3. Tactics Trainer
- **Puzzle Integration:** Theme-based puzzles (e.g. Fork, Pin, Skewer) with interactive validation.
- **Streak Counters:** Tracks back-to-back correct tactics with visual flame components to motivate rapid, accurate problem-solving.
- **Adaptive Sourcing:** Selects tactics dynamically based on user rating.

### 4. Post-Game Analysis System
- **Engine-less Heuristics:** A lightweight material and mobility heuristic evaluator (`gameAnalyzer.ts`) that avoids the heavy processing client load of a full WASM Stockfish instance.
- **Classification:** Automatically grades moves as Great, Good, Inaccuracy, Mistake, or Blunder based on evaluation drift.
- **Interactive Review:** Players can explore a timeline after the game ends.
- **Turning Points:** Identifies where the game swung decisively in favor or against the player, teaching critical moments.

### 5. The AI Opponent & Mentor (Gemini Search & Scripts)
- **Opponent Intelligence:** Uses Google's `gemini-2.5-flash` to query dynamic AI moves.
- **Difficulty Modes:** Adaptive difficulty that checks user rating + explicit enum (Beginner, Easy, Medium, Hard).
- **Friendly Persona ("Chessy"):** A persistent wizard guide analyzing the board state.
- **Proactive Context:** Provides hints, alerts for check, praises good moves.

## Visual Design & Animations

- **Smooth Animations (`framer-motion`):**
   - **Piece Movement:** Pieces glide smoothly from square to square with a slight scale effect.
   - **UI Polish:** Staggered list reveals, bouncy icons, pop-in modals.
   - **Check Alerts:** The entire board triggers subtle red pulsing on checks.
- **Color Palette & Theme:** Deep slates (`slate-800`), bright functional colors (`emerald-400`, `orange-500`, `blue-500`). Avoids cookie-cutter default shadows.
- **Responsive Board:** The `ChessBoard.tsx` scales dynamically up to a maximum size (`max-w-xl`), preserving a perfect square aspect ratio across mobile, tablet, and desktop viewports.

## Audio Experience

- **Web Audio API (`soundManager.ts`):** All audio is generated procedurally to avoid loading external assets.
- **Piece-Specific Sounds:**
   - Different waveforms and parameters based on the specific piece type moved.
- **Event Sounds:**
   - Captures, Check, Checkmate, Illegal Move alerts.

## Technical Architecture

- **Framework:** Next.js 15+ (App Router). Client-side dominated (`"use client"`).
- **State Management:** React local state (`useState`, `useEffect`, `useRef`), coupled with a custom hook (`useUserProfile`, `useLesson`).
- **Chess Implementation:** `chess.js` wrapped in a custom `GameEngine` class (`/lib/chessEngine.ts`).
- **Styling:** Tailwind CSS (v4).
- **Animations:** Motion (`motion/react`).
- **Icons:** Lucide React.
- **Persistence:** Local Storage hooks abstracting persistence safely.
