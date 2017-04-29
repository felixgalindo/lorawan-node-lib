/**
 * @fileoverview Handles serial port command communication via command queue system
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */

var Promise = require('bluebird');
var com = require("serialport");

//CmdInterface class
function cmdInterface(serialOptions, respHandlerObj, device) {
	console.log("cmdInterface starting...");
	var cmdInterface = this;
	var string = "";
	cmdInterface.commandResponse = [];
	cmdInterface.writeQueue = [];
	cmdInterface.cmdId = 0;
	cmdInterface.failedCount = 0;
	cmdInterface.responseHandler = respHandlerObj;
	cmdInterface.device = device;

	cmdInterface.serialPort = Promise.promisifyAll(new com.SerialPort(serialOptions.serialport, {
		baudrate: serialOptions.baudRate
	}));


	cmdInterface.serialPort.on('open', function(err) {
		console.log('Serial Port Open:', serialOptions.serialport, 'with baudrate', serialOptions.baudRate);
		cmdInterface.processWriteQueue(100); //start write queue

		if(err)
		{
			console.log(err);
		}
	});

	cmdInterface.serialPort.on('data', function(data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i] > 31) {
				string += String.fromCharCode(data[i]);
			} else {

				if (string) {
					cmdInterface.commandResponse.push(string);
				}
				string = "";
			}
		}

	});
}

//Function adds command to command queue array.
cmdInterface.prototype.addToWriteQueue = function(cmdType, cmdString) {
	var cmdInterface = this;
	var promise = new Promise(function(resolve, reject) {
		var queueObj = {
			cmdType: cmdType,
			cmdString: cmdString,
			resolve: resolve,
			reject: reject,
			id: cmdInterface.cmdId++,
			tries: 0
		};
		cmdInterface.writeQueue.push(queueObj);
		console.log("Pushing to queue cmdId : ", queueObj.id, "cmdSrting", queueObj.cmdString);
	});
	return promise;
};

//Clears cmd response array
cmdInterface.prototype.clearCmdResponse = function(timeDelay) {
	var cmdInterface = this;
	cmdInterface.commandResponse = [];
	return;
};

//Loops through command queue array.
//Proccesses write commands in the write queue and resolves/rejects its associated promise.
cmdInterface.prototype.processWriteQueue = function(timeDelay) {
	var cmdInterface = this;
	var cmdInQueue;
	var timeout = setTimeout(function() {
		if (cmdInterface.writeQueue.length) {
			cmdInQueue = cmdInterface.writeQueue[0];
			cmdInQueue.tries++;
			if (cmdInQueue.tries < 3) {
				console.log("Processing Cmd Id", cmdInQueue.id, "cmdSrting", cmdInQueue.cmdString);
				cmdInterface.writeCmd(cmdInQueue)
					.then(function(value) {
						console.log("Command Id:",cmdInQueue.id,"response", value);
						cmdInterface.writeQueue.shift();
						cmdInQueue.resolve(value);
						cmdInterface.processWriteQueue(100);
					})
					.catch(function(err) {
						cmdInQueue.reject(err);
						cmdInterface.processWriteQueue(100);
					});
			} else {
				//Throw away command from queue if it failed 2 times
				console.log("Reach retry limit for Cmd Id", cmdInQueue.id, "cmdSrting", cmdInQueue.cmdString);
				cmdInterface.failedCount++;
				cmdInterface.writeQueue.shift();
				cmdInQueue.reject("retry limit reached!");
				cmdInterface.processWriteQueue(100);
			}
		} else {
			cmdInterface.processWriteQueue(100);
		}
	}, timeDelay);
};

//Calls appropiate command response handler
cmdInterface.prototype.getCmdResponse = function(cmdObj) {
	var cmdInterface = this;
	//console.log("Calling responseHandler for cmd type:",cmdObj.cmdType);
	return cmdInterface.responseHandler[cmdObj.cmdType](cmdInterface.commandResponse);
};

//Writes command to radio and calls response handler
cmdInterface.prototype.writeCmd = function(cmdObj) {
	var cmdInterface = this;
	return new Promise(function(resolve, reject) {
		if (cmdInterface.serialPort.isOpen()) {
			var string = cmdObj.cmdString + "\r\n";
			cmdInterface.clearCmdResponse();
			console.log("Writing Cmd:", string);
			cmdInterface.serialPort.writeAsync(string)
				.then(function() {
					cmdInterface.awaitingResponse = true;
					return cmdInterface.getCmdResponse(cmdObj); 
				})
				.then(function(response) {
					cmdInterface.awaitingResponse = false;
					resolve(response);
				})
				.catch(function(err) {
					cmdInterface.awaitingResponse = false;
					reject(err);
				});
		} else {
			reject("Serial port not open!!!");
		}
	});
};

module.exports = function(serialOptions, respHandlerObj, device) {
	var instance = new cmdInterface(serialOptions, respHandlerObj,device);
	return instance;
};