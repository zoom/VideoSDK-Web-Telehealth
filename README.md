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
git clone https://github.com/zoom/VideoSDK-Web-Telehealth
```

2. Install dependencies

```bash
cd VideoSDK-Web-Telehealth
bun install # or npm install
```

3. Copy the `.env.example` file to `.env` and fill in the required values

4. Sync the database schema

```bash
bunx prisma db push
```

5. Seed the database with some data

```bash
bunx prisma db seed
```

7. Run the app

```bash
bun dev # or npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) with your browser.

> If you intend to use file uploads, you need to set the S3 bucket policy. An example can be found in `utils/set-s3-policy.ts`. You can run this script to set the CORS Rules to allow all requests from any origin.

## Customisation

You can edit the colors for the app in `src/styles/globals.css`.
You can change the favicon and logo by replacing the files in `public/`.

### Disclaimers

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

HIPAA Disclaimer: This sample app is not designed to be a compliant solution for use with protected health information (PHI) under the Health Insurance Portability and Accountability Act (HIPAA).
