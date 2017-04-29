/**
 * @fileoverview Provides API for using Microchip's RN2903 LoRa radio.
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */

var Promise = require('bluebird');

//Add support for radio commands


/**
 * RN2903 Class
 * @constructor
 * @param {Object} options - Object of device configurations.  
 */
function RN2903(options) {
	var RN2903 = this;
	RN2903.options = options;
	RN2903.deviceType = "rn2903";
	RN2903.generateCmdObject();
	RN2903.cmdInterface = require("../lib/cmdInterface.js")(RN2903.options.serialPortOptions, RN2903.responseHandler, RN2903);
	// RN2903.setBaudRate(RN2903.options.serialPortOptions.baudRate)
	// 	.catch(function(err) {
	// 		console.log("err", err);
	// 	});
	RN2903.sysGetHweui()
		.then(function(response) {
			RN2903.deviceEUI = response[0];
			RN2903.deviceEUIShort = RN2903.deviceEUI.substr(RN2903.deviceEUI.length - 4);
			console.log("RN2903 EUI:", RN2903.deviceEUI);
		})
		.catch(function(err) {
			console.log("err", err);
		});

	console.log("RN2903 options:", RN2903.options);
}

/**
 * Writes "sys sleep <length>" command to the write queue.
 * Puts the system to Sleep for the specified number of milliseconds. The
 * module can be forced to exit from Sleep by sending a break condition followed by a
 * 0x55 character at the new baud rate.
 * @param {Number} value - decimal number representing the number of milliseconds the system is
 * put to Sleep, from 100 to 4294967296.
 * @function sysSetSleep
 * @memberof RN2903
 * @return {Promise} A promise that fulfills with an array containing the command response 
 * or that is rejected with an error if the command fails. 
 * <br>
 * array[0] : <li> "ok" - after the system gets back from Sleep mode
 *            <li> "invalid_param" if the length is not valid
 */
RN2903.prototype.sysSetSleep = function(value) {
	var cmdType = "sys sleep";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/**
 * Adds "sys reset" command to the write queue.
 * This command resets and restarts the RN2903 module. Stored internal configurations
 * will be loaded automatically upon reboot.
 * @function sysReset
 * @memberof RN2903
 * @return {Promise} A promise that fulfills with an array containing the command response 
 * or that is rejected with an error if the command fails. 
 * <br>
 * array[0] : <li> "RN2903 X.Y.Z MMM DD YYYY HH:MM:SS" - where X.Y.Z is the firmware
 * version, MMM is month, DD is day, HH:MM:SS is hour, minutes, seconds (format: [HW]
 * [FW] [Date] [Time]). [Date] and [Time] refer to the release of the firmware.
 */
RN2903.prototype.sysReset = function() {
	var cmdType = "sys reset";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/**
 * Adds "sys eraseFW" command to the write queue.
 * This command deletes the current RN2903 module application firmware and prepares
 * it for firmware upgrade. The RN2903 module bootloader is ready to receive new
 * firmware.
 * @function sysEraseFW
 * @memberof RN2903
 * @return {Promise} A promise that fulfills with true if the command is sent
 * or that is rejected with an error if the command fails. 
 * <br>
 */
RN2903.prototype.sysEraseFW = function() {
	var cmdType = "sys eraseFW";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.4 sys factoryRESET
Response: RN2903 X.Y.Z MMM DD YYYY HH:MM:SS, where X.Y.Z is the firmware
version, MMM is month, DD is day, HH:MM:SS is hour, minutes, seconds (format: [HW]
[FW] [Date] [Time]). [Date] and [Time] refer to the release of the firmware.
This command resets the module’s configuration data and user EEPROM to factory
default values and restarts the module. After factoryRESET, the RN2903 module will
automatically reset and all configuration parameters are restored to factory default
values.
Example: sys factoryRESET // Restores factory default values*/
RN2903.prototype.sysFactoryReset = function() {
	var cmdType = "sys factoryRESET";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};


/*2.3.5.1 sys set nvm <address> <data>
<address>: hexadecimal number representing user EEPROM address, from 300 to 3FF
<data>: hexadecimal number representing data, from 00 to FF
Response: ok if the parameters (address and data) are valid
invalid_param if the parameters (address and data) are not valid
This command allows the user to modify the user EEPROM at <address> with the
value supplied by <data>. Both <address> and <data> must be entered as hex
values. The user EEPROM memory is located inside the MCU on the module.
Example: sys set nvm 300 A5 // Stores the value 0xA5 at user EEPROM
address 0x300.*/
RN2903.prototype.sysSetNvm = function(address, data) {
	var cmdType = "sys set nvm";
	var cmdString = cmdType + " " + address + " " + data;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.5.2 sys set pindig <pinname> <pinstate>
<pinname>: string representing the pin. Parameter values can be: GPIO0-GPIO13,
UART_CTS, UART_RTS, TEST0, TEST1
<pinstate>: decimal number representing the state. Parameter values can be: 0 or
1.
Response: ok if the parameters (<pinname>, <pinstate>) are valid
invalid_param if the parameters (<pinname>, <pinstate>) are not
valid
This command allows the user to modify the unused pins available for use by the
module. The selected <pinname> is driven high or low depending on the desired
<pinstate>.
Default: GPIO0-GPIO13, UART_CTS, UART_RTS, TEST0 and TEST1 are driven low
(value 0).
Example: sys set pindig GPIO5 1 // Drives GPIO5 high 1, VDD.*/
RN2903.prototype.sysSetPinDigital = function(pinname, pinstate) {
	var cmdType = "sys set pindig";
	var cmdString = cmdType + " " + pinname + " " + pinstate;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.5.3 sys set pinmode <pinname> <pinmode>
<pinname>: string representing the pin. Parameter values can be: GPIO0-GPIO13,
UART_CTS, UART_RTS, TEST0, TEST1
<pinmode>: string representing the mode. It can be: digout, digin, ana
Response: ok if the parameters (<pinname>, <pinmode>) are valid
invalid_param if the parameters (<pinname>, <pinmode>) are not
valid.
This command allows the user to modify the unused pins available for use by the
module and set them as digital output, digital input or analog.
Default: GPIO0-GPIO14, UART_CTS, UART_RTS, TEST0 and TEST1 are output pins,
driven low (value 0).
Example: sys set pinmode GPIO5 ana //Sets pin GPIO5 as analog pin*/
RN2903.prototype.sysSetPinMode = function(pinname, pinstate) {
	var cmdType = "sys set pinmode";
	var cmdString = cmdType + " " + pinname + " " + pinstate;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.6.1 sys get ver
Response: RN2903 X.Y.Z MMM DD YYYY HH:MM:SS, where X.Y.Z is the firmware
version, MMM is month, DD is day, HH:MM:SS is hour, minutes, seconds (format: [HW]
[FW] [Date] [Time]). [Date] and [Time] refer to the release of the firmware.
This command returns the information related to the hardware platform, firmware
version, release date and time-stamp on firmware creation.
Example: sys get ver // Returns version-related information.*/
RN2903.prototype.sysGetVersion = function() {
	var cmdType = "sys get ver";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.6.2 sys get nvm <address>
<address>: hexadecimal number representing user EEPROM address, from 300 to
3FF
Response: 00–FF (hexadecimal value from 00 to FF) if the address is valid
invalid_param if the address is not valid
This command returns the data stored in the user EEPROM of the RN2903 module at
the requested <address> location.
Example: sys get nvm 300 // Returns the 8-bit hex value stored at
300.*/
RN2903.prototype.sysGetNvm = function(value) {
	var cmdType = "sys get nvm";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.6.3 sys get vdd
Response: 0–3600 (decimal value from 0 to 3600)
This command requires the RN2903 module to do an ADC conversion on the VDD. The
measurement is converted and returned as a voltage (mV).
Example: sys get vdd // Returns mV measured on the VDD
module.*/
RN2903.prototype.sysGetVdd = function() {
	var cmdType = "sys get vdd";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.6.4 sys get hweui
Response: hexadecimal number representing the preprogrammed EUI node address
This command reads the preprogrammed EUI node address from the RN2903 module.
The value returned by this command is a globally unique number provided by
Microchip.
Example: sys get hweui // Reads the preprogrammed EUI node
address.*/
RN2903.prototype.sysGetHweui = function() {
	var cmdType = "sys get hweui";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.6.5 sys get pindig <pinname>
<pinname>: string representing the pin. Parameter values can be: GPIO0-GPIO13,
UART_CTS, UART_RTS, TEST0, TEST1
Response: a bit representing the state of the pin, either ‘0’ (low) or ‘1’ (high), if
<pinname> is valid
invalid_param if <pinname> is not valid
This command returns the state of the queried pin, either ‘0’ (low) or ‘1’ (high).
Example: sys get pindig GPIO5 // Returns the state of GPIO5.*/
RN2903.prototype.sysGetPinDigital = function(value) {
	var cmdType = "sys get pindig";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.3.6.6 sys get pinana <pinname>
<pinname>: string representing the pin. Parameter values can be:
GPIO0-GPIO3, GPIO5-GPIO13
Response: decimal number representing the 10-bit analog value, from 0 to 1023, if
<pinname> is valid, and invalid_param if <pinname> is not valid
This command returns a 10-bit analog value for the queried pin, where 0 represents
0V and 1023 represents VDD. An ADC conversion on the VDD pin can be performed
by using the command sys get vdd.
Example: sys get pinana GPIO0 // Returns the state of GPIO0*/
RN2903.prototype.sysGetPinAnalog = function(value) {
	var cmdType = "sys get pinana";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.1 mac reset
Response: ok
This command will automatically reset the software LoRaWAN stack and initialize it
with the parameters for the selected band.
Example: mac reset*/
RN2903.prototype.macReset = function() {
	var cmdType = "mac reset";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.2 mac tx <type> <portno> <data>
<type>: string representing the uplink payload type, either cnf or uncnf
(cnf – confirmed, uncnf – unconfirmed)
<portno>: decimal number representing the port number, from 1 to 223
<data>: hexadecimal value. The length of <data> bytes capable of being
transmitted are dependent upon the set data rate (please refer to the LoRaWAN™
Specification for further details).
Response: this command may reply with two responses. The first response will be
received immediately after entering the command. In case the command is valid (ok
reply received), a second reply will be received after the end of the data transfer. Please
refer to the LoRaWAN™ Specification for further details.*/
RN2903.prototype.macTx = function(type, portno, data) {
	var cmdType = "mac tx";
	var cmdString = cmdType + " " + type + " " + portno + " " + data;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.3 mac join <mode>
<mode>: string representing the join procedure type (case-insensitive), either otaa
or abp (otaa – over-the-air activation, abp – activation by
personalization).
Response: this command may reply with two responses. The first response will be
received immediately after entering the command. In case the command is valid (ok
reply received) a second reply will be received after the end of the join procedure.
Please refer to the LoRaWAN™ Specification for further details. */
RN2903.prototype.macJoin = function(value) {
	var cmdType = "mac join";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.4 mac save
Response: ok
The mac save command must be issued after configuration parameters have been
appropriately entered from the mac set <cmd> commands. This command will save
LoRaWAN protocol configuration parameters to EEPROM. Upon the next system reset
the LoRaWAN protocol configuration will be initialized with the last saved parameters.
The system may reset by power cycling or a pulse on the MCLR pin as well as by using
sys reset. */
RN2903.prototype.macSave = function() {
	var cmdType = "mac save";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.5 mac forceENABLE
Response: ok
The network can issue a certain command (Duty Cycle Request frame with parameter
255) that would require the RN2903 module to go silent immediately. This mechanism
disables any further communication of the module, effectively isolating it from the
network. Using mac forceENABLE, after this network command has been received,
restores the module’s connectivity by allowing it to send data.*/
RN2903.prototype.macForceEnable = function() {
	var cmdType = "mac forceENABLE";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.6 mac pause
Response: 0 – 4294967295 (decimal number representing the number of milliseconds
the mac can be paused)
This command pauses the LoRaWAN stack functionality to allow transceiver (radio)
configuration. Through the use of mac pause, radio commands can be generated
between a LoRaWAN protocol uplink application (mac tx command), and the
LoRaWAN protocol Receive windows (second response for the mac tx command).
This command will reply with the time interval in milliseconds that the transceiver can
be used without affecting the LoRaWAN functionality. The maximum value
(4294967295) is returned whenever the LoRaWAN stack functionality is in Idle state
and the transceiver can be used without restrictions. ‘0’ is returned when the LoRaWAN
stack functionality cannot be paused. After the radio configuration is complete, the mac
resume command should be used to return to LoRaWAN protocol commands.*/
RN2903.prototype.macPause = function() {
	var cmdType = "mac pause";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.7 mac resume
Response: ok
This command resumes LoRaWAN stack functionality, in order to continue normal
functionality after being paused.*/
RN2903.prototype.macResume = function() {
	var cmdType = "mac resume";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.1 mac set devaddr <address>
<address>: 4-byte hexadecimal number representing the device address, from
00000000 – FFFFFFFF
Response: ok if address is valid
invalid_param if address is not valid
This command configures the module with a 4-byte unique network device address
<address>. The <address> MUST be UNIQUE to the current network. This must be
directly set solely for activation by personalization devices. This parameter must not be
set before attempting to join using over-the-air activation because it will be overwritten
once the join process is over. */
RN2903.prototype.macSetDeviceAddress = function(value) {
	var cmdType = "mac set devaddr";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.2 mac set deveui <devEUI>
<devEUI>: 8-byte hexadecimal number representing the device EUI
Response: ok if address is valid
invalid_param if address is not valid
This command sets the globally unique device identifier for the module. The identifier
must be set by the host MCU. The module contains a pre-programmed unique EUI that
can be retrieved using the sys get hweui command (see Section 2.3.6.4).
Alternatively, a user provided EUI can be configured using the mac set deveui
command. */
RN2903.prototype.macSetDeviceEui = function(value) {
	var cmdType = "mac set deveui";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.3 mac set appeui <appEUI>
<appEUI>: 8-byte hexadecimal number representing the application EUI
Response: ok if address is valid
invalid_param if address is not valid
This command sets the application identifier for the module. The application identifier
should be used to identify device types (sensor device, lighting device, etc.) within the
network.
Example: mac set appeui FEDCBA9876543210*/
RN2903.prototype.macSetAppEui = function(value) {
	var cmdType = "mac set appeui";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.4 mac set nwkskey <nwksesskey>
<nwkSessKey>: 16-byte hexadecimal number representing the network session key
Response: ok if address is valid
invalid_param if address is not valid
This command sets the network session key for the module. This key is 16 bytes in
length, and should be modified with each session between the module and network.
The key should remain the same until the communication session between devices is
terminated.
Example: mac set nwkskey 1029384756AFBECD5647382910DACFEB*/
RN2903.prototype.macSetNetworkKey = function(value) {
	var cmdType = "mac set nwkskey";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.5 mac set appskey <appSesskey>
<appSessKey>: 16-byte hexadecimal number representing the application session
key
Response: ok if address is valid
invalid_param if address is not valid
This command sets the application session key for the module. This key is unique,
created for each occurrence of communication, when the network requests an action
taken by the application.
Example: mac set appskey AFBECD56473829100192837465FAEBDC*/
RN2903.prototype.macSetAppSessionKey = function(value) {
	var cmdType = "mac set appskey";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.6 mac set appkey <appKey>
<appKey>: 16-byte hexadecimal number representing the application key
Response: ok if address is valid
invalid_param if address is not valid
This command sets the application key for the module. The application key is used to
identify a grouping over module units which perform the same or similar task. */
RN2903.prototype.macSetAppKey = function(value) {
	var cmdType = "mac set appkey";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.7 mac set pwridx <pwrIndex>
<pwrIndex>: decimal number representing the index value for the output power.
Valid values are: 5, 7, 8, 9 or 10.
Response: ok if power index is valid
invalid_param if power index is not valid
This command sets the output power to be used on the next transmissions. Refer to
the LoRaWAN™ Specification for the output power corresponding to the <pwrIndex>
and also to the RN2903 Low-Power Long-Range LoRa™ Technology Transceiver
Module Data Sheet (DS50002390) for the actual radio power capabilities.
Example: mac set pwridx 10 // Sets the TX output power to index 10 (refer
to the LoRaWAN™ Specification for the
output power corresponding to the index).*/
RN2903.prototype.macSetPowerIndex = function(value) {
	var cmdType = "mac set pwridx";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.8 mac set dr <dataRate>
<dataRate>: decimal number representing the data rate, from 0 and 4, but within the
limits of the data rate range for the defined channels.
Response: ok if data rate is valid
invalid_param if data rate is not valid
This command sets the data rate to be used for the next transmission. Please refer to
the LoRaWAN™ Specification for the description of data rates and the corresponding
spreading factors.
Example: mac set dr 0*/
RN2903.prototype.macSetDataRate = function(value) {
	var cmdType = "mac set dr";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.9 mac set adr <state>
<state>: string value representing the state, either on or off.
Response: ok if state is valid
invalid_param if state is not valid
This command sets if the adaptive data rate (ADR) is to be enabled or disabled. The
server is informed about the status of the module’s ADR in every uplink frame it
receives from the ADR field in uplink data packet. If ADR is enabled, the server will
optimize the data rate and the transmission power of the module based on the
information collected from the network.
Example: mac set adr on // This will enable the ADR mechanism.*/
RN2903.prototype.macSetADR = function(value) {
	var cmdType = "mac set adr";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.10 mac set bat <level>
<level>: decimal number representing the level of the battery, from 0 to 255. 0
means external power, 1 means low level, 254 means high level, 255
means the end device was not able to measure the battery level.
Response: ok if the battery level is valid
invalid_param if the battery level is not valid
This command sets the battery level required for RN2903 Status Answer frame in use
with the LoRaWAN protocol.
Example: mac set bat 127 // Battery is set to ~50%*/
RN2903.prototype.macSetBattery = function(value) {
	var cmdType = "mac set bat";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.11 mac set retx <reTxNb>
<reTxNb>: decimal number representing the number of retransmissions for an uplink
confirmed packet, from 0 to 255.
Response: ok if <retx> is valid
invalid_param if <retx> is not valid
This command sets the number of retransmissions to be used for an uplink confirmed
packet, if no downlink acknowledgment is received from the server.
Example: mac set retx 5 // The number of retransmissions made
for an uplink confirmed packet is set to 5.*/
RN2903.prototype.macSetRetx = function(value) {
	var cmdType = "mac set retx";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.12 mac set linkchk <linkCheck>
<linkCheck>: decimal number that sets the time interval in seconds for the link check
process, from 0 to 65535
Response: ok if the time interval is valid
invalid_param if the time interval is not valid
This command sets the time interval for the link check process to be triggered
periodically. A <value> of ‘0’ will disable the link check process. When the time
interval expires, the next application packet that will be sent to the server will include a
link check MAC command. Please refer to the LoRaWAN™ Specification for more
information on the link check MAC command.
Example: mac set linkchk 600 // The module will attempt a link check
process at 600-second intervals.*/
RN2903.prototype.macSetLinkCheck = function(value) {
	var cmdType = "mac set linkchk";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.13 mac set rxdelay1 <rxDelay>
<rxDelay>: decimal number representing the delay between the transmission and
the first Reception window in milliseconds, from 0 to 65535.
Response: ok if <rxDelay> is valid
invalid_param if <rxDelay> is not valid
This command will set the delay between the transmission and the first Reception
window to the <rxDelay> in milliseconds. The delay between the transmission and
the second Reception window is calculated in software as the delay between the
transmission and the first Reception window + 1000 (ms).
Example: mac set rxdelay1 1000 // Set the delay between the transmission
and the first Receive window to 1000 ms.*/
RN2903.prototype.macSetRxDelay1 = function(value) {
	var cmdType = "mac set rxdelay1";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.14 mac set ar <state>
<state>: string value representing the state, either on or off.
Response: ok if state is valid
invalid_param if state is not valid
This command sets the state of the automatic reply. By enabling the automatic reply,
the module will transmit a packet without a payload immediately after a confirmed
downlink is received, or when the Frame Pending bit has been set by the server. If set
to OFF, no automatic reply will be transmitted.
Example: mac set ar on // Enables the automatic reply process
inside the module.*/
RN2903.prototype.macSetAutomaticReply = function(value) {
	var cmdType = "mac set ar";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.15 mac set rx2 <dataRate> <frequency>
<dataRate>: decimal number representing the data rate, from 8 to 13.
<frequency>: decimal number representing the frequency, from 923300000 to
927500000 in Hz.
Response: ok if parameters are valid
invalid_param if parameters are not valid
This command sets the data rate and frequency used for the second Receive window.
The configuration of the Receive window parameters should be in concordance with
the server configuration.
Example: mac set rx2 10 923300000 // Receive window 2 is configured with
SF10/500 kHz data rate with a center
frequency of 923 MHz.*/
RN2903.prototype.macSetRx2 = function(dataRate, frequency) {
	var cmdType = "mac set rx2";
	var cmdString = cmdType + " " + dataRate + " " + frequency;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.16 mac set sync <syncWord>
<syncWord>: hexadecimal number representing the synchronization word, from 0x00
to 0xFF.
Response: ok if <syncWord> is valid
invalid_param if <syncWord> is not valid
This command sets the current synchronization word used during the communication. */
RN2903.prototype.macSetSyncWord = function(value) {
	var cmdType = "mac set sync";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.17 mac set upctr <uplinkCounter>
<uplinkCounter>: decimal number representing the uplink counter, from 0 to
4294967295
Response: ok if <uplinkCounter> is valid
invalid_param if <uplinkCounter> is not valid
This command sets the current uplink counter used during the communication. This
may be used to synchronize the uplink counter with the value stored by the server (as
it may be needed by activation by personalization).
Example: mac set upctr 22 // Sets the current uplink counter to 22*/
RN2903.prototype.macSetUplinkCounter = function(value) {
	var cmdType = "mac set upctr";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.18 mac set dnctr <downlinkCounter>
<downlinkCounter>: decimal number representing the downlink counter, from 0 to
4294967295
Response: ok if <downlinkCounter> is valid
invalid_param if <downlinkCounter> is not valid
This command sets the current downlink counter used during the communication. This
may be used to synchronize the downlink counter with the value stored by the server
(as it may be needed by activation by personalization).
Example: mac set dnctr 20 // Sets the current downlink counter to 20*/
RN2903.prototype.macSetDownlinkCounter = function(value) {
	var cmdType = "mac set dnctr";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.19.1 mac set ch drrange <channelID> <minRange> <maxRange>
<channelId>: decimal number representing the channel number, from 0 to 63
<minRange>: decimal number representing the minimum data rate range, from 0 to 3
<maxRange>: decimal number representing the maximum data rate range, from 0 to 3
Response: ok if parameters are valid
invalid_param if parameters are not valid
This command sets the operating data rate range, min. to max., for the given
<channelId>. By doing this the module can vary data rates between the
<minRange> and <maxRange> on the specified <channelId>. Please refer to the
LoRaWAN™ Specification for the actual values of the data rates and the corresponding
spreading factors (SF).
Example: mac set ch drrange 13 0 2 // On channel 13 the data rate can
range from 0 (SF10/125 kHz) to
(SF8/125 kHz) as required. */
RN2903.prototype.macSetChDrRange = function(channelID, minRange, maxRange) {
	var cmdType = "mac set ch drrange";
	var cmdString = cmdType + " " + channelID + " " + minRange + " " + maxRange;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.8.19.2 mac set ch status <channel ID> <status>
<channelId>: decimal number representing the channel number, from 0 to 71.
<status>: string value representing the state, either on or off.
Response: ok if parameters are valid
invalid_param if parameters are not valid
This command sets the operation of the given <channelId>.
Example: mac set ch status 4 off // Channel ID 4 is disabled from use.*/
RN2903.prototype.macSetChannelStatus = function(ch, status) {
	var cmdType = "mac set ch status";
	var cmdString = cmdType + " " + ch + " " + status;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.1 mac get devaddr
Response: 4-byte hexadecimal number representing the device address, from
00000000 to FFFFFFFF.
This command will return the current end-device address of the module.
Default: 00000000
Example: mac get devaddr*/
RN2903.prototype.macGetDeviceAddress = function() {
	var cmdType = "mac get devaddr";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.2 mac get deveui
Response: 8-byte hexadecimal number representing the device EUI.
This command returns the globally unique end-device identifier, as set in the module.
Default: 0000000000000000
Example: mac get deveui*/
RN2903.prototype.macGetDeviceEui = function() {
	var cmdType = "mac get deveui";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.3 mac get appeui
Response: 8-byte hexadecimal number representing the application EUI.
This command will return the application identifier for the module. The application
identifier is a value given to the device by the network.
Default: 0000000000000000
Example: mac get appeui*/
RN2903.prototype.macGetAppEui = function() {
	var cmdType = "mac get appeui";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.4 mac get dr
Response: decimal number representing the current data rate.
This command will return the current data rate.
Default: 3
Example: mac get dr*/
RN2903.prototype.macGetDr = function() {
	var cmdType = "mac get dr";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.5 mac get pwridx
Response: decimal number representing the current output power index value. Return
values can be: 5, 7, 8, 9 or 10.
This command returns the current output power index value.
Default: 8
Example: mac get pwridx*/
RN2903.prototype.macGetPowerIndex = function() {
	var cmdType = "mac get pwridx";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.6 mac get adr
Response: string representing the state of the adaptive data rate mechanism, either
on or off.
This command will return the state of the adaptive data rate mechanism. It will reflect if
the ADR is on or off on the requested device.
Default: off
Example: mac get adr */
RN2903.prototype.macGetAdr = function() {
	var cmdType = "mac get adr";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.7 mac get retx
Response: decimal number representing the number of retransmissions, from 0 to 255.
This command will return the currently configured number of retransmissions which are
attempted for a confirmed uplink communication when no downlink response has been
received.
Default: 7
Example: mac get retx*/
RN2903.prototype.macGetRetx = function() {
	var cmdType = "mac get retx";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.8 mac get rxdelay1
Response: decimal number representing the interval in milliseconds for rxdelay1,
from 0 to 65535.
This command will return the interval in milliseconds for rxdelay1.
Default: 1000
Example: mac get rxdelay1*/
RN2903.prototype.macGetRxDelay1 = function() {
	var cmdType = "mac get rxdelay1";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.9 mac get rxdelay2
Response: decimal number representing the interval in milliseconds for rxdelay2,
from 0 to 65535.
This command will return the interval in milliseconds for rxdelay2.
Default: 2000
Example: mac get rxdelay2*/
RN2903.prototype.macGetRxDelay2 = function() {
	var cmdType = "mac get rxdelay2";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.10 mac get ar
Response: string representing the state of the automatic reply, either on or off.
This command will return the current state for the automatic reply (AR) parameter. The
response will indicate if the AR is on or off.
Default: off
Example: mac get ar*/
RN2903.prototype.macGetAutomaticReply = function() {
	var cmdType = "mac get ar";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.11 mac get rx2
Response: decimal number representing the data rate configured for the second
Receive window, from 8 to 13 and a decimal number for the frequency configured for
the second Receive window, from 923300000 to 927500000 in Hz.
This command will return the current data rate and frequency configured to be used
during the second Receive window.
Default: 8 923300000
Example: mac get rx2*/
RN2903.prototype.macGetRx2 = function() {
	var cmdType = "mac get rx2";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.12 mac get dcycleps
Response: decimal number representing the prescaler value, from 0 to 65535.
This command returns the duty cycle prescaler. The value of the prescaler can be
configured ONLY by the SERVER through use of the Duty Cycle Request frame. Upon
reception of this command from the server, the duty cycle prescaler is changed for all
enabled channels.
Default: 1
Example: mac get dcycleps*/
RN2903.prototype.macDutyCyclePrescalar = function() {
	var cmdType = "mac get dcycleps";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.13 mac get mrgn
Response: decimal number representing the demodulation margin, from 0 to 255.
This command will return the demodulation margin as received in the last Link Check
Answer frame. Please refer to the LoRaWAN™ Specification for the description of the
values.
Default: 255
Example: mac get mrgn*/
RN2903.prototype.macGetDemodMargin = function() {
	var cmdType = "mac get mrgn";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.14 mac get gwnb
Response: decimal number representing the number of gateways, from 0 to 255.
This command will return the number of gateways that successfully received the last
Link Check Request frame command, as received in the last Link Check Answer.
Default: 0
Example: mac get gwnb*/
RN2903.prototype.macGetNumGateways = function() {
	var cmdType = "mac get gwnb";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.15 mac get status
Response: 2-byte hexadecimal number representing the current status of the module.
This command will return the current status of the module. The value returned is a bit
mask represented in hexadecimal form. Please refer to Figure 2-1 for the significance
of the bit mask.
Default: 0000
Example: mac get status*/
RN2903.prototype.macGetStatus = function() {
	var cmdType = "mac get status";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.16 mac get sync
Response: hexadecimal number representing the current synchronization word, from
0x00 to 0xFF.
This command returns the current synchronization word.
Default: 34
Example: mac get sync*/
RN2903.prototype.macGetSync = function() {
	var cmdType = "mac get sync";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.17 mac get upctr
Response: decimal number representing the uplink counter, from 0 to 4294967295
This command will return the current uplink counter of the module.
Default: 0
Example: mac get upctr // Returns the current uplink counter*/
RN2903.prototype.macGetUplinkCounter = function() {
	var cmdType = "mac get upctr";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.18 mac get dnctr
Response: decimal number representing the downlink counter, from 0 to 4294967295
This command will return the current downlink counter of the module.
Default: 0
Example: mac get dnctr // Returns the current downlink counter*/
RN2903.prototype.macGetDownlinkCounter = function() {
	var cmdType = "mac get dnctr";
	var cmdString = cmdType + "";
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.19.1 mac get ch freq <ChannelId>
<channelId>: decimal number representing the channel number, from 0 to 71.
Response: decimal number representing the frequency of the channel, from
923300000 to 914900000 in Hz.
This command returns the frequency on the requested <channelId>, entered in
decimal form.
Default: see Table 2-10
Example: mac get ch freq 0*/
RN2903.prototype.macGetChannelFreq = function(value) {
	var cmdType = "mac get ch freq";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.19.2 mac get ch drrange <channelId>
<channelId>: decimal number representing the channel number, from 0 to 71.
Response: decimal number representing the minimum data rate of the channel, from 0
to 4 and a decimal number representing the maximum data rate of the channel, from 0
to 4.
This command returns the allowed data rate index range on the requested
<channelId>, entered in decimal form. The <minRate> and <maxRate> index
values are returned in decimal form and reflect index values. Please refer to the
LoRaWAN™ Specification for the description of data rates and the corresponding
spreading factors.
Default: see Table 2-10
Example: mac get ch drrange 0*/
RN2903.prototype.macGetChannelDrRange = function(value) {
	var cmdType = "mac get ch drrange";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*2.4.9.19.3 mac get ch status <channelId>
<channelId>: decimal number representing the channel number, from 0 to 71.
Response: string representing the state of the channel, either on or off.
This command returns if <channelId> is currently enabled for use. <channelId> is
entered in decimal form and the response will be on or off reflecting the channel is
enabled or disabled appropriately.
Default: see Table 2-10
Example: mac get ch status 2*/
RN2903.prototype.macGetChannelStatus = function(value) {
	var cmdType = "mac get ch status";
	var cmdString = cmdType + " " + value;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

RN2903.prototype.writeToSerial = function(string) {
	var cmdString = string;
	return this.cmdInterface.addToWriteQueue('other', cmdString);
};

//returns a promise
//resolves true if joining successful
//reolsves false if failed to join
RN2903.prototype.joinNetwork = function(networkObj) {
	//console.log("Joining Network...");
	var RN2903 = this;
	var networkId = networkObj.networkId;
	var networkKey = networkObj.networkKey;
	var joinMode = networkObj.joinMode;
	return new Promise(function(resolve, reject) {
		RN2903.macSetAppEui(networkId)
			.then(function() {
				return RN2903.macSetAppKey(networkKey);
			})
			.then(function() {
				return RN2903.macJoin(joinMode);
			})
			.then(function(response) {
				console.log("macJoin response", response);
				if (response.length > 1) {
					if (response[1] === "accepted") {
						resolve([true, ""]);
					} else {
						resolve([false, response[1]]);
					}
				} else {
					resolve([false, response[0]]);
				}
			})
			.catch(function(err) {
				console.log("err", err);
			});
	});
};

//returns a promise
//resolves true if joining successful
//reolsves false if failed to join
RN2903.prototype.sendData = function(msgObj) {
	var RN2903 = this;
	var payload = msgObj.payload;
	var ackEnabled = msgObj.ackEnabled ? "cnf" : "uncnf";
	var port = msgObj.port;
	var hex = '';

	//Convert from string to hex
	for (var i = 0; i < payload.length; i++) {
		hex += '' + payload.charCodeAt(i).toString(16);
	}
	return new Promise(function(resolve, reject) {
		RN2903.macTx(ackEnabled, port, hex)
			.then(function(response) {
				if (response.length > 1) {
					if (response[1] == 'mac_err' || response[1] == 'invalid_data_len') {
						resolve([false, response[1]]);
					} else {
						var rxArray = [];
						var index;
						var rxData;
						for (var j = 1; j < response.length; j++) {
							index = response[j].indexOf('mac_rx 1 ');
							if (index > -1) {
								rxData = response[j].replace('mac_rx 1 ','');
								// console.log("Adding to rx array", rxData);
								rxArray.push(rxData);

							}
						}
						resolve([true].concat(rxArray));
					}
				} else {
					resolve([false, response[0]]);
				}

			})
			.catch(function(err) {
				reject(err);
			});
	});
};

//Returns promise that resolves with true if join status is true
RN2903.prototype.getJoinStatus = function() {
	var RN2903 = this;
	return new Promise(function(resolve, reject) {
		RN2903.macGetStatus()
			.then(function(response) {
				//First bit of response[0] contains join status
				if ((response[0] & 0x01) == 1) {
					resolve(true);
				} else {
					resolve(false);
				}
			})
			.catch(function(err) {
				console.log("err", err);
			});
	});
};

RN2903.prototype.reboot = function() {
	var RN2903 = this;
	console.log("Rebooting device!!!");
	return RN2903.sysReset();
};

//not working 
RN2903.prototype.setBaudRate = function(baud) {
	var RN2903 = this;
	console.log("Setting baud rate to ", baud);
	// RN2903.writeToSerial(null)
	// RN2903.writeToSerial(null);
	// RN2903.writeToSerial(null);
	return RN2903.writeToSerial("U");
};

//Assigns responseHandlers to each command type and stores in an object
RN2903.prototype.generateCmdObject = function() {
	var RN2903 = this;
	var i = 0;
	RN2903.responseHandler = {};
	var cmdArray = ['sys sleep', 'sys reset', 'sys factoryRESET',
		'sys set nvm', 'sys set pindig', 'sys set pinmode', 'sys get ver', 'sys get nvm',
		'sys get vdd', 'sys get hweui', 'sys get pindig', 'sys get pinana', 'mac reset',
		'mac save', 'mac forceENABLE', 'mac pause', 'mac resume',
		'mac set devaddr', 'mac set deveui', 'mac set appeui', 'mac set nwkskey',
		'mac set appskey', 'mac set appkey', 'mac set pwridx', 'mac set dr',
		'mac set adr', 'mac set bat', 'mac set retx', 'mac set linkchk',
		'mac set rxdelay1', 'mac set ar', 'mac set rx2', 'mac set sync', 'mac set upctr',
		'mac set dnctr', 'mac set ch drrange', 'mac set ch status', 'mac get devaddr',
		'mac get deveui', 'mac get appeui', 'mac get dr', 'mac get pwridx', 'mac get adr',
		'mac get retx', 'mac get rxdelay1', 'mac get rxdelay2', 'mac get ar', 'mac get rx2',
		'mac get dcycleps', 'mac get mrgn', 'mac get gwnb', 'mac get status', 'mac get sync',
		'mac get upctr', 'mac get dnctr', 'mac get ch freq', 'mac get ch drrange', 'mac get ch status',
		'other'
	];

	for (i = 0; i < cmdArray.length; i++) {
		RN2903.responseHandler[cmdArray[i]] = responseHandler1;
	}

	cmdArray = ['mac tx', 'mac join'];

	for (i = 0; i < cmdArray.length; i++) {
		RN2903.responseHandler[cmdArray[i]] = responseHandler2;
	}

	cmdArray = ['sys eraseFW'];

	for (i = 0; i < cmdArray.length; i++) {
		RN2903.responseHandler[cmdArray[i]] = responseHandler3;
	}
};

var responseHandler1 = function(commandResponse) {
	return new Promise(function(resolve, reject) {
		var rate = 200;
		var count = 0;
		var response = "";
		var waitTime = 5000;
		var interval = setInterval(function() {
			//console.log(mDot);
			//console.log("Waiting for response.....");
			if (commandResponse.length) { //Check if there has been a response..
				response = commandResponse;
				resolve(response);
				clearInterval(interval);
				//console.log("Response cleared");
			} else if (count >= (waitTime / rate)) {
				reject("RN2903 response timeout");
				clearInterval(interval);
			}
			count++;
		}, rate);
	});
};

var responseHandler2 = function(commandResponse) {
	return new Promise(function(resolve, reject) {
		var rate = 200;
		var count = 0;
		var response = "";
		var waitTime = 60000;
		var expectedLength = 1;
		var interval = setInterval(function() {
			//console.log("Waiting for response.....");

			if (commandResponse[0] && commandResponse[0] == 'ok') {
				expectedLength = 2;
			}
			//console.log(mDot);
			if (commandResponse.length == expectedLength) { //Check if there has been a response..
				response = commandResponse;
				resolve(response);
				clearInterval(interval);
				//console.log("Response cleared");
			}

			if (count >= (waitTime / rate)) {
				reject("RN2903 response timeout");
				clearInterval(interval);
			}
			count++;
		}, rate);
	});
};

var responseHandler3 = function(commandResponse) {
	return new Promise(function(resolve, reject) {
		resolve(true);
	});
};


module.exports = function(options) {
	var instance = new RN2903(options);
	return instance;
};