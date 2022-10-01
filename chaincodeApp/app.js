'use strict'

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js');
const express = require('express');
const app = express()
const bodyParser = require('body-parser')



const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

const PORT = 4040;
app.use(bodyParser.json());
app.listen(PORT,()=>{
    console.log("Started to listen on " + PORT);
})
app.post('/', (req, res) => {
        const { body } = req;
        main(body);
    })




function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main(reqBody) {
    const ccp = buildCCPOrg1();
    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
    // setup the wallet to hold the credentials of the application user
    const wallet = await buildWallet(Wallets, walletPath);

    // in a real application this would be done on an administrative flow, and only once
    await enrollAdmin(caClient, wallet, mspOrg1);

    // in a real application this would be done only when a new user was required to be added
    // and would be part of an administrative flow
    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

    // Create a new gateway instance for interacting with the fabric network.
    // In a real application this would be done as the backend server session is setup for
    // a user that has been verified.
    const gateway = new Gateway();

    try{

        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });

        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);

        // await contract.submitTransaction('InitLedger');
        // console.log('*** Result: committed');

       let result =  await contract.submitTransaction(...reqBody);
        console.log(' Result ; ' + prettyJSONString(result.toString()));

    }
    catch(error){
        console.log(" Error ; "+ error )
    }
    finally {
        gateway.disconnect() 
     }


}