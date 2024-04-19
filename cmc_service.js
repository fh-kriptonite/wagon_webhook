// Import required modules
const express = require('express');
require('dotenv').config();

// Initialize Express app
const app = express();

// Start the server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`CMC server is running on port ${PORT}`);
});

// Start CMC service
const { startCMCService } = require("./controllers/cmc_listener_controller")
startCMCService();