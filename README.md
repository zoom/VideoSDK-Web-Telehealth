# Zoom Telehealth Sample App

A full-stack telehealth sample built with the Zoom Video SDK. It includes GitHub sign-in, doctor and patient onboarding, appointment scheduling, video visits, notes, recordings, and S3-compatible file uploads.

## Deploy to Vercel

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzoom%2FVideoSDK-Web-Telehealth&amp;env=AUTH_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,ZOOM_SDK_KEY,ZOOM_SDK_SECRET,ZOOM_API_KEY,ZOOM_API_SECRET,S3_ENDPOINT,S3_BUCKET,S3_ACCESS_KEY_ID,S3_SECRET_ACCESS_KEY&amp;envDescription=Auth.js%2C%20Zoom%20Video%20SDK%2C%20Zoom%20API%2C%20and%20S3-compatible%20storage%20credentials%20required%20by%20the%20app.&amp;envLink=https%3A%2F%2Fgithub.com%2Fzoom%2FVideoSDK-Web-Telehealth%23environment-variables&amp;project-name=zoom-telehealth&amp;repository-name=zoom-telehealth&amp;build-command=bunx%20drizzle-kit%20migrate%20%26%26%20bun%20run%20db%3Aseed%20%26%26%20SKIP_ENV_VALIDATION%3D1%20bun%20run%20build&amp;products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%5D&amp;skippable-integrations=0"><img src="https://vercel.com/button" alt="Deploy with Vercel" /></a>

The deployment flow creates a copy of this repository, provisions a Neon Postgres database through Vercel Marketplace, injects `DATABASE_URL`, applies the committed Drizzle migrations, and seeds demo accounts. Seeding is a no-op once the database has users, so later deploys are unaffected. You may need to select or confirm Neon's free plan. No separate Neon account or manual database setup is required.

Enter these values in the Deploy Button's environment-variable form. If the form does not appear (Vercel can omit it when a Marketplace product is included), let the initial build finish, then add them under **Project Settings → Environment Variables** for Production, Preview, and Development and redeploy. The build skips build-time credential validation, so the first deploy succeeds whether or not the values are set yet:

```dotenv
AUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ZOOM_SDK_KEY=
ZOOM_SDK_SECRET=
ZOOM_API_KEY=
ZOOM_API_SECRET=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

Generate `AUTH_SECRET` with `npx auth secret`. Neon supplies `DATABASE_URL`, and Vercel supplies the deployment URL, so neither needs to be entered manually.

After creating the Vercel project:

1. Add any environment variables you did not enter in the form, then redeploy.
2. Set the production GitHub OAuth callback URL to `https://<your-domain>/api/auth/callback/github`.
3. Redeploy again if the OAuth configuration or any environment variable changes.

Do not place secrets directly in a Deploy Button URL or commit them to the repository.

## Tech stack

* Next.js 16 App Router and React 19
* TypeScript and Tailwind CSS
* Auth.js with GitHub OAuth and database sessions
* tRPC and TanStack Query
* Drizzle ORM and PostgreSQL
* Zoom Video SDK
* S3-compatible object storage
* shadcn/ui and Radix UI

## Prerequisites

* Node.js 20.9 or newer
* [Bun](https://bun.sh/)
* A PostgreSQL database for local development, such as [Neon](https://neon.tech/). The Vercel deployment flow can provision one for you.
* A [Zoom Video SDK account](https://developers.zoom.us/docs/video-sdk/developer-accounts/)
* A GitHub OAuth app
* An S3-compatible bucket, such as Amazon S3 or Cloudflare R2

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/zoom/VideoSDK-Web-Telehealth.git
   cd VideoSDK-Web-Telehealth
   bun install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in the values described in [Environment variables](#environment-variables). Generate `AUTH_SECRET` with:

   ```bash
   npx auth secret
   ```

4. Configure the local GitHub OAuth callback URL:

   ```text
   http://localhost:3000/api/auth/callback/github
   ```

5. Create or update the database schema:

   ```bash
   bun run db:push
   ```

6. Optionally add sample doctor and patient records to an empty database:

   ```bash
   bun run db:seed
   ```

   The seed is intended for a fresh development database and may conflict with existing records if run more than once.

7. Start the development server:

   ```bash
   bun run dev
   ```

8. Open <http://localhost:3000>.

Camera, microphone, screen sharing, and cross-origin isolation require a secure context in production. Localhost is treated as a secure context by modern browsers.

## Environment variables

The current environment schema validates all integration credentials at startup and during production builds. Empty values are rejected.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the application. Use SSL when required by your provider. |
| `DATABASE_DIRECT_URL` | Optional direct PostgreSQL connection used by Drizzle Kit; falls back to `DATABASE_URL`. Useful when `DATABASE_URL` points to a pooled endpoint. |
| `AUTH_SECRET` | Auth.js signing secret containing at least 32 characters. |
| `NEXTAUTH_URL` | Local canonical URL, normally `http://localhost:3000`. Vercel supplies its deployment URL automatically. |
| `AUTH_TRUST_HOST` | Set to `true` for self-hosted production only when a trusted reverse proxy overwrites forwarded host/protocol headers. Not required on Vercel or in development. |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID. |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application client secret. |
| `ZOOM_SDK_KEY` | Zoom Video SDK key used to join video sessions. |
| `ZOOM_SDK_SECRET` | Zoom Video SDK secret used to sign session tokens. |
| `ZOOM_API_KEY` | Zoom Video SDK API key used for recording APIs. |
| `ZOOM_API_SECRET` | Zoom Video SDK API secret used for recording APIs. |
| `S3_ENDPOINT` | URL of the S3 or S3-compatible API endpoint. |
| `S3_BUCKET` | Bucket used for uploads. |
| `S3_ACCESS_KEY_ID` | S3-compatible access key ID. |
| `S3_SECRET_ACCESS_KEY` | S3-compatible secret access key. |
| `NEXT_PUBLIC_TESTMODE` | Optional development/testing mode flag. |

See [`.env.example`](.env.example) for a copyable template. Use separate GitHub OAuth applications for local and production environments when their callback URLs differ.

## Database commands

```bash
bun run db:push       # Apply the current schema directly to the database
bun run db:generate   # Generate SQL migrations in ./drizzle
bun run db:migrate    # Apply committed migrations
bun run db:pull       # Introspect an existing database
bun run db:studio     # Open Drizzle Studio
bun run db:seed       # Add development sample data
```

For production systems, review generated migrations and apply them through your normal release process instead of relying on ad hoc schema pushes.

## S3-compatible uploads

The bucket must allow browser requests from the application origin. A helper script is available at [`src/utils/set-s3-policy.ts`](src/utils/set-s3-policy.ts); review its policy and allowed origins before using it. Do not use an allow-all CORS policy in production.

## Available scripts

```bash
bun run dev       # Start the development server
bun run build     # Create a production build
bun run start     # Start the production server
bun run lint      # Run ESLint
```

## Customization

* Global theme tokens and styles: [`src/styles/globals.css`](src/styles/globals.css)
* Database schema: [`src/server/db/schema.ts`](src/server/db/schema.ts)
* Authentication providers: [`src/server/auth.ts`](src/server/auth.ts)
* Static assets, favicon, and logos: [`public/`](public/)

## Terms

Use of this sample is subject to Zoom's [Video SDK Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

### Disclaimer

> This repository is a sample, not a production-ready medical system. It has not been designed or validated as a HIPAA-compliant solution and must not be used with protected health information (PHI) without an independent security, privacy, and compliance review.
