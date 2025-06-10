export const tooltipTexts = {
  title: `A **proof-of-concept** for private voting using zero-knowledge proofs.
It provides an example of using **noir circuits** with the **noir-jwt** library. 
This library allows the generation of proofs from any JWT. 
In this case the **login token** with a **google account** is used.
This is **NOT** a production-ready application.
You can check the circuits and app in our **[github repository](https://github.com/rather-labs/private-voting-poc)**`,
  signIn: `Sign in to participate in elections.
This will generate the JWT token that is used to generate the proof`,
  signOut: `Sign out of your account.
You can sign in with another account to sumbmit another vote in an election`,
  createElectionHome: "Create a **new election** with custom options and settings",
  createElectionForm: `Submit and **publish your election**. 
This will allow you and other **google users** to vote in the election`,
  generateProof: `Generate a **zero-knowledge proof** to verify you are signed in.
This will allow voting **without revealing your identity**.
The proof that is used only verifies that you have a **valid google account**.
It generates a **nullifier** from your google account information.
The only way the identity of the voter can be **brute forced** is if user data is **leaked by google**.
Additional conditions could be added to the proof. 
For example to verify a **certain company email address**.`,
  verifyProof:  `Submit your proof and vote to the server. 
The server will verify the proof and check that the **nullifier** has not yet been used.
If accepted, it is **added to the database alongside the vote**. `
} as const;

export type TooltipTextKey = keyof typeof tooltipTexts;
