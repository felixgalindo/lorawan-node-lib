/**
 * Definition of options object for mDot
 * @author Felix Galindo
 */

const options = {
	radioType: "mDot",
	serialPortOptions: {
		serialport: "/dev/ttyUSB0",
		baudRate: 115200
	}
	//serialport:"/dev/tty.usbserial-DN01DD8Z"
	//serialport: "/dev/tty.usbserial-DN01DUAD"
};

module.exports = options;