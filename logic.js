const {Contract } = require('fabric-contract-api')

class testContract extends Contract{
    async addTask(ctx,deviceId,a,b,c){
        let detJson={
            a:a,
            b:b,
            c:c
        };
        await ctx.stub.putState(deviceId,Buffer.from(JSON.stringify(detJson)));
        const txId = ctx.stub.getTxID();
        console.log(deviceId + "  executed successfully and tx ID is " + txId);
        //getTxTimestamp()
        //Use Device ID instead of taskID - this will ensure there is no request spamming
        //addTask(args) will overwrite the older task
    }

    async removeTask(ctx,deviceId){
        await ctx.stub.deleteState(deviceId);
        const txId = ctx.stub.getTxID();
        console.log("Transaction ID : " + txId);
    }

    async queryTask(ctx,deviceId){
        let dataBinary = await ctx.stub.getState(deviceId);
        if(!dataBinary || dataBinary.toString().length <=0){
            throw new error('Device does not have any tasks pending');
        }
        let detJson = JSON.parse(dataBinary.toString());
        return JSON.stringify(detJson);
    }


}

module.exports = testContract;