# Private voting with JWT-noir PoC
It commits a proof from the sign in token.
Generates a nullifier with the google id and the election id.
The voter identity could be brute forced if the google ids are leaked.

# Set configuration variables

Set this variables in .env.local 
```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
```

And this variables (imported from vercel project integrated with supabase database)
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
POSTGRES_DATABASE=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_PRISMA_URL=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_URL=
VERCEL_OIDC_TOKEN=
```

# Run client

```bash
cd client
```

```bash
npm run dev
```

# Deploy to vercel with 
```bash
vercel --prod
```
