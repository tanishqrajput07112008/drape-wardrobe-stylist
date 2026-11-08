# Drape

**Wear what you own. Show up as yourself.**

Drape is an occasion-aware wardrobe stylist. It helps people catalogue clothes and accessories they already own, then build outfit combinations for events and everyday plans. The product is designed to support casual, formal, and traditional Indian clothing.

## Project status

This repository contains the application source synced from the Lovable project. The app is still under development; do not assume production readiness until the build, authentication, database policies, image storage, and end-to-end flows have been tested.

## Development

Requirements: Node.js and npm (or Bun).

```sh
npm install
npm run dev
```

Useful scripts:

- `npm run build` — production build
- `npm run lint` — lint source
- `npm test` — run tests

## Environment

Configure the environment variables required by the Supabase and Lovable integrations in your local environment. Never commit `.env`, `.env.local`, service-role keys, AI gateway keys, or other secrets. Use the deployment platform's secret manager for production credentials.

## Stack

- React + TypeScript
- TanStack Start and TanStack Router
- Tailwind CSS
- Supabase authentication and data services
- Lovable AI gateway integration

## Security

Wardrobe records and uploaded images may contain personal information. Keep access controls enabled and verify row-level security and storage policies before deploying. Public source code does not make private user data public.
