/**
 * @fileoverview Lora Network Layer
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */


//Network class
function network(device) {
	var network = this;
	network.device = device;
	network.joinStatus = false;
	network.messagingBusy = false;
	network.msgCount = 0;
}

//Returns promise. Calls radio api to send data. Resolves with parsed radio command response.
//Rejects if messaging busy,join status if false, or something goes wrong.
network.prototype.networkSendMessage = function(msgObj) {
	var network = this;
	return new Promise(function(resolve, reject) {
		if (network.joinStatus === false) {
			reject("Can't send message: Network is not joined");
		} else if (network.messagingBusy === true) {
			reject("Can't send message: Messaging is busy");
		} else {
			network.messagingBusy = true;
			network.device.sendData(msgObj)
				.then(function(value) {
					network.messagingBusy = false;

					//Check if sendData was successful
					if (value[0] === true) {
						network.msgCount++;
						console.log("Total Messages Sent (Atempted):", network.msgCount);
						// console.log("value array", value);
						value.shift();
						// console.log("rxArray array", value);
						resolve(value);
					} else {
						console.log("Couldn't send");
						reject(value[1]);
					}
				})
				.catch(function(err) {
					network.messagingBusy = false;
					reject(err);
					console.log("Couldn't send");
				});
		}
	});

};

//Calls radio api to check join status on an interval. Updates join status flag in network object.
network.prototype.networkCheckProcess = function(intervalTime) {
	var network = this;
	console.log("starting network process interval with ", intervalTime);
	var networkCheckProcessInterval = setTimeout(function() {
		var delayTime = 90000;
		network.device.getJoinStatus()
			.then(function(joinStatus) {
				if (joinStatus === true) {
					network.joinStatus = true;
					delayTime = 90000;
					console.log("Network is sane");
					return;
				} else {
					network.joinStatus = false;
					console.log("Attempting to rejoin network!");
					delayTime = 60000;
					return network.device.joinNetwork(networkObj);
				}
			})
			.then(function(response) {
				if (response && response[0] === true) {
					delayTime = 0;
				}
			})
			.then(function() {
				network.networkCheckProcess(delayTime); //restart networkCheckProcess
			})
			.catch(function(err) {
				console.log("err", err);
				network.networkCheckProcess(delayTime); //In case we have an error, we need to restart networkCheckProcess
			});

	}, intervalTime);
};

//Calls radio api to join network and starts networkCheckProccess() loop.
network.prototype.networkStart = function(networkObj) {
	var network = this;
	network.networkId = networkObj.networkId;
	network.networkKey = networkObj.networkKey;
	console.log("Joining network id:", networkObj.networkId, "with network key:", networkObj.networkKey);
	var promise = network.device.joinNetwork(networkObj)
		.then(function(response) {
			console.log("networkStart response", response);
			if (response[0]) {
				//network check immediately
				return network.networkCheckProcess(0);
			} else {
				//else try again in a minute
				return network.networkCheckProcess(60000);
			}
		})
		.catch(function(err) {
			console.log("err", err);
		});

	return promise;

};

//Returns network class instance
module.exports = function(device) {
	var instance = new network(device);
	return instance;
};
//yellow