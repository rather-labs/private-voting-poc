export const tooltipTexts = {
  title: `A <b>proof-of-concept</b> for private voting using zero-knowledge proofs.
It provides an example of using <b>noir circuits</b> with the <b>noir-jwt</b> library. 
This library allows to generate proofs from any JWT. 
In this case the <b>login token</b> with a <b>google account</b> is used.
This is <b>NOT</b> a production-ready application.`,
  signIn: `Sign in to participate in elections.
This will generate the JWT token that is used to generate the proof`,
  signOut: `Sign out of your account.
You can sign in with another account to sumbmit another vote in an election
`,
  createElectionHome: "Create a <b>new election</b> with custom options and settings",
  createElectionForm: `Submit and <b>publish your election</b>. 
This will allow you and other <b>google users<b> to vote in the election`,
  generateProof: `Generate a <b>zero-knowledge proof</b> to verify you are signed in.
This will allow voting <b>without revealing your identity</b>.
The proof that is used only verifies that you have a <b>valid google account</b>.
It generates a <b>nullifier</b> from your google account information.
The only way the identity of the voter can be <b>brute forced</b> is if user data is <b>leaked by google</b>.
Additional conditions could be added to the proof. 
For example to verify a <b>certain company email address</b>.`,
  verifyProof:  `Submit your proof and vote to the server. 
The server will verify the proof and check that the <b>nullifier</b> has not yet been used.
If accepted, it is <b>added to the database alongside the vote</b>. `
} as const;

export type TooltipTextKey = keyof typeof tooltipTexts;
