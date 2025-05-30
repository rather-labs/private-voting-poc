"use client";

import Navbar from "./components/Navbar";
import { Toaster } from 'react-hot-toast';
import VotingProofGeneration from "./components/ProofGeneration";

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <VotingProofGeneration />
      </main>
    </div>
  );
}
