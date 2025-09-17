# RAG Chatbot Frontend (React + Vite + SCSS)

## Setup
```
npm install
npm run dev
```
- Opens at `http://localhost:5173`.
- Calls backend at `http://localhost:5000/api` (see `src/App.tsx`).

## Features
- Landing screen prompt with centered input.
- Chat UI with avatars, sources list, and icon-only Send/Reset.
- Left sidebar shows session history (current session prompts).
- Independent scrolling for sidebar and messages.

## Config
- To point to a different backend, change `API_BASE` in `src/App.tsx`.

## Build
```
npm run build
npm run preview
```
