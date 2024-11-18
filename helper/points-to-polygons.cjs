const fs = require('fs');

// Read the input file 'output_with_layers.json'
fs.readFile('output_with_layers.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const inputObject = JSON.parse(data);

        // Transform the object to the desired format for transformed_output.json
        const transformedArray = Object.keys(inputObject).map(key => {
            const { points, layer } = inputObject[key];
            return {
                name: key,
                region: layer,
                points: points
            };
        });

        // Write the transformed data to 'transformed_output.json'
        fs.writeFile('transformed_output.json', JSON.stringify(transformedArray, null, 2), (err) => {
            if (err) {
                console.error('Error writing to the file:', err);
                return;
            }
            console.log('Transformed data has been saved to transformed_output.json');
        });

        // Now, let's create the 'territory_output.json' file
        const territoryArray = Object.keys(inputObject).map((key, index) => {
            const { layer } = inputObject[key];
            return {
                id: index,
                name: key,
                connections: [], // Empty connections array for now
                continent: layer
            };
        });

        // Write the territory data to 'territory_output.json'
        fs.writeFile('territory_output.json', JSON.stringify(territoryArray, null, 2), (err) => {
            if (err) {
                console.error('Error writing to the file:', err);
                return;
            }
            console.log('Territory data has been saved to territory_output.json');
        });

    } catch (parseErr) {
        console.error('Error parsing JSON data:', parseErr);
    }
});
