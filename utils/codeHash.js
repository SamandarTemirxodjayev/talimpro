const bcrypt = require("bcrypt");

exports.createHash = async (code) => {
	return await bcrypt.hash(code.toString(), 13);
};
exports.compare = async (input, code) => {
	return await bcrypt.compare(input.toString(), code);
};
