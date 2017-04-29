/**
 * Definition of default options object
 * @author Felix Galindo
 */

const options = {
	radioType: "rn2903",
	serialPortOptions: {
		//serialport: "/dev/ttyACM0",
		// serialport: "/dev/serial0",
		serialport: "/dev/tty.usbmodem146211",
		//serialport: "/dev/tty.usbmodem641",
		//serialport: "/dev/tty.usbmodem411",
		baudRate: 57600
	}
	// radioType: "mDot",
	// serialPortOptions: {
	// 	serialport: "/dev/ttyUSB0",
	// 	baudRate: 115200
	// }
	//serialport:"/dev/tty.usbserial-DN01DD8Z"
	//serialport: "/dev/tty.usbserial-DN01DUAD"
};

module.exports = options;