// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { loadCircuit, verifyProof } = require('noirjs'); // Ensure noirjs is installed

const app = express();
app.use(bodyParser.json());

// Load the circuit once on startup (adjust the path as needed)
let circuitPromise = loadCircuit('/zk-proofs/circuit/src/collateral.nr');

// POST endpoint to verify a proof
app.post('/verify-proof', async (req, res) => {
  const { proof, publicInputs } = req.body;

  // Basic input validation
  if (!proof || !publicInputs) {
    return res.status(400).json({ error: 'Both proof and publicInputs are required.' });
  }

  try {
    const circuit = await circuitPromise;
    const isValid = await verifyProof(circuit, proof, publicInputs);

    if (isValid) {
      // The proof is valid; proceed with the next step in your logic
      res.json({ valid: true });
    } else {
      res.status(400).json({ valid: false, error: 'Invalid proof.' });
    }
  } catch (err) {
    console.error('Error during proof verification:', err);
    res.status(500).json({ error: 'Server error during verification.' });
  }
});

// Start the server on a designated port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proof verification server is running on port ${PORT}`);
});
