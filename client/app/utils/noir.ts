import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit, InputMap, ProofData } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import toast from "react-hot-toast";

export async function generateProof(circuit: CompiledCircuit, inputs: InputMap ): Promise<ProofData> {
  try {
    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    const noir = new Noir(circuit);
    toast.remove("toast-message");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "toast-message"});
    const { witness } = await noir.execute(inputs);
    toast.remove("toast-message");
  
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "toast-message"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 });
    toast.remove("toast-message");
    
    toast.loading("Generating proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await backend.generateProof(witness);
    toast.remove("toast-message");

    toast.loading("Verifying proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const verified = await backend.verifyProof(proof);
    toast.remove("toast-message");
    if (verified) {
      toast.success("Proof verified! 🎉", {duration: 15_000, id: "toast-message"});
    } else {
      toast.error("Proof verification failed! 🚫", {duration: 15_000, id: "toast-message"});
    }

    return {
      proof: proof.proof,
      publicInputs: proof.publicInputs
    }
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  

export async function verifyProof(circuit: CompiledCircuit, proof: ProofData ): Promise<boolean> {
  try { 
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 });
    console.log("Verifying proof... ⏳");
    const verified = await backend.verifyProof(proof);
    console.log("verified", verified)
    return verified;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("error", error)
    throw new Error(`Failed to verify proof: ${errorMessage}`);
  }
}  
