"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { generateInputs } from "noir-jwt";
import { generateProof } from "../utils/noir";
import type { CompiledCircuit, InputMap, ProofData } from "@noir-lang/types";
import type { Voting } from "../server/db/voting-db";
import JwtCircuitJSON from '@/public/circuit/jwtnoir.json' assert { type: 'json' };
import Tooltip from "./Tooltip";
import { tooltipTexts } from "../utils/tooltipTexts";

interface ExtendedSession {
  idToken?: string;
  [key: string]: unknown;
}

interface ExtendedProofData extends ProofData {
  submitted?: boolean;
}

interface ProofGenerationProps {
  voting: Voting;
  setVoting: (voting: Voting) => void;
}

export default function VotingProofGeneration({ voting, setVoting }: ProofGenerationProps) {
  const { data: session, status } = useSession();
  const params = useParams();
  const [proof, setProof] = useState<ExtendedProofData | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  async function getInputs() {
    if (status === "authenticated" && session) {
      try {
        setError(null);

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

        const generatedInputs = await generateInputs({
          jwt: extendedSession.idToken,
          pubkey,
          maxSignedDataLength: 1024,
        });
        return generatedInputs;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get inputs";
        setError(errorMessage);
        return null;
      } 
    }
    return null;
  }

  async function checkNullifier(nullifier: string) {
    try {
      const response = await fetch(`/api/voting/check-nullifier?electionId=${params.id}&nullifier=${nullifier}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to check nullifier');
      }
      const { hasVoted } = await response.json();
      setHasVoted(hasVoted);
      if (hasVoted) {
        setMessage('This account has already cast a vote in this election');
      } 
    } catch (err) {
      console.error('Error checking nullifier:', err);
      setError(err instanceof Error ? err.message : 'Failed to check if you have voted');
    }
  }

  async function generateNoirProof() {
    try {
      setIsGeneratingProof(true);
      setError(null);
      const inputs = await getInputs() as InputMap;
      // Add election index to inputs
      inputs.election_id = Number(params.id);
      const generatedProof = await generateProof(JwtCircuitJSON as CompiledCircuit, inputs as InputMap);
      
      setProof(generatedProof);
      // Check if the nullifier has already voted
      await checkNullifier(generatedProof.publicInputs[1]);
    } catch (err: unknown) {
      console.error("Error generating proof:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate proof";
      setError(errorMessage);
    } finally {
      setIsGeneratingProof(false);
    }
  }

  async function submitVote() {
    if (!proof || selectedOption === null || hasVoted) return;
              
    try {
      setIsSubmittingVote(true);
      // Store the nullifier and vote
      const response = await fetch('/api/voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          electionId: Number(params.id),
          proof: proof,
          selectedOption: selectedOption,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit vote');
      }

      // Show success message
      setProof({ ...proof, submitted: true });
      
      // Update the voting results without page reload
      const updatedVoting = await fetch(`/api/voting?id=${Number(params.id)}`).then(res => res.json());
      setVoting(updatedVoting);      
      setHasVoted(true);
      setMessage('Your vote has been submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmittingVote(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="voting-option" className="block text-sm font-medium text-black mb-1">
          Select your vote
        </label>
        <select
          id="voting-option"
          value={selectedOption === null ? '' : selectedOption}
          disabled={isSubmittingVote || hasVoted}
          onChange={(e) => setSelectedOption(Number(e.target.value))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm text-black"
        >
          <option value="" className="text-black">Choose an option</option>
          {voting.options.map((option, index) => (
            <option key={option.name} value={index} className="text-black">
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {status === "authenticated" ? (
        <div className="flex flex-col space-y-4">
          <Tooltip text={tooltipTexts.generateProof} showIcon position="top-right">
            <button
              type="button"
              onClick={generateNoirProof}
              disabled={isGeneratingProof || isSubmittingVote }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
            >
              {isGeneratingProof ? "Generating..." : "Generate Proof"}
            </button>
          </Tooltip>

          <Tooltip text={tooltipTexts.verifyProof} showIcon position="top-right">
            <button
              type="button"
              onClick={submitVote}
              disabled={!proof || selectedOption === null || isSubmittingVote || isGeneratingProof || hasVoted}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
            >
              {isSubmittingVote ? "Verifying Proof & Submitting Vote..." : "Verify Proof & Submit Vote"}
            </button>
          </Tooltip>
        </div>
      ) : (
        <div className="text-sm text-black">
          Please sign in to vote
        </div>
      )}

      {hasVoted && (
        <div className="text-sm text-black">
          {message}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
