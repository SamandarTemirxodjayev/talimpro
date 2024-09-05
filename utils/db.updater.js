const fs = require('fs');

exports. updateOrAddObject = (filePath, newObj)=> {
  // Read the JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonArray = [];

    if (err) {
      if (err.code === 'ENOENT') {
        // File does not exist, initialize an empty array
        console.log('File not found, creating new file...');
        jsonArray = [];
      } else {
        console.error('Error reading file:', err);
        return;
      }
    } else {
      try {
        // If the file is not empty, parse the data
        if (data) {
          jsonArray = JSON.parse(data);

          // Ensure it's an array, if not throw an error
          if (!Array.isArray(jsonArray)) {
            throw new Error("JSON file does not contain an array.");
          }
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return;
      }
    }

    // Find if the object with the same key (e.g., phone) exists
    let index = jsonArray.findIndex(obj => obj.phone === newObj.phone);

    if (index !== -1) {
      // Object exists, update its value
      jsonArray[index] = { ...jsonArray[index], ...newObj };
      console.log(`Updated object at index ${index}`);
    } else {
      // Object doesn't exist, add it to the array
      jsonArray.push(newObj);
      console.log('Added new object');
    }

    // Write the updated array back to the file
    fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('File updated successfully!');
    });
  });
}

exports.deleteObject = async (filePath, keyToDelete) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonArray = [];

    if (err) {
      if (err.code === 'ENOENT') {
        console.log('File not found.');
        return;
      } else {
        console.error('Error reading file:', err);
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

    const filteredArray = jsonArray.map(obj => {
      if (obj.hasOwnProperty(keyToDelete)) {
        delete obj[keyToDelete];
      }

      return obj;
    });


    fs.writeFile(filePath, JSON.stringify(filteredArray, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('File updated after deletion successfully!');
    });
  });
}
