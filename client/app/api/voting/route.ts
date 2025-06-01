import { NextResponse } from 'next/server';
import {
  getVotingById,
  addVoting,
  closeVoting,
  type Voting,
  addVote,
  getVotings,
} from '../../server/db/voting-db';
import { initializeServer } from '../../server/init';

// Initialize the server
initializeServer();

// GET /api/voting - Get all open votings
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Get specific voting
      const voting = getVotingById(Number(id));
      if (!voting) {
        return NextResponse.json({ error: 'Voting not found' }, { status: 404 });
      }
      return NextResponse.json(voting);
    }

    // Get all votings
    const votings = getVotings();
    return NextResponse.json(votings);
  } catch (error) {
    console.error('Error in GET /api/voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/voting - Add new voting or nullifier
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if ('title' in body && 'description' in body && 'startDate' in body && 'endDate' in body && 'options' in body) {
      // Add new voting
      const newVoting = addVoting(body);
      return NextResponse.json(newVoting, { status: 201 });
    }

    if ('electionId' in body && 'proof' in body && 'selectedOption' in body) {
      // Convert proof to Uint8Array
      const indices = Object.keys(body.proof.proof).map(Number);
      const proofBytes = new Uint8Array(indices.length);
      for (const key of indices) {
        proofBytes[key] = body.proof.proof[key.toString()];
      }
      // Submit vote
      const result = await addVote(body.electionId, {proof:proofBytes, publicInputs:body.proof.publicInputs}, body.selectedOption);
      if (result === 0) {
        return NextResponse.json({ success: true }, { status: 201 });
      } else if (result === -1) {
        return NextResponse.json({ error: 'Election not active' }, { status: 404 });
      } else if (result === -2) {
        return NextResponse.json({ error: 'Invalid proof submitted' }, { status: 400 });
      } else if (result === -3) {
        return NextResponse.json({ error: 'This account already cast a vote in this election' }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/voting - Close a voting
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Voting ID is required' },
        { status: 400 }
      );
    }

    const success = closeVoting(Number(id));
    if (!success) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 