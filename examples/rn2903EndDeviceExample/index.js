/**
 * @fileoverview End device example app using RN2903
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */

var config = require("./config/index");
var device = require("../../index")(config);
var path = require('path');
var appDir = path.dirname(require.main.filename);
var network = require("../../lib/endDeviceNetwork.js")(device);
var winston = require("winston");
var rxLog = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)(),
		new(winston.transports.File)({
			filename: appDir + '/logs/rxLog.log'
		})
	]
});
var rxCount = 0;

//Choose your payload....I use script arguments to make it easier for multiple test
//var dataToSend = "Hello World";
var dataToSend = process.argv[2];
if (process.argv[2] !== undefined && process.argv[2] !== null) {} else {
	var dataToSend = "Hello World";
	//var dataToSend = '\u0007';
	//var dataToSend = "Hello World";
}

//Contruct a hex encoded json object string 
console.log("dataToSend:", dataToSend);
var payload = {
	msg: dataToSend
};
payload = JSON.stringify(payload);
var string = new Buffer(payload);
string = string.toString("hex");

//Construct message object containing payload and message configurations 
msgObj = {
	payload: payload, //some string, in this case, a hex encoded json object string 
	ackEnabled: false,
	port: 1 //bug with receiving downlinks when port is not 1, see RN2903.prototype.sendData 
};

networkObj = {
	networkId: "000CC68FFFE1609B", //Office App
	//000CC68FFFE16093 //home app
	networkKey: "bd32aab41c54175e9060d86f3a8b7f49",
	joinMode: "otaa"
	// joinMode: "abp"
};


setTimeout(function() {
	device.sysFactoryReset()
		.then(function() {
			return device.macSetADR("on"); //Set adr to off
		})
		.then(function() {
			return setSubBandChannels(); //enable all channels for subband 7. disable rest.
		})

		// Public mode settings for raspberry pi gateway (works)
		.then(function() {
			return device.macSetSyncWord("34"); //Set sync word
		})
		.then(function() {
			return device.macSetRxDelay1(1000);
		})
		// .then(function() {
		// 	return device.macGetRx2();
		// })
		.then(function() {
			return device.macSetRx2(8, 923300000);
		})

		// 	//Private mode settings for raspberry pi gateway (does not work)
		// .then(function() {
		// 		return device.macSetSyncWord("12"); //Set sync word
		// 	})
		// 	.then(function() {
		// 		return device.macSetRxDelay1(1000);
		// 	})
		// 	// .then(function() {
		// 	// 	return device.macGetRx2();
		// 	// })
		// 	.then(function() {
		// 		return device.macSetRx2(12, 923300000); 
		// 	})

		//This is for abp, move this stuff!!!!!
		// .then(function() {
		// 		return device.macSetDeviceAddress("ABCDEF01");
		// 	})
		// 	.then(function() {
		// 		return device.macSetNetworkKey("bd32aab41c54175e9060d86f3a8b7f49");
		// 	})
		.then(function() {
			return device.macGetDeviceEui();
		})
		.then(function(eui) {
			console.log("dev eui:", eui);
			return device.macGetDeviceAddress(); //set TX power to 10 (max)
		})
		.then(function(addr) {
			console.log("dev addr:", addr);
			return device.macSetPowerIndex(10); //set TX power to 10 (max)
		})
		.then(function() {
			return device.macSetDataRate(3); //set data rate to 3
		})
		.then(function() {
			return device.macSetRetx(0);
		})
		.then(function() {
			return device.macSetLinkCheck(0); //link check off
		})
		.then(function() {
			return device.macSetADR("on"); //set adr on
		})
		.then(function() {
			return device.macSave(); //save settings
		})
		.delay(1000).then(function() {
			return network.networkStart(networkObj); //call network api to start network
		})
		.then(function() {
			console.log("Starting messaging loop");
			messageLoop();
		})
		.then(function() {
			return device.macSave(); //save settings again (network key, eui,etc.)
		})
		.catch(function(err) {
			console.log("err", err);
		});
}, 5000);


//calls network api to send message over network on an interval
var messageLoop = function() {
	setTimeout(function() {
		network.networkSendMessage(msgObj)
			.then(function(response) {
				console.log("send message response", response);
				if (response.length) { //Check for rx messages
					for (var j = 0; j < response.length; j++) {
						var data = hex_to_ascii(response[j]);
						console.log("Received data from gateway:", data);
						rxCount++;
					}
					device.writeToSerial('radio get snr')
						.then(function(snr) {
							console.log("snr from last packet:", snr);
							rxLog.info(device.deviceEUIShort, ",", data, ",", snr[0], ",", rxCount);
						})
						.catch(function(err) {
							console.log("err", err);
						});
				}
			})
			.then(function() {
				device.macGetDr(); //save settings
			})
			.then(function() {
				device.macGetPowerIndex(); //save settings
			})
			.catch(function(err) {
				console.log("err", err);
			});


		messageLoop();
	}, 60000);
};


function hex_to_ascii(str1) {
	var hex = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}

var setSubBandChannels = function() {
	return new Promise(function(resolve, reject) {
		var ch = 0;
		var interval = setInterval(function() {
			// if ((ch <= 47 || ch >= 56) && ch != 70) { //for multitech gateway
			// 	device.macSetChannelStatus(ch, "off")
			// 		.catch(function(err) {
			// 			console.log("err", err);
			// 		});
			// } else {
			if ((ch >= 8) && ch < 64) { //for raspberry pi gateway
				device.macSetChannelStatus(ch, "off")
					.catch(function(err) {
						console.log("err", err);
					});
			} else {
				device.macSetChannelStatus(ch, "on")
					.catch(function(err) {
						console.log("err", err);
					});
			}
			ch++;

			if (ch > 71) {
				clearInterval(interval);
				resolve(true);
			}

		}, 100);
	});
}