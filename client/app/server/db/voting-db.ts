import { verifyProof } from '@/app/utils/noir';
import type { CompiledCircuit, ProofData } from '@noir-lang/types';
import fs from 'fs';
import path from 'path';

import JwtCircuitJSON from '@/public/circuit/jwtnoir.json' assert { type: 'json' };



// Types
export interface Voting {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
  maxVoters: number;
  isPublic: boolean;
  options: {
    name: string;
    description: string;
  }[];
  results: number[];
}


interface VotingDB {
  votings: Voting[];
  nullifiers: string[];
}

// Database file path
const DB_PATH = path.join(process.cwd(), 'app/server/db/voting-db.json');

// Helper function to read from the database
function readDB(): VotingDB {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Failed to read database');
  }
}

// Helper function to write to the database
function writeDB(data: VotingDB): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Failed to write to database');
  }
}

// Get all open votings
export function getOpenVotings(): Voting[] {
  const db = readDB();
  return db.votings.filter(v => v.status === 'active');
}

// Get a specific voting by index
export function getVotingById(index: number): Voting | null {
  const db = readDB();
  return db.votings[index] || null;
}

// Add a new voting
export function addVoting(voting: Voting): Voting {
  const db = readDB();
  db.votings.push(voting);
  writeDB(db);
  return voting;
}

// Close a voting
export function closeVoting(index: number): boolean {
  const db = readDB();
  if (!db.votings[index]) {
    return false;
  }
  db.votings[index].status = 'closed';
  writeDB(db);
  return true;
}

// Add a vote to a voting
export async function addVote(electionIndex: number, proof: ProofData, selectedOptionIndex: number): Promise<Number> {
  const db = readDB();
  
  if (!db.votings[electionIndex] || db.votings[electionIndex].status !== 'active') {
    return -1;
  }

  // Verify the proof
  const isValid = await verifyProof(JwtCircuitJSON as CompiledCircuit, proof as ProofData);
  if (!isValid) {
    return -2;
  }

  // Check if the nullifier already exists
  const nullifierExists = db.nullifiers.includes(proof.publicInputs[1]);
  if (nullifierExists) {
    return -3;
  }

  // Add the nullifier
  db.nullifiers.push(proof.publicInputs[1]);

  // Add the vote
  db.votings[electionIndex].results[selectedOptionIndex]++;
  writeDB(db);
  return 0;
}

