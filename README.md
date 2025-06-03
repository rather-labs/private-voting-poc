# Private voting with JWT-noir PoC
It commits a proof from the sign in token.
Generates a nullifier with the google id and the election id.
The voter identity could be brute forced if the google ids are leaked.

# Set configuration variables

Set this variables in env.local
```bash
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
NEXTAUTH_SECRET=
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
