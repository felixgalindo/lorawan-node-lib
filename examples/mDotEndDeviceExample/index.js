/**
 * @fileoverview End device example app using mDot
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */

var config = require("./config/index");
var mDot = require("../../index")(config);
var network = require("../../lib/endDeviceNetwork.js")(mDot);
var path = require('path');
var appDir = path.dirname(require.main.filename);
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
	var dataToSend = "Hello World Hello World Hello World Hello World";
	//var dataToSend = '\u0007';
	//var dataToSend = "Hello World";
}

console.log("dataToSend:", dataToSend);

msgObj = {
	payload: dataToSend,
	ackEnabled: false,
	port: 4
};

networkObj = {
	networkId: "FelixLora",
	networkKey: "password123"
};

var msgCount = 0;
var deviceId = '';
//var dataToSend = "Hello World Hello World Hello World Hello World Hello";
//Call radio api to init settings
setTimeout(function() {
	mDot.atSetFactoryDefaults()
		.then(function(value) {
			return mDot.atSetDebugLogLevel(0); //Disable debug
		})
		.then(function(value) {
			return mDot.atSetEchoMode(0); //Disable echo mode
		})
		.then(function() {
			return mDot.atSetRequireACK(0); //Acks off
		})
		.then(function() {
			return mDot.atSetLinkCheckCount(0); //Disable link check
		})
		.then(function() {
			return mDot.atSetLinkCheckThreshold(5); //Set join status to 0 when 5 LCC fail
		})
		.then(function() {
			return mDot.atSetJoinRetries(0); //off for now later maybe Retry to rejoin 255 times 
		})
		.then(function() {
			return mDot.atSetFrequencySubBand(7); //sub-band 7
		})
		.then(function() {
			return mDot.atSetPublicNetworkMode(1);
		})
		.then(function() {
			return mDot.atSetTransmitPower(19);
		})
		.then(function() {
			return mDot.atSetTXDataRate("DR3"); //Spreading factor 6-10, higher SF = slower data rate,smaller payload,longer distance
		})
		.then(function() {
			return mDot.atSetAdaptiveDataRate(0); //adr off
		})
		.then(function() {
			return mDot.atSaveConfigurations();
		})
		.then(function() {
			return mDot.atReset();
		})
		.delay(5000).then(function() {
			return network.networkStart(networkObj); // call network api to start network
		})
		.then(function() {
			console.log("Starting messaging loop");
			messageLoop(); //starts messaging loop
		})
		.catch(function(err) {
			console.log("err", err);
		});


}, 5000);

//Calls network api to send message over network
var messageLoop = function() {
	var snr, rssi;
	setTimeout(function() {
		network.networkSendMessage(msgObj)
			.then(function(response) {
				//console.log("send message response", response);
				if (response.length) { //Check for rx messages
					for (var j = 0; j < response.length; j++) {
						var data = hex_to_ascii(response[j]);
						console.log("Received data from gateway:", data);
						rxCount++;
					}
					mDot.atGetRSSI()
						.then(function(value) {
							rssi = (value[0].split(','))[0];
							console.log("last packet rssi:", rssi);
							return mDot.atGetSNR();
						})
						.then(function(value) {
							snr = (value[0].split(','))[0];
							console.log("last packet snr:", snr);
							rxLog.info(mDot.deviceEUIShort, ",", data, ",", snr, ",", rxCount);
						})
						.catch(function(err) {
							console.log("err", err);
						});
				}
			})
			.catch(function(err) {
				console.log("err", err);
			});
		messageLoop();
	}, 5000);
};

function hex_to_ascii(str1) {
	var hex = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}