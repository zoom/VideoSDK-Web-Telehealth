# Zoom Telehealth Sample App

This sample app demonstrates how to use the [Zoom SDK](https://developers.zoom.us/docs/video-sdk/web/) to build a telehealth app on Web.

## Tech Stack

- TypeScript
- React
- Next.js
- NextAuth
- tRPC
- [Zoom Video SDK](https://developers.zoom.us/docs/video-sdk/web/)
- Tailwind CSS
- shadcn/ui

## Prerequisites

- A Zoom Video SDK Account
- Node.js 18+
- Bun (or npm)

## Getting Started

1. Clone the repo

```bash
git clone https://github.com/EkaanshArora/Zoom-Telehealth
```

2. Install dependencies

```bash
cd Zoom-Telehealth
bun install # or npm install
```

3. Copy the `.env.example` file to `.env` and fill in the required values

4. Run the app

```bash
bun dev # or npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Customisation

You can edit the colors for the app in `src/styles/globals.css`.
You can change the favicon and logo by replacing the files in `public/`.

### Disclaimers

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

HIPAA Disclaimer: This sample app is not designed to be a compliant solution for use with protected health information (PHI) under the Health Insurance Portability and Accountability Act (HIPAA).
