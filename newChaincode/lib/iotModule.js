'use strict'


//For hyperledger 2.2.4
const { Contract } = require('fabric-contract-api');
class iotModule extends Contract{

    //some test code, invoke first time after installing chaincode
    //query this after install, see how it runs

    async initLedger(ctx){
        const sampletask = [
            {
                taskId : '10001',
                someTask : 'do something',
                someValue : 'band 1'
            },
            {
                taskId : '10002',
                someTask : 'do something else',
                someValue : 'band 2'
            }
        ];

        for(const task of sampletask){
            task.docType = 'task';
            await ctx.stub.putState(task.taskId,Buffer.from(JSON.stringify(task)));
            console.log("Sample task ${task.taskId} has been initialized");
        }
    }

    async createtask(ctx,taskId,someTask,someValue){
        const task = {
            taskId : taskId,
            someTask : someTask,
            someValue : someValue
        };
        ctx.stub.putState(task.taskId,Buffer.from(JSON.stringify(task)));
        return JSON.stringify(task);
    }

    async readTask(ctx,taskId){
        const taskJSON = await ctx.stub.getState(taskId);
        if(!taskJSON || taskJSON.length === 0){
            throw new Error('The task ${taskId} does not exist');
        }
        return taskJSON.toString();
    }

    async deleteTask(ctx,taskId){
        const exists = await this.taskExists(ctx,taskId);
        if(!exists){
            throw new Error("The task ${taskId} does not exist");
        }
        return ctx.stub.deleteState(taskId);
    }

    async taskExists(ctx, taskId) {
        const taskJSON = await ctx.stub.getState(taskId);
        return taskJSON && taskJSON.length > 0;
    }

    async someValueChange(ctx,taskId,newValue){
        const taskString = await this.readTask(ctx,taskId);
        const task = JSON.parse(taskString);
        task.someValue  = newValue;
        return ctx.stub.putState(taskId,Buffer.from(JSON.stringify(task)));
    }

    async queryTask(ctx,taskId){
        const taskDetails =await this.readTask(ctx,taskId);
        console.log(taskDetails);
    }

    //function returns all tasks enrolled, would not recommend using this at high loads
    //just for testing
    //taken directly from hyperledger docs
    async GetAllTasks(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    //calls, console logs
    async printAllTasks(ctx){
        const allTasks = await this.GetAllTasks(ctx);
        console.log(JSON.parse(allTasks));
    }


}

module.exports = iotModule;