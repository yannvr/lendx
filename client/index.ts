// import { compile, loadCircuit, generateProof, verifyProof } from 'noirjs';
import { compile, createFileManager } from "@noir-lang/noir_wasm";
import main from "../zk-proofs/circuit/src/main.nr?url";
import nargoToml from "../zk-proofs/circuit/Nargo.toml?url";

import { UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
const { program } = await getCircuit();
const noir = new Noir(program);
const backend = new UltraHonkBackend(program.bytecode);

import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url";
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);

export async function getCircuit() {
  const fm = createFileManager("/");
  const { body } = await fetch(main);
  const { body: nargoTomlBody } = await fetch(nargoToml);

  fm.writeFile("./src/main.nr", body);
  fm.writeFile("./Nargo.toml", nargoTomlBody);
  return await compile(fm);
}

async function handleVerification(event) {
  console.log("logs", "Handling verification... 🚀");
  event.preventDefault();

  const userBalanceValue = document.getElementById("user-balance").value;
  const requiredBalanceValue =
    document.getElementById("required-balance").value;

  // Load the updated circuit
  // const circuit = await getCircuit('/zkshow("logs", "Generating witness... ⏳");
  console.log("logs", "Generating witness... ⏳");

  const { witness } = await noir.execute({
    user_balance: userBalanceValue,
    required_balance: requiredBalanceValue,
  });

  console.log("logs", "Generated witness... ✅");

  console.log("logs", "Generating proof... ⏳");
  const proof = await backend.generateProof(witness);
  console.log("logs", "Generated proof... ✅");
  console.log("results", proof.proof);

  console.log("logs", "Verifying proof... ⌛", witness);
  const isValid = await backend.verifyProof(proof);
  console.log("logs", `Proof is ${isValid ? "valid" : "invalid"}... ✅`);

  // Generate the proof with both private inputs
  // const proofData = await generateProof(circuit, {
  //   user_balance,
  //   required_balance,
  // });

  // // Optionally, verify the proof locally for immediate feedback
  // const localValid = await verifyProof(
  //   circuit,
  //   proofData.proof,
  //   proofData.publicInputs
  // );
  // if (!localValid) {
  //   alert("Local proof verification failed.");
  //   return;
  // }

  // // Send the proof to the server for centralized verification
  // const response = await fetch("/verify-proof", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(proofData),
  // });
  // const result = await response.json();
  // if (result.valid) {
  //   alert("Proof verified successfully on the server!");
  // } else {
  //   alert("Server verification failed.");
  // }
}

document
  .getElementById("verification-form")
  .addEventListener("submit", handleVerification);
