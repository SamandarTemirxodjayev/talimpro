const fs = require("node:fs/promises");
const path = require("node:path");
const lockfile = require("lockfile");

const lockPath = path.join(__dirname, "file.lock");
console.log(lockPath); // Path for the lock file

// Function to acquire a lock
const acquireLock = async () => {
	return new Promise((resolve, reject) => {
		lockfile.lock(lockPath, {retries: 10, retryWait: 100}, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
};

// Function to release the lock
const releaseLock = async () => {
	return new Promise((resolve, reject) => {
		lockfile.unlock(lockPath, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
};

exports.updateOrAddObject = async (filePath, newObj) => {
	try {
		await acquireLock();

		let jsonArray = [];
		try {
			const data = await fs.readFile(filePath, "utf8");
			if (data) {
				jsonArray = JSON.parse(data);
				if (!Array.isArray(jsonArray)) {
					throw new Error("JSON file does not contain an array.");
				}
			}
		} catch (err) {
			if (err.code === "ENOENT") {
				jsonArray = []; // Initialize if file does not exist
			} else {
				throw err;
			}
		}

		let index = jsonArray.findIndex((obj) => obj.phone === newObj.phone);

		if (index !== -1) {
			jsonArray[index] = {...jsonArray[index], ...newObj};
			console.log(`Updated object at index ${index}`);
		} else {
			jsonArray.push(newObj);
			console.log("Added new object");
		}

		await fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), "utf8");
		console.log("File updated successfully!");
	} catch (err) {
		console.error("Error handling file:", err);
	} finally {
		await releaseLock();
	}
};
exports.deleteObject = async (filePath, keyToDelete) => {
	fs.readFile(filePath, "utf8", (err, data) => {
		let jsonArray = [];

		if (err) {
			if (err.code === "ENOENT") {
				console.log("File not found.");
				return;
			} else {
				console.error("Error reading file:", err);
				return;
			}
		} else {
			try {
				if (data) {
					jsonArray = JSON.parse(data);

					if (!Array.isArray(jsonArray)) {
						throw new Error("JSON file does not contain an array.");
					}
				}
			} catch (parseError) {
				return;
			}
		}

		const filteredArray = jsonArray.map((obj) => {
			if (obj.hasOwnProperty(keyToDelete)) {
				delete obj[keyToDelete];
			}

			return obj;
		});

		fs.writeFile(
			filePath,
			JSON.stringify(filteredArray, null, 2),
			"utf8",
			(err) => {
				if (err) {
					console.error("Error writing file:", err);
					return;
				}
				console.log("File updated after deletion successfully!");
			},
		);
	});
};
