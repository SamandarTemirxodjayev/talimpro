const fs = require("fs");
const Counter = require("../models/Counter");

exports.defaultDatas = (filePath) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return reject({error: "Failed to read file"});
			}
			try {
				const file = JSON.parse(data);
				resolve(file);
			} catch (parseError) {
				reject({error: "Failed to parse JSON"});
			}
		});
	});
};
exports.AutoIncrement = function (schema, options) {
	const {modelName, fieldName, startAt = 1} = options; // Added startAt with a default value

	schema.pre("save", async function (next) {
		if (this.isNew) {
			try {
				const counter = await Counter.findOneAndUpdate(
					{model: modelName, field: fieldName},
					{$inc: {count: 1}},
					{new: true, upsert: true, setDefaultsOnInsert: true},
				);

				if (counter.count === 1 && startAt > 1) {
					// Initialize counter with startAt if it’s the first document and startAt is greater than 1
					await Counter.updateOne(
						{model: modelName, field: fieldName},
						{$set: {count: startAt}},
					);
					this[fieldName] = startAt;
				} else {
					this[fieldName] = counter.count;
				}

				next();
			} catch (err) {
				next(err);
			}
		} else {
			next();
		}
	});
};
exports.paginate = (
	page,
	limit,
	totalItems,
	data,
	baseUrl,
	path,
	additionalParams = "",
) => {
	const totalPages = Math.ceil(totalItems / limit);

	return {
		status: true,
		message: "success",
		data,
		_meta: {
			totalItems,
			currentPage: page,
			itemsPerPage: limit,
			totalPages,
		},
		_links: {
			self: `${baseUrl}${path}?page=${page}&limit=${limit}${additionalParams}`,
			next:
				page < totalPages
					? `${baseUrl}${path}?page=${
							page + 1
						}&limit=${limit}${additionalParams}`
					: null,
			prev:
				page > 1
					? `${baseUrl}${path}?page=${
							page - 1
						}&limit=${limit}${additionalParams}`
					: null,
		},
	};
};
