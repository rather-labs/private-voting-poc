"use client";

import { useState } from "react";
import { useJWTInfo, getOpenIDClaims } from "../utils/auth";
import { useSession } from "next-auth/react";
import { generateInputs } from "noir-jwt";
import { generateProof } from "../utils/noir";
import type { CompiledCircuit, InputMap, ProofData } from "@noir-lang/types";
import { Toaster } from 'react-hot-toast';

import JwtCircuitJSON from '@/public/circuit/jwtnoir.json' assert { type: 'json' };

// Define proper types for inputs and session
interface ExtendedSession {
  idToken?: string;
  [key: string]: unknown;
}

export default function VotingProofGeneration() {
  const { data: session, status } = useSession();
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [inputs, setInputs] = useState<InputMap | null>(null);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [electionId, setElectionId] = useState<string>("");
  const jwtInfo = useJWTInfo();
  const openIdClaims = jwtInfo?.idToken ? getOpenIDClaims(jwtInfo.idToken) : null;

  async function getInputs() {
    if (status === "authenticated" && session) {
      try {
        setIsLoading(true);
        setError(null);

        if (!electionId) {
          throw new Error("Please enter an election ID");
        }

        // Cast session to unknown first for safe type conversion
        const extendedSession = session as unknown as ExtendedSession;
        if (!extendedSession.idToken) {
          throw new Error("ID token not available");
        }

        // get public key from google
        const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
        const keys = await response.json();
        
        const [headerEncoded] = extendedSession.idToken.split('.');
        if (!headerEncoded) {
          throw new Error("Invalid JWT format");
        }
        
        const header = JSON.parse(atob(headerEncoded.replace(/-/g, '+').replace(/_/g, '/')));
        const kid = header.kid;
        const pubkey = keys.keys.find((key: { kid: string }) => key.kid === kid);
        console.log("pubkey", pubkey);

        const generatedInputs = await generateInputs({
          jwt: extendedSession.idToken,
          pubkey,
          maxSignedDataLength: 1024,
        });
        console.log("inputs", generatedInputs);
        setInputs(generatedInputs);
        setShowInputs(true);
        return generatedInputs;
      } catch (err: unknown) {
        console.error("Error getting inputs:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to get inputs";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    }
    return null;
  }

  async function generateNoirProof() {
    if (!inputs) {
      setError("No inputs available. Please generate inputs first.");
      return;
    }

    try {
      setIsGeneratingProof(true);
      setError(null);
      // Add election Id to inputs
      inputs.election_id = Number(electionId);
      console.log("inputs", inputs);
      const generatedProof = await generateProof(JwtCircuitJSON as CompiledCircuit, inputs as InputMap);
      setProof(generatedProof);
    } catch (err: unknown) {
      console.error("Error generating proof:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate proof";
      setError(errorMessage);
    } finally {
      setIsGeneratingProof(false);
    }
  }

  const handleShowToken = () => {
    setShowTokenInfo(!showTokenInfo);
  };

  const handleToggleInputs = async () => {
    if (showInputs) {
      // If inputs are currently shown, just hide them
      setShowInputs(false);
    } else {
      // If inputs are not shown, get them first (if needed)
      if (!inputs) {
        await getInputs();
      } else {
        setShowInputs(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to JWT Voting
              </h1>
              <p className="text-gray-600 mb-2">
                {session ? "You are signed in" : "Sign in to start voting or create new polls"}
              </p>
              
              {session && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-md">
                    <label htmlFor="election-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Election ID
                    </label>
                    <input
                      type="text"
                      id="election-id"
                      value={electionId}
                      onChange={(e) => setElectionId(e.target.value)}
                      placeholder="Enter election ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={handleShowToken}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {showTokenInfo ? "Hide Token Info" : "Show Token Info"}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleInputs}
                      disabled={isLoading || !electionId}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isLoading ? "Loading..." : showInputs ? "Hide Noir Inputs" : "Get Noir Inputs"}
                    </button>
                    {inputs && (
                      <button
                        type="button"
                        onClick={generateNoirProof}
                        disabled={isGeneratingProof}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        {isGeneratingProof ? "Generating..." : "Generate Proof"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Display error messages */}
            {error && (
              <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>{error}</p>
              </div>
            )}

            {/* Display token information */}
            {showTokenInfo && openIdClaims && (
              <div className="my-4">
                <h2 className="text-xl font-semibold mb-2">Token Information</h2>
                <div className="bg-gray-100 p-4 rounded overflow-auto">
                  <pre className="text-sm">{JSON.stringify(openIdClaims, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Display noir inputs */}
            {showInputs && inputs && (
              <div className="my-4">
                <h2 className="text-xl font-semibold mb-2">Noir Inputs</h2>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                  <pre className="text-sm">{JSON.stringify(inputs, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Display proof information */}
            {proof && (
              <div className="my-4">
                <h2 className="text-xl font-semibold mb-2">Proof Generated</h2>
                <div className="bg-gray-100 p-4 rounded">
                  <p>✅ Proof has been generated successfully!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
