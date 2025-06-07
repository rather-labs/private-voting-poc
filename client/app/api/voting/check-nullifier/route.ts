import { NextResponse } from 'next/server';
import { supabase } from '@/app/server/db/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    const nullifier = searchParams.get('nullifier');

    if (!electionId || !nullifier) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if the nullifier already exists
    const { data: existingNullifier, error: nullifierError } = await supabase
      .from('nullifiers')
      .select()
      .eq('nullifier', nullifier)
      .eq('voting_id', electionId)
      .single();

    if (nullifierError && nullifierError.code !== 'PGRST116') {
      throw nullifierError;
    }

    return NextResponse.json({ hasVoted: !!existingNullifier });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 