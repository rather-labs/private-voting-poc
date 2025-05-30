# Voting quests with EVM verification

# Run hardhat

Start the localchain
```bash
cd contracts
```

```bash
npx hardhat node
```

Deploy contracts
```bash
npx hardhat ignition deploy ./ignition/modules/VotingQuest.ts --network localhost --reset
```

Transfer tokens to contract
```bash
npx hardhat run scripts/sendETHToMetaMask.ts --network localhost
```

# Set client configuration variables

Set this variables in local.env
```bash
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
NEXTAUTH_SECRET=
NEXT_PUBLIC_VOTING_QUEST_FACTORY_ADDRESS=
```

# Run client

```bash
cd client
```

```bash
npm run dev
```

# Generate a quest

```bash
```
# Vote on a quest

```bash
```

```bash
```