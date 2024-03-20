// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { createLendingPoolService, createLendingLendService, createLendingBorrowService, updatePoolService, createLendingRepaymentService, createLendingClaimInterestService } = require('./controllers/db_lending_services');
const abi = require('./ABI/lending.json');
const { ethers } = require('ethers');
require('dotenv').config();

// Initialize Express app
const app = express();

// Use body-parser middleware to parse incoming request bodies as JSON
app.use(bodyParser.json());

const iface = new ethers.Interface(abi);

// Define a route to handle incoming webhook POST requests
app.post('/webhook', (req, res) => {
  // Extract data from the request body
  const data = req.body;

  // Perform actions based on the received data
  console.log('Received data:', data);
  console.log("############################")

  try {
    if(data.length > 0) {
      const logCount = data[0].logs.length;
      if(logCount > 0) {
        const log = data[0].logs[logCount-1];
        const parsedLog = iface.parseLog(log);

        if(parsedLog.name == "PoolCreated") {
          createLendingPoolService(
              parseFloat(parsedLog.args[0]), 
              parsedLog.args[1], 
              process.env.BNB_CHAIN_NAME, 
              (parseInt(log.blockNumber, 16)).toString(),
              log.transactionHash);

        } else if(parsedLog.name == "Lend") {
          createLendingLendService(
            parseFloat(parsedLog.args[1]), 
            parsedLog.args[0], 
            (parsedLog.args[2]).toString(), 
            (parsedLog.args[3]).toString(), 
            (parseInt(log.blockNumber, 16)).toString(), 
            log.transactionHash, 
            process.env.BNB_CHAIN_NAME
          )

        } else if(parsedLog.name == "Borrow") {
          createLendingBorrowService(
            parseFloat(parsedLog.args[1]), 
            parsedLog.args[2], 
            (parsedLog.args[3]).toString(), 
            (parseInt(log.blockNumber, 16)).toString(), 
            log.transactionHash, 
            process.env.BNB_CHAIN_NAME
          )
          
          updatePoolService(
            parseFloat(parsedLog.args[1]), 
            2,
            process.env.BNB_CHAIN_NAME
          )

        } else if(parsedLog.name == "Repayment") {
          createLendingRepaymentService(
            parseFloat(parsedLog.args[1]), 
            parsedLog.args[2], 
            (parsedLog.args[3]).toString(), 
            (parseInt(log.blockNumber, 16)).toString(), 
            log.transactionHash, 
            process.env.BNB_CHAIN_NAME
          )

        } else if(parsedLog.name == "ClaimInterest") {
          createLendingClaimInterestService(
            parseFloat(parsedLog.args[1]), 
            parsedLog.args[2], 
            (parsedLog.args[3]).toString(), 
            (parsedLog.args[4]).toString(), 
            (parseInt(log.blockNumber, 16)).toString(), 
            log.transactionHash, 
            process.env.BNB_CHAIN_NAME
          );

          if(parseFloat(parsedLog.args[4]) > 0) {
              updatePoolService(
                  parseFloat(parsedLog.args[1]), 
                  3,
                  process.env.BNB_CHAIN_NAME
              )
          }
        }
      }
    } 
  } catch (error) {
    console.log(error)
  }

  // Respond with a success message
  res.status(200).json({ message: 'Webhook received successfully.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});

// Start CMC service
const { startCMCService } = require("./controllers/cmc_listener_controller")
startCMCService();