import { verifyProof } from '@/app/utils/noir';
import type { CompiledCircuit, ProofData } from '@noir-lang/types';
import fs from 'fs';
import path from 'path';
import { addActiveVoting, addInactiveVoting } from './voting-status';

import JwtCircuitJSON from '@/public/circuit/jwtnoir.json' assert { type: 'json' };

export interface Voting {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'pending';
  maxVoters?: number;
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
export function readDB(): VotingDB {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Failed to read database');
  }
}

// Helper function to write to the database
export function writeDB(data: VotingDB): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Failed to write to database');
  }
}

// Get all open votings
export function getVotings(): Voting[] {
  const db = readDB();
  return db.votings;
}

// Get a specific voting by index
export function getVotingById(index: number): Voting | null {
  const db = readDB();
  return db.votings[index] || null;
}

// Add a new voting
export function addVoting(voting: Voting): Voting {
  const db = readDB();
  voting.results = voting.options.map(() => 0);
  const currentDate = new Date();
  const beginDate = new Date(voting.startDate);
  const endDate = new Date(voting.endDate);
  if (beginDate >= endDate) {
    throw new Error('Start date must be before end date');
  }
  if (beginDate > currentDate) {
    voting.status = 'pending';
  }
  else if (endDate <= currentDate) {
    voting.status = 'closed';
  }
  else {
    voting.status = 'active';
  }
  const index = db.votings.length;
  db.votings.push(voting);
  writeDB(db);
  
  if (voting.status === 'active') {
    // Add to active votings list
    addActiveVoting(index, voting.endDate);
  }
  else if (voting.status === 'pending') {
    // Add to inactive votings list
    addInactiveVoting(index, voting.startDate);
  }
  else {
    // Add to inactive votings list
    addInactiveVoting(index, voting.startDate);
  }  
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
export async function addVote(electionIndex: number, proof: ProofData, selectedOptionIndex: number) {
  const db = readDB();
  
  if (!db.votings[electionIndex] || db.votings[electionIndex].status !== 'active') {
    throw new Error('Election not active');
  }

  // Verify the proof
  const isValid = await verifyProof(JwtCircuitJSON as CompiledCircuit, proof as ProofData);
  if (!isValid) {
    throw new Error('Invalid proof submitted');
  }

  // Check if the nullifier already exists
  const nullifierExists = db.nullifiers.includes(proof.publicInputs[1]);
  if (nullifierExists) {
    throw new Error('This account already cast a vote in this election');
  }

  // Add the nullifier
  db.nullifiers.push(proof.publicInputs[1]);

  // Add the vote
  db.votings[electionIndex].results[selectedOptionIndex]++;
  writeDB(db);
}

