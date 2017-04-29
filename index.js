/**
 * @fileoverview Returns instance of radio selected in config
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */

var defaultConfig = require("./config");

module.exports = function(config) {
	console.log("the config you passed",config);
	if (config != undefined && config != null) {
		if (config.radioType == "rn2903") {
			console.log("radio selected: rn2903")
			return require("./lib/rn2903.js")(config);
		} else {
			console.log("radio selected: mDot")
			return require("./lib/mDot.js")(config);
		}
	} else {
		console.log("default radio selected: mDot")
		return require("./lib/mDot.js")(defaultConfig);
	}
}