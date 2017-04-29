/**
 * @fileoverview Provides methods for using Multitech's mDot LoRa radio.
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */
var Promise = require('bluebird');

//mDot Device class
function Device(options) {
	var Device = this;
	Device.options = options;
	Device.radioType = "device";
	Device.generateCmdObject();
	Device.cmdInterface = require("../lib/cmdInterface.js")(Device.options.serialPortOptions, Device.responseHandler, Device);
	Device.atGetDeviceId()
		.then(function(response) {
			Device.deviceEUI = response[0];
			Device.deviceEUIShort = Device.deviceEUI.substr(Device.deviceEUI.length - 5);
			console.log("Device EUI:", Device.deviceEUI);
		})
		.catch(function(err) {
			console.log("err", err);
		});
	console.log("Device options:", Device.options);
}

/*
AT Attention
Attention, used to verify the COM channel is working. AT required at the beginning of every command.
Parameters and Values
None
*/
Device.prototype.atAttention = function() {
	return this.cmdInterface.addToWriteQueue("AT", "AT");
};

/*
ATI Request ID
Request ID returns product and software identification information.
Parameters and Values
None
*/
Device.prototype.atRequestID = function() {
	return this.cmdInterface.addToWriteQueue("ATI ", "ATI ");
};

/*
ATZ Reset CPU
Resets the CPU, the same way as pressing the reset button. The program is reloaded from flash and begins
execution at the main function. Reset takes about 3 seconds.
Parameters and values
None
*/
Device.prototype.atReset = function() {
	return this.cmdInterface.addToWriteQueue("ATZ", "ATZ");
};

/*
ATE0/1 Echo Mode
Enable or disable command mode echo. 1-Enable 0-Disable.
Parameter1
0 Disables echo
1 Enables echo (Default)
*/
Device.prototype.atSetEchoMode = function(param1) {
	var cmdType = "ATE";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
ATV0/1 Verbose Mode
Enable or disable verbose mode. Affects the verbosity of command query responses. For example, without verbose
mode, AT+IPR? responds with 115200. With verbose mode AT+IPR? responds with Serial Baud Rate: 115200. Does
not affect OK responses.
Parameter1
0 Disables verbose mode (Default)
1 Enables verbose mode
*/
Device.prototype.atSetVerboseMode = function(param1) {
	var cmdType = "ATV";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT&K0/3 Hardware Flow Control
Enable or disable hardware flow control. Hardware flow control is useful in serial data mode to keep from
overflowing the input buffers.
This uses pins NCTS_DIO7(CTS) and RTS_AD6_DIO6(RTS). When in serial data mode, use hardware flow control to
prevent buffer overflow. (Serial data mode is AT+SMODE=1 or AT+SD.) Changes CTS signal to low with &K0 and to
high with &K3.
Parameter1
0 Disables hardware flow control
3 Enables hardware flow control
*/
Device.prototype.atSetHardwareFlowControl = function(param1) {
	var cmdType = "AT&K";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetHardwareFlowControl = function() {
	var cmdType = "AT&K?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT&F Reset to Factory Defaults
Changes the current settings to the factory defaults, but does not store them. To store the default settings, use
with AT&W. Otherwise, resetting or power cycling the device restores the previous settings.
Parameters and Values
None
*/
Device.prototype.atSetFactoryDefaults = function() {
	var cmdType = "AT&F";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT&W Save Configuration
Writes all configuration settings displayed in AT&V to flash memory.
Parameters and Values
None
*/
Device.prototype.atSaveConfigurations = function() {
	return this.cmdInterface.addToWriteQueue("AT&W", "AT&W");
};

/*
AT+WP Wake Pin
Sets the pin that the end device monitors if wake mode is set to interrupt mode. The end device wakes if a positive
going edge is detected on the wake pin. Upon waking, it waits +WD amount of time for an initial character then
+WTO amount of time for each additional character.
Parameter1
1 DIN
2 AD2_DIO2
3 AD3_DIO3
4 AD4_DIO4
5 ASSOCIATE_AD5_DIO5
6 RTS_AD6_DIO6 (Not available with AT&K3)
7 NCTS_DIO7 (Not available with AT&K3)
8 NDTR_SLEEPRQ_DI8 (Default)
*/
Device.prototype.atSetWakePin = function(param1) {
	var cmdType = "AT+WP=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetWakePin = function() {
	var cmdType = "AT+WP?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+IPR Serial Speed
Sets serial baud rate for interface on header pins 2 and 3. Changes to this setting take effect after a save and
reboot of the Dot.
Parameters and Values
Parameter1
1200
2400
4800
9600
19200
38400
57600
115200 (Default)
230500
460800
921600
*/
Device.prototype.atSetSerialSpeed = function(param1) {
	var cmdType = "AT+IPR=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetSerialSpeed = function() {
	var cmdType = "AT+IPR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+DIPR Debug Serial Speed
Sets debug serial baud rate for interface on DEBUG header pins 30 and 31. Changes to this setting take effect after
a save and reboot of the Dot. power-cycle or reset.
Parameters and Values
Parameter1
2400
4800
9600
19200
38400
57600
115200 (Default)
230500
460800
921600
*/
Device.prototype.atSetDebugSerialSpeed = function(param1) {
	var cmdType = "AT+DIPR=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetDebugSerialSpeed = function() {
	var cmdType = "AT+DIPR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+LOG Debug Log Level
Sets the debug message logging level. Messages are output on the debug port. Higher settings log more messages.
Parameters and Values
Parameter1
0 Off – No debug messages (Default)
1 FATAL – Output FATAL debug messages.
2 ERROR – Outputs ERROR and FATAL debug messages
3 WARNING – Outputs WARNING and all lower level debug messages
4 INFO – Outputs INFO and all lower level debug messages
5 DEBUG – Output DEBUG and all lower level debug messages
6 TRACE – Output TRACE and all lower level debug messages
*/
Device.prototype.atSetDebugLogLevel = function(data) {
	var cmdType = "AT+LOG=";
	var cmdString = cmdType + data;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetDebugLogLevel = function() {
	var cmdType = "AT+LOG?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+DI Device ID
The device ID is an EUI.The EUI is programmed at the factory. This command allows you to query the EUI, but not
change it.
Parameters and Values
None
Command with Response Examples
AT+DI
00:80:00:00:00:00:00:06
*/
Device.prototype.atGetDeviceId = function() {
	var cmdType = "AT+DI?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+FREQ Frequency Band
Use to query the supported frequency band. This is not configurable. It is either 915MHz or 868MHz.
Parameters and Values
None
Command with Response Examples
AT+FREQ
FB_915
*/
Device.prototype.atGetFrequencyBand = function() {
	var cmdType = "AT+FREQ";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+FSB Frequency Sub-Band (915MHz models only)
Configures the frequency sub-band for 915MHz models. This enables hybrid mode for private network channel
management.
Parameters and Values
Parameter1
0 Allows channel hopping of all 64 channels. (Default)
1 Enter a value from 1-8 to configure the end device to use one set of eight channels out of 64
possible. This must match the gateway settings.
*/
Device.prototype.atSetFrequencySubBand = function(param1) {
	var cmdType = "AT+FSB=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetFrequencySubBand = function() {
	var cmdType = "AT+FSB?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+PN Public Network Mode
Configures the end device to function on either a public or private LoRa network.
When public network is enabled, the device functions as a LoRaWAN device as specified in LoRa Alliance
documentation.:
■ Syncword 0x34 is used
■ Join windows open at the default 5/6 seconds after end of transmission for OTA
■ Set AT+FSB=1-8 to enable hybrid functionality, Rx windows open at the default 1/2 seconds after end of
transmission.
When not enabled, (default) the device functions on a private network with the following modifications, adjusted
for the local network server available on the Conduit:
■ Syncword 0x12 is used
■ Join windows open at 1/2 seconds after end of transmission for OTA
■ Rx1 and Rx2 windows are fixed to each AT+FSB setting (see AT+FSB)
Parameters and Values
Parameter1
0 Disable public network mode (Default)
1 Enable public network mode.
*/
Device.prototype.atSetPublicNetworkMode = function(param1) {
	var cmdType = "AT+PN=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetPublicNetworkMode = function() {
	var cmdType = "AT+PN?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+JBO Join Byte Order
Sets the byte order (LSB or MSB first) in which the device EUI is sent to the gateway in a join request.
Note: Used only for connecting to non-compliant network servers
Parameters and Values
Parameter1
0 LSB first (Default)
1 MSB first
*/
Device.prototype.atSetJoinByteOrder = function(param1) {
	var cmdType = "AT+JBO=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetJoinByteOrder = function() {
	var cmdType = "AT+JBO?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+NJM Network Join Mode
Controls how the end device establishes communications with the gateway.
■ When AT+NJM=2 (AUTO_OTA) and AT+PS is set to 1 the session is not be defaulted on reset or power.
■ When AT+NJM=1 (OTA) AT+PS will not be applied and session stays in flash in either case.
Parameters and Values
Parameter1
0 Manual configuration
1 OTA network join (Default)
2 Auto OTA network join on start up
CAUTION: Setting +NJM=2 causes the Dot to join immediately. Configure network settings
and OTA mode before setting to AUTO_OTA mode.
3 Peer-to-peer mode
*/
Device.prototype.atSetNetworkJoinMode = function(param1) {
	var cmdType = "AT+NJM=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetNetworkJoinMode = function() {
	var cmdType = "AT+NJM?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};


/*
AT+JOIN Join Network
Join network. For US915 and EU868 models +NI, +NK must match gateway settings in order to join. US915 must
also match +FSB setting.
Parameters and Values
None
If Parameter1 is set to 1, a character string up to 128 characters.
Error Messages
■ Failed to join network – No join response received from gateway.
■ Join backoff – End device must wait for next available free channel to join. Issue AT+TXN to get the wait
time.
Command with Response Examples
AT+JOIN
Successfully joined network
OK
AT+JOIN
Join Error - Failed to join network
ERROR
AT+JOIN
Join Error - Join backoff
ERROR
help AT+JOIN
AT+JOIN: Join network, provide argument of '1' to force join (acquire network address and session keys)
OK
AT+JOIN=?
AT+JOIN: (force:1)
OK
*/
Device.prototype.atJoinNetwork = function() {
	var cmdType = "AT+JOIN";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+JR Join Retries
This is the maximum number of join attempts that will be made if none are successful. Such a sequence is initiated
by the AT+JOIN command.
Enabling this setting allows the dot to search each sub-band when trying to join the Conduit when in AUTO_OTA
mode. The dot can then recover if the Conduit changes sub-band after it detects the lost network connection with
AT+LCT used with AT+LCC or AT+ACK. The dot attempts to join on the configured AT+FSB the number of join
retries, if unsuccessful it attempts on the next AT+FSB setting.
Parameters and Values
Parameter1
0 Disable
1-255 Seconds enabled (Default is 2)
*/
Device.prototype.atSetJoinRetries = function(param1) {
	var cmdType = "AT+JR=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetJoinRetries = function() {
	var cmdType = "AT+JR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+JD Join Delay
Allows the dot to use non-default join receive windows, if required by the network it is attempting to connect to.
Initiating a join request opens a receive window to listen for the response. This command allows you to alter the
default timing of the window.
AT+JD Join Delay
Allows the dot to use non-default join receive windows, if required by the network it is attempting to connect to.
Initiating a join request opens a receive window to listen for the response. This command allows you to alter the
default timing of the window.
*/
Device.prototype.atSetJoinDelay = function(param1) {
	var cmdType = "AT+JD=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetJoinDelay = function() {
	var cmdType = "AT+JD?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+NI Network ID
Configures network EUI/Name. (App EUI in LoRaMac.)
Parameters and Values
Parameter1
0 Second parameter is a hex key.
1 Second parameter is a string up to 128 characters long.
Parameter2
16 bytes of hex data using a colon (:) to separate each byte from the next byte.
If Parameter1 is set to 1, a character string up to 128 characters.
*/
Device.prototype.atSetNetworkId = function(param1, param2) {
	var cmdType = "AT+NI=";
	var cmdString = cmdType + param1 + "," + param2;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetNetworkId = function() {
	var cmdType = "AT+NI?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+NK Network Key
Configures network key/passphrase. (App key in LoRaMac.)
Parameters and Values
Parameter1
0 Second parameter is a hex key.
1 Second parameter is a string up to 128 characters long.
Parameter2
16 bytes of hex data using a colon (:) to separate each byte from the next byte.
If Parameter1 is set to 1, a character string up to 128 characters
*/
Device.prototype.atSetNetworkKey = function(param1, param2) {
	var cmdType = "AT+NK=";
	var cmdString = cmdType + param1 + "," + param2;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetNetworkKey = function() {
	var cmdType = "AT+NK?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+ENC AES Encryption
Enables or disables AES encryption of payload data.
Note: Must be enabled for use with nearly all network servers."
Parameters and Values
Parameter1
0 Disabled
1 Enabled (Default)
*/
Device.prototype.atSetAESEncryption = function(param1) {
	var cmdType = "AT+JD=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetAESEncryption = function() {
	var cmdType = "AT+JD?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
Manual Activation
If supported by the network server, the Dot can be activated manually. To do this, configure the network address,
network session key, and data session key.
AT+NA Network Address
Sets network address in MANUAL join mode, the server will assign an address in OTA modes.
Parameters and Values
Parameter1
4 bytes of hex data using a colon (:) to separate each byte from the next byte
*/
Device.prototype.atSetNetworkAddress = function(param1) {
	var cmdType = "AT+NA=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetNetworkAddress = function() {
	var cmdType = "AT+NA?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+NSK Network Session Key
Sets network session key in MANUAL join mode, will be automatically set in OTA modes..
Parameters and Values
Parameter1
16 bytes of hex data using a colon (:) to separate each byte from the next byte.
*/
Device.prototype.atSetNetworkSessionKey = function(param1) {
	var cmdType = "AT+NSK=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetNetworkSessionKey = function() {
	var cmdType = "AT+NSK?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+DSK Data Session Key
Sets data session key in MANUAL join mode, will be automatically set in OTA modes. Used for AES-128 encryption
of transferred data.
Parameters and Values
Parameter1
16 bytes of hex data using a colon (:) to separate each byte from the next byte.
*/
Device.prototype.atSetDataSessionKey = function(param1) {
	var cmdType = "AT+DSK=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetDataSessionKey = function() {
	var cmdType = "AT+DSK?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+ULC Uplink Counter
A device using MANUAL join mode a network server may reject uplink packets, if they do not have the correct
counter value. This setting is available for an application to manage this session parameter. Otherwise, use AT+SS
and AT+RS to save this setting to flash in any join mode.
Parameters and Values
Parameter1
0-4294967295 (Default is 1).
*/
Device.prototype.atSetUplinkCounter = function(param1) {
	var cmdType = "AT+ULC=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetUplinkCounter = function() {
	var cmdType = "AT+ULC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+DLC Downlink Counter
A device using MANUAL join mode, it may reject downlink packets if they do not have the correct counter value.
This setting is available for an application to manage this session parameter. Otherwise, use AT+SS and AT+RS to
save this setting to flash in any join mode.
Parameters and Values
Parameter1
0-4294967295 (Default is 1).
*/
Device.prototype.atSetDownlinkCounter = function(param1) {
	var cmdType = "AT+DLC=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetDownlinkCounter = function() {
	var cmdType = "AT+DLC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+NJS Network Join Status
Displays the last known network join state, which helps determine if communication has been lost.
Parameter1
0 Not joined.
1 Joined
*/
Device.prototype.atGetNetworkJoinStatus = function() {
	var cmdType = "AT+NJS?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+PING Send Ping
Sends a ping to the gateway. The gateway responds with a pong containing RSSI and SNR, which the end device
displays. RSSI ranges from -140dB to –0dB and SNR ranges from -20dBm to 20dBm.
*/
Device.prototype.atSendPing = function() {
	var cmdType = "AT+PING";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+ACK Require Acknowledgment
The maximum number of times the end device tries to retransmit an unacknowledged packet. Options are from 1
to 8.
Note: When ACKs are enabled, the AT+SEND command does not return until the ACK is received or attempts
are exhausted.
Parameters and Values
Parameter1
0 ACKs are not required. (Default)
1-8 The maximum number of attempts without an acknowledgment.
*/
Device.prototype.atSetRequireACK = function(param1) {
	var cmdType = "AT+ACK=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetRequireACK = function() {
	var cmdType = "AT+ACK?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+NLC Network Link Check
Performs a network link check. The first number in the response is the dBm level above the demodulation floor
(not be confused with the noise floor). This value is from the perspective of the signal sent from the end device
and received by the gateway. The second number is the number of gateways in the end device's range.
Parameters and Values
None
*/
Device.prototype.atNetworkLinkCheck = function() {
	var cmdType = "AT+NLC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+LCC Link Check Count
Performs periodic connectivity checking. This feature is an alternative to enabling ACK for all packets in order to
detect when the network is not available or the session information has been reset on the server.
Parameters and Values
Parameter1
0 Disabled (Default)
1-255 Number of packets sent before a link check is performed. Link checks are not be sent if ACKs are
enabled
*/
Device.prototype.atSetLinkCheckCount = function(param1) {
	var cmdType = "AT+LCC=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetLinkCheckCount = function() {
	var cmdType = "AT+LCC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+LCT Link Check Threshold
Threshold for the number of consecutive link check or ACK failures to tolerate before setting the join status to not
joined.
*/
Device.prototype.atSetLinkCheckThreshold = function(param1) {
	var cmdType = "AT+LCT=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetLinkCheckThreshold = function() {
	var cmdType = "AT+LCC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SS Save Network Session
Saves the network session information (join) over resets allowing for a session restore (AT+RS) without requiring a
join. This command should be issued after the Dot has joined. See AT+PS if using auto join mode.
Parameters and Values
None
*/
Device.prototype.atSaveNetworkSession = function() {
	var cmdType = "AT+SS";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RS Restore Network Session
Restores the network session information (join) that was saved with the AT+SS command.
Parameters and Values
None
*/
Device.prototype.atRestoreNetworkSession = function() {
	var cmdType = "AT+RS";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+PS Preserve Session
Preserves the network session information over resets when using auto join mode (AT+NJM). If not using auto join
mode, use with the save session command (AT+SS).
Parameters and Values
Parameter1
0 Off (Default)
1 On
*/
Device.prototype.atSetPreserveSession = function(param1) {
	var cmdType = "AT+PS=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetPreserveSession = function() {
	var cmdType = "AT+PS?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXCH Transmit Channel
With an US 951MHz model, lists the available channels in the current AT+FSB setting
With an EU 868MHz model, lists the available channels in the current AT+FSB, including additional channels sent by
the network server with the JoinAccept message. With an EU 868MHz model, this command can be used to add
additional channels
Parameters and Values
None
*/
Device.prototype.atGetTransmitChannels = function() {
	var cmdType = "AT+TXCH?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXN Transmit Next
Returns the time, in milliseconds, until the next free channel is available to transmit data. The time can range from
0-2793000 milliseconds.
EU868 time to wait may be duty-cycle limit on channel or network imposed Join duty-cycle. US915 will only be
affected by the network imposed Join duty-cycle.
Network imposed join duty-cycle in LoRaWAN 1.0.1:
1.0% 0-1 hour
0.1% 1-10 hours
0.01% 10+ hours
Parameters and Values
None
*/
Device.prototype.atGetTransmitNext = function() {
	var cmdType = "AT+TXN?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TOA Time On Air
Displays the amount of on air time, in milliseconds, required to transmit the number of bytes specified at the
current data rate. (Included for informational purposes. )
Parameters and Values
Parameter1
0-242 The number of bytes used to calculate the time on air
*/
Device.prototype.atGetTimeOnAir = function(param1) {
	var cmdType = "AT+TOA=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT&V Settings and Status
Displays device settings and status in a tabular format.
Parameters and Values
None
*/
Device.prototype.atGetSettingsandStatus = function() {
	var cmdType = "AT&V";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+DC Device Class
Sets the device class. The LoRaWAN 1.0 specification defines the three device classes, Class A, B and C as follows:.
Note: Currently only Class A is supported.
■ Class A:Bi-directional End Devices allow for bi-directional communications where each end device’s uplink
transmission is followed by two short downlink receive windows. The transmission slot scheduled by the
end device is based on its communication needs with a small variation based on a random time basis
(ALOHA-type protocol). This Class A operation is the lowest power end device system for applications that
only require downlink communication from the server shortly after the end device has sent an uplink
transmission. Downlink communications from the server at any other time have to wait until the next
scheduled uplink.
■ Class B: Bi-directional end devices with scheduled receive slots allow for more receive slots. In addition to
the Class A random receive windows, Class B devices open extra receive windows at scheduled times. For
the end device to open a receive window as scheduled, it must receive a time synchronized beacon from
the gateway. This allows the server to know when the end device is listening.
■ Class C: Bi-directional end devices with maximal receive slots have nearly continuously open receive
windows, which close only when transmitting. Class C end devices use more power to operate than Class A
or Class B, but they offer the lowest latency for server to end device communication.
Parameters and Values
Parameter1
A Class A device. (Default)
B Class B device.
C Class C device.
*/
Device.prototype.atSetDeviceClass = function(param1) {
	var cmdType = "AT+DC=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetDeviceClass = function() {
	var cmdType = "AT+DC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+AP Application Port
Sets the port used for application data. Each LoRaWAN packet containing data has an associated port value. Port 0
is reserved for MAC commands, ports 1-223 are available for application use, and port 233-255 are reserved for
future LoRaWAN use.
Parameters and Values
Parameter1
1-223 The port used for application data.
*/
Device.prototype.atSetApplicationPort = function(param1) {
	var cmdType = "AT+AP=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetApplicationPort = function() {
	var cmdType = "AT+AP?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXP Transmit Power
Configures the output power of the radio in dBm, before antenna gain. The mac layer will attempt to reach this
output level but limit any transmission to the local regulations for the chosen frequency.
Note: Refer to AT+ANT to configure antenna gain.
Parameters and Values
Parameter1
0-20 dB. (Default is 11).
*/
Device.prototype.atSetTransmitPower = function(param1) {
	var cmdType = "AT+TXP=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetTransmitPower = function() {
	var cmdType = "AT+TXP?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXI Transmit Inverted
Sets TX signal inverted.
Parameters and Values
Parameter1
0 Not inverted (Default)
1 Inverted
*/
Device.prototype.atSetTransmitInverted = function(param1) {
	var cmdType = "AT+TXI=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetTransmitInverted = function() {
	var cmdType = "AT+TXI?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RXI Receive Signal Inverted
Sets RX signal inverted.
Note: Transmitted signals are inverted so motes/gateways do not see other mote/gateway packets.
Parameters and Values
Parameter1
0 Receive signal not inverted
1 Receive signal inverted (Default)
*/
Device.prototype.atSetReceiveSignalInverted = function(param1) {
	var cmdType = "AT+RXI=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetReceiveSignalInverted = function() {
	var cmdType = "AT+RXI?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RXD Receive Delay
Allows the dot to use non-default rx windows, if required by the network it is attempting to communicate with.
Opens receive window to listen for a response when sending packets with one of the +SEND commands.
Note: Setting must match that of network server, in case of OTA join the value sent in Join Accept message
overwrites this setting
Parameters and Values
Parameter1
1-15 seconds (Default)
*/
Device.prototype.atSetReceiveDelay = function(param1) {
	var cmdType = "AT+RXD=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetReceiveDelay = function() {
	var cmdType = "AT+RXD?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+FEC Forward Error Correction
Sends redundant data to compensate for unreliable communication with the goal of reducing the need to
retransmit data. Increasing redundancy increases time-on-air, LoRaWAN specifies a setting of 1 (4/5).
Parameters and Values
Parameter1
1 Sends 5 bits to represent 4 bits.
2 Sends 6 bits to represent 4 bits.
3 Sends 7 bits to represent 4 bits.
4 Sends 8 bits to represent 4 bits.
*/
Device.prototype.atSetForwardErrorCorrection = function(param1) {
	var cmdType = "AT+FEC=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetForwardErrorCorrection = function() {
	var cmdType = "AT+FEC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+CRC Cyclical Redundancy Check
Enable or disable Cyclical Redundancy Check(CRC) for uplink and downlink packets. Must be enabled to be
compliant with LoRaWAN. Packets received with a bad CRC are discarded.
Parameters and Values
Parameter1
0 CRC disabled
1 CRC enabled (Default)
*/
Device.prototype.atSetCyclicalRedundancyCheck = function(param1) {
	var cmdType = "AT+CRC=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetCyclicalRedundancyCheck = function() {
	var cmdType = "AT+CRC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+ADR Adaptive Data Rate
Enable or disable adaptive data rate for your device. For more information on Adpative Data Rate, refer to your
device's Developer Guide.
Parameters and Values
Parameter1
0 ADR disabled (Default)
1 ADR enabled
*/
Device.prototype.atSetAdaptiveDataRate = function(param1) {
	var cmdType = "AT+ADR=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetAdaptiveDataRate = function() {
	var cmdType = "AT+ADR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXDR TX Data Rate
Sets the current data rate to use, DR0-DR15 can be entered as input in addition to (7-12) or (SF_7-SF_12).
Parameters and Values
Parameter1
7-10 915MHz Models (Default is 9)
7-12 868MHz Models
*/
Device.prototype.atSetTXDataRate = function(param1) {
	var cmdType = "AT+TXDR=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetTXDataRate = function() {
	var cmdType = "AT+TXDR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SDR Session Data Rate
Display the current data rate the LoRaMAC layer is using. It can be changed by the network server if ADR is
enabled.
Parameters and Values
None
*/

Device.prototype.atGetSessionDataRate = function() {
	var cmdType = "AT+SDR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+REP Repeat Packet
Repeats each frame as many times as indicated or until downlink from network server is received. This setting
increases redundancy to increase change of packet to be received by the gateway at the expense of increasing
network congestion. When enabled, debug output shows multiple packets being sent. On the Conduit, an MQTT
client can listen to the 'packet_recv' topic to see that duplicate packets are received, but not forwarded to the up
topic.
Parameters and Values
Parameter1
0-15 Number of send attempts. (Default)
*/
Device.prototype.atSetRepeatPacket = function(param1) {
	var cmdType = "AT+REP=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetRepeatPacket = function() {
	var cmdType = "AT+REP?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SEND Send
Sends supplied data and opens a receive window to receive data from the gateway/network server. If a data
packet is received, it is output following AT+SEND. To configure the receive data format, use the AT+RXO
command.
*/
Device.prototype.atSend = function(param1) {
	var cmdType = "AT+SEND=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SENDB Send Binary
Functions as the +SEND command, but sends hexadecimal data.
Parameters and Values
Parameter1
String of up to 242 eight bit hexadecimal values. Each value may range from 00 to FF.
*/
Device.prototype.atSendBinary = function(param1) {
	var cmdType = "AT+SENDB";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RECV Receive Once
Displays the last payload received. It does not initiate reception of new data. Use +SEND to initiate receiving data
from the network server.
*/
Device.prototype.atReceiveOnce = function() {
	var cmdType = "AT+RECV";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RXO Receive Output
Formats the receive data output. Data is either processed into hexadecimal data or left unprocessed/raw.
Hexadecimal outputs the byte values in the response. Raw/Unprocessed outputs the actual bytes on the serial
interface.
Parameters and Values
Parameter1
0 Hexadecimal (Default)
1 Raw/Unprocessed
*/
Device.prototype.atSetReceiveOutput = function(param1) {
	var cmdType = "AT+RXO=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetReceiveOutput = function() {
	var cmdType = "AT+RXO?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+DP Data Pending
Indicates there is at least one packet pending on the gateway for this end device. This indication is communicated
to the end device in any packet coming from the server. Each packet contains a data pending bit.
*/
Device.prototype.atGetDataPending = function() {
	var cmdType = "AT+DP?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXW Transmit Wait
Enables or disables waiting for RX windows to expire after sending.
Note: Non-blocking operation may disrupt the Dot's ability to receive downlink packets.
Parameter1
0 Do not wait. Not recommended.
1 Wait (Default)
*/
Device.prototype.atSetTransmitWait = function(param1) {
	var cmdType = "AT+TXW=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetTransmitWait = function() {
	var cmdType = "AT+TXW?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT&R Reset Statistics
Resets device statistics displayed with the AT&S command.
Parameters and Values
None
*/
Device.prototype.atResetStatistics = function() {
	var cmdType = "AT&R";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT&S Statistics
Displays device statistics including join attempts, join failures, packets sent, packets received and missed acks. Use
AT&R to reset/clear the statistics.
Parameters and Values
None
*/
Device.prototype.atGetStatistics = function() {
	var cmdType = "AT&S";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RSSI Signal Strength
Displays signal strength information for all packets received from the gateway since the last reset. There are four
signal strength values, which, in order, are: last packet RSSI, minimum RSSI, maximum RSSI and average RSSI.
Values range from -140dB to 0dB.
Parameters and Values
None
*/
Device.prototype.atGetRSSI = function() {
	var cmdType = "AT+RSSI";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SNR Signal to Noise Ratio
Displays signal to noise ratio for all packets received from the gateway since the last reset. There are four signal to
noise ratio values, which, in order, are: last packet SNR, minimum SNR, maximum SNR and average SNR. Values
range from -20dBm to 20dBm.
Parameters and Values
None
*/
Device.prototype.atGetSNR = function() {
	var cmdType = "AT+SNR";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SD Serial Data Mode
Reads serial data, sends packets, and then sleeps using wake settings. The escape sequence is +++.
■ When +++ is received to escape serial data mode all buffer data will be discarded.
■ CTS is handled by the serial driver and is relative to its buffer size. When flow control is enabled, see AT&K.
■ mDot firmware serial buffer size is 512 bytes
Parameters and Values
None
*/
Device.prototype.atSerialDataMode = function() {
	var cmdType = "AT+SD";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SMODE Startup Mode
Configures which operation mode the end device powers up in, either AT command mode or serial data mode.
■ AT Command mode: The end device powers up or resets in command mode. AT commands are used to
send and receive data.
■ Serial data mode: Allows the end device to send and receive data without entering AT commands. Data
is sent and received based on wake command settings. This mode requires network join mode to be set
for either auto join or peer-to-peer mode. (AT+NJM=2 or 3).
Note: To exit serial data mode, reset the end device and input+++ within one second. If the end device
responds to AT commands, the +++ was successful. After exiting data mode issue AT+SMODE=0 to disable
data mode and AT&W to save the change.
Parameters and Values
Parameter1
0 AT command mode (Default)
1 Serial data mode
*/
Device.prototype.atSetStartupMode = function(param1) {
	var cmdType = "AT+SMODE=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetStartupMode = function() {
	var cmdType = "AT+SMODE?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SDCE Serial Data Clear on Error
Sets the device to either keep or discard data in the serial buffer when an error occurs.
In serial data mode, the dot wakes periodically to received data on the serial pins and transmit out the radio. If the
data cannot be sent, this setting indicates the how device handles the buffered data. Data can either be kept in the
buffer to be resent until successful or be discarded.
Parameters and Values
Parameter1
0 Data that cannot be sent remains in the serial buffer for later transmission
1 Data that cannot be sent is discarded
*/
Device.prototype.atSetSDCE = function(param1) {
	var cmdType = "AT+SDCE=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetSDCE = function() {
	var cmdType = "AT+SDCE?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SLEEP Sleep Mode
Puts the end device in sleep mode. The end device wakes on interrupt or interval based on AT+WM setting. Once
awakened, use AT+SLEEP again to return to sleep mode.
Parameters and Values
Parameter1
0 Deep sleep (ST Micro standby mode)
1 Sleep (ST Micro stop mode)
*/
Device.prototype.atSetSleepMode = function(param1) {
	var cmdType = "AT+SLEEP=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetSleepMode = function() {
	var cmdType = "AT+SLEEP?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+WM Wake Mode
Configures the end device to wake from sleep mode either on a time interval (set by AT+WI) or by an interrupt. For
details on interval mode, refer to +WI. For details on interrupt mode, refer to +WP.
Parameters and Values
Parameter1
0 Wake on interval. (Default)
1 Wake on interrupt
*/
Device.prototype.atSetWakeMode = function(param1) {
	var cmdType = "AT+WM=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetWakeMode = function() {
	var cmdType = "AT+WM?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+WI Wake Interval
When using wake mode set to interval, use this command to configure the number of seconds the end device
sleeps when in sleep mode. Upon waking, it waits +WD amount of time for an initial character then +WTO amount
of time for each additional character.
Parameters and Values
Parameter1
2-2147483647 seconds (Default is 2)
*/
Device.prototype.atSetWakeInterval = function(param1) {
	var cmdType = "AT+WI=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetWakeInterval = function() {
	var cmdType = "AT+WI?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+WD Wake Delay
Configures the maximum amount of time to wait for data when the device wakes up from sleep mode. If this timer
expires, the device goes back to sleep. If the device received at least one character before this timer expires, the
device continues to read input until either the payload is reached or the +WTO timer expires at which time it sends
the collected data and goes to sleep.
Parameters and Values
Parameter1
2-2147483647 milliseconds (Default is 100)
*/
Device.prototype.atSetWakeDelay = function(param1) {
	var cmdType = "AT+WD=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetWakeDelay = function() {
	var cmdType = "AT+WD?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+WTO Wake Timeout
Configures the amount of time that the device waits for subsequent characters following the first character
received upon waking. Once this timer expires, the collected data is sent and the end device goes back to sleep.
Parameters and Values
Parameter1
0-65000 milliseconds (Default is 20)
*/
Device.prototype.atSetWakeTimeout = function(param1) {
	var cmdType = "AT+WTO=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetWakeTimeout = function() {
	var cmdType = "AT+WTO?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};


/*
AT+ANT Antenna Gain
Allows a non-default antenna to be used while still adhering to transmit power regulations.
Parameters and Values
Parameter1
-128 to 127 (Default is 3)
*/
Device.prototype.atSetAntennaGain = function(param1) {
	var cmdType = "AT+ANT=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetAntennaGain = function() {
	var cmdType = "AT+ANT?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RXDR Receive Data Rate
Sets the receive data rate. Used to configure the receive data rate that AT+RECVC uses for receiving packets.
Note: This command is used for compliance testing. It is not intended for the typical end user.
Parameters and Values
Parameter1
7-10 915MHz model (Default is 9)
7-12 868MHz model
*/
Device.prototype.atSetReceiveDataRate = function(param1) {
	var cmdType = "AT+RXDR=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetReceiveDataRate = function() {
	var cmdType = "AT+RXDR?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RXF Receive Frequency
Configures the frequency that +RECVC listens to for received packets.
Note: This command is used for compliance testing. It is not intended for the typical end user.
Parameters and Values
Parameter1
0
902000000-928000000 (Default is 903700000)
*/
Device.prototype.atSetReceiveFrequency = function(param1) {
	var cmdType = "AT+RXF=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetReceiveFrequency = function() {
	var cmdType = "AT+RXF?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+RECVC Receive Continuously
Causes the device to receive packets continuously on the frequency configured via AT+RXF and at the data rate
configured via AT+RXDR. Use +++ to exit this mode. It can take many seconds to get an OK following +++.
Note: This command is used for compliance testing. It is not intended for the typical end user.
Parameters and Values
None
*/
Device.prototype.atSetReceiveContinuously = function() {
	var cmdType = "AT+RECVC";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetReceiveContinuously = function() {
	var cmdType = "AT+RECVC?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+SENDI Send on Interval
Functions the same as the +SEND command,except that it takes an additional parameter as the interval then
continually sends and receives on that interval. Issue +++ to stop sending.
Note: This command is used for compliance testing. It is not intended for the typical end user.
Parameter1
100-2147483647 milliseconds
Parameter2
Up to 242 bytes of data or the max payload size based on the spreading factor (see AT+TXDR)
*/
Device.prototype.atSetSendOnInterval = function(param1, param2) {
	var cmdType = "AT+SENDI=";
	var cmdString = cmdType + param1 + "," + param2;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

/*
AT+TXF Transmit Frequency
Set Tx frequency used in Peer-to-Peer mode. To avoid interference with LoRaWAN networks, use 915.5-919.7 MhZ
for US 915 devices and a fixed 869.85 MHz for EU 868 devices.
Note: The parameter ranges below are used for compliance testing and are not intended for the typical end
user.
Parameter1
US915 - (0,902000000-928000000)
EU868 - (0,863000000-870000000)
*/
Device.prototype.atSetTransmitFrequency = function(param1) {
	var cmdType = "AT+TXF=";
	var cmdString = cmdType + param1;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};

Device.prototype.atGetTransmitFrequency = function() {
	var cmdType = "AT+TXF?";
	var cmdString = cmdType;
	return this.cmdInterface.addToWriteQueue(cmdType, cmdString);
};


//returns a promise
//resolves true if joining successful
//reolsves false if failed to join
Device.prototype.joinNetwork = function(networkObj) {
	//console.log("Joining Network...");
	var Device = this;
	var networkId = networkObj.networkId;
	var networkKey = networkObj.networkKey;
	return new Promise(function(resolve, reject) {
		Device.atSetNetworkId(1, networkId)
			.then(function() {
				return Device.atSetNetworkKey(1, networkKey);
			})
			.then(function() {
				return Device.atJoinNetwork();
			})
			.then(function(response) {
				if (response[1] === "OK") {
					console.log("Joining successful");
					resolve([true, ""]);
				} else {
					console.log("Failed to join");
					resolve([false, response[1]]);
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
Device.prototype.sendData = function(msgObj) {
	var Device = this;
	var payload = msgObj.payload;
	return new Promise(function(resolve, reject) {
		Device.atSend(payload)
			.then(function(response) {
				if (response[1] == 'ERROR') {
					resolve([false, response[0]]);
				} else {
					var rxArray = [];
					for (var i = 0; i < response.length; i++) {
						if (response[i] == 'OK') {
							break;
						}
						rxArray.push(response[i]);
					}
					console.log("mDot RX array", rxArray);
					resolve([true].concat(rxArray));
				}
			})
			.catch(function(err) {
				console.log("err", err);
			});
	});
};

//Returns promise that resolves with true if join status is true
Device.prototype.getJoinStatus = function() {
	var Device = this;
	return new Promise(function(resolve, reject) {
		Device.atGetNetworkJoinStatus()
			.then(function(response) {
				if (response[0] == 1) {
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

//Assigns responseHandlers to each command type and stores in an object
Device.prototype.generateCmdObject = function() {
	var Device = this;
	var i = 0;
	Device.responseHandler = {};
	var cmdArray = [
		'AT', 'ATI', 'ATZ', 'ATE', 'ATV', 'AT&K', 'AT&K?', 'AT&F', 'AT&W', 'AT+WP=', 'AT+WP?',
		'AT+IPR=', 'AT+IPR?', 'AT+DIPR=', 'AT+DIPR?', 'AT+LOG=', 'AT+LOG?', 'AT+DI?',
		'AT+FREQ', 'AT+FSB=', 'AT+FSB?', 'AT+PN=', 'AT+PN?', 'AT+JBO=', 'AT+JBO?', 'AT+NJM=',
		'AT+NJM?', 'AT+JOIN', 'AT+JR=', 'AT+JR?', 'AT+JD=', 'AT+JD?',
		'AT+NI=', 'AT+NI?', 'AT+NK=', 'AT+NK?', 'AT+JD=', 'AT+JD?', 'AT+NA=', 'AT+NA?',
		'AT+NSK=', 'AT+NSK?', 'AT+DSK=', 'AT+DSK?', 'AT+ULC=', 'AT+ULC?', 'AT+DLC=', 'AT+DLC?',
		'AT+NJS?', 'AT+PING', 'AT+ACK=', 'AT+ACK?', 'AT+NLC?', 'AT+LCC=', 'AT+LCC?',
		'AT+LCT=', 'AT+LCT?', 'AT+SS', 'AT+RS', 'AT+PS=', 'AT+PS?', 'AT+TXCH?', 'AT+TXN?',
		'AT+TOA=', 'AT&V', 'AT+DC=', 'AT+DC?', 'AT+AP=', 'AT+AP?', 'AT+TXP=', 'AT+TXP?',
		'AT+TXI=', 'AT+TXI?', 'AT+RXI=', 'AT+RXI?', 'AT+RXD=', 'AT+RXD?', 'AT+FEC=', 'AT+FEC?',
		'AT+CRC=', 'AT+CRC?', 'AT+ADR=', 'AT+ADR?', 'AT+TXDR=', 'AT+TXDR?', 'AT+SDR?',
		'AT+REP=', 'AT+REP?', 'AT+SEND=', 'AT+SENDB=', 'AT+RECV', 'AT+RXO=', 'AT+RXO?',
		'AT+DP?', 'AT+TXW=', 'AT+TXW?', 'AT&R', 'AT&S', 'AT+RSSI', 'AT+SNR', 'AT+SD',
		'AT+SMODE=', 'AT+SMODE?', 'AT+SDCE=', 'AT+SDCE?', 'AT+SLEEP=', 'AT+SLEEP?',
		'AT+WM=', 'AT+WM?', 'AT+WI=', 'AT+WI?', 'AT+WD=', 'AT+WD?', 'AT+WTO=', 'AT+WTO?',
		'AT+ANT=', 'AT+ANT?', 'AT+RXDR=', 'AT+RXDR?', 'AT+RXF=', 'AT+RXF?', 'AT+RECVC',
		'AT+RECVC?', 'AT+SENDI=', 'AT+TXF=', 'AT+TXF?'
	];

	for (i = 0; i < cmdArray.length; i++) {
		Device.responseHandler[cmdArray[i]] = responseHandler1;
	}
	//console.log("responseHandler", Device.responseHandler);
};

var responseHandler1 = function(commandResponse) {
	return new Promise(function(resolve, reject) {
		var rate = 100;
		var count = 0;
		var response = "";
		var waitTime = 60000;
		var interval = setInterval(function() {
			//console.log("Waiting for response.....");
			if (commandResponse.length) { //Check if there has been a response..
				response = commandResponse;
				resolve(response);
				clearInterval(interval);
				//console.log("Response cleared");
			} else if (count >= (waitTime / rate)) {
				reject("Device response timeout");
				clearInterval(interval);
			}
			count++;
		}, rate);
	});
};

module.exports = function(options) {
	var instance = new Device(options);
	return instance;
};