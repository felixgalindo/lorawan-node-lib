/**
 * Definition of options object for rn2903
 * @author Felix Galindo
 */

const options = {
	radioType: "rn2903",
	serialPortOptions: {
		serialport: "/dev/ttyACM0",
		// serialport: "/dev/tty.usbmodem1451",
		//serialport: "/dev/tty.usbmodem641",
		//serialport: "/dev/tty.usbmodem411",
		baudRate: 57600
	}
};

module.exports = options;