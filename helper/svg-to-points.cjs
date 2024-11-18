const fs = require( 'fs' );
const xml2js = require( 'xml2js' );
const { pathDataToPolys } = require( 'svg-path-to-polygons' );

// Function to parse SVG and extract polygon data along with layers
async function parseSvg( inputFilePath, outputFilePath ) {
    try {
        // Read the SVG file content
        const svgData = fs.readFileSync( inputFilePath, 'utf8' );

        // Parse the SVG XML to a JavaScript object
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise( svgData );

        // Extract polygons and their points
        const polygons = {};

        // Iterate through all <g> (group) elements in the SVG
        const groups = result.svg.g || [];
        groups.forEach( group => {
            // Each group can have a name/ID representing its layer
            const groupId = group.$.id; // Get the ID of the group (layer name)

            // Now look for the <polygon> elements in this group
            const polygonsArray = group.polygon || [];
            polygonsArray.forEach( ( polygon, i ) => {
                const id = polygon.$.id || i; // Get the ID of the polygon
                const points = polygon.$.points; // Get the points as a string

                // Convert points string into an array of tuples (x, y)
                const pointsArray = points.split( ' ' )
                    .reduce( ( result, _, index, array ) => index % 2 === 0 ? [...result, array.slice( index, index + 2 )] : result, [] )
                    .map( point => {
                        const [x, y] = point.map( Number ).map( Math.floor ); // Split the point and convert to numbers
                        return [x, y];
                    } );

                // Add the polygon to the object with its layer
                polygons[id] = {
                    points: pointsArray,
                    layer: groupId || 'unknown' // Assign the layer, default to 'unknown' if no layer found
                };
            } );

            const pathArray = group.path || [];
            pathArray.forEach( ( path, i ) => {
                const id = path.$.id || i; // Get the ID of the polygon
                const pathData = path.$.d; // Get the points as a string

                const points = JSON.parse(JSON.stringify(pathDataToPolys( pathData, {
                    tolerance: 1,
                    decimals: 0
                } )))[0].map(cord => cord.map(Math.floor))

                polygons[id] = {
                    points: points,
                    layer: groupId || 'unknown' // Assign the layer, default to 'unknown' if no layer found
                };
            } )
        } );

        // Write the polygons object with layers to the output file
        fs.writeFileSync( outputFilePath, JSON.stringify( polygons, null, 2 ), 'utf8' );
        console.log( `Polygon data with layers has been written to ${outputFilePath}` );
    } catch ( error ) {
        console.error( 'Error reading or parsing SVG:', error );
    }
}

// Provide the path to the input SVG file and the output JSON file
const inputFilePath = 'input.svg'; // Adjust with your actual input SVG file path
const outputFilePath = 'output_with_layers.json'; // Adjust with your desired output file path

// Call the parseSvg function
parseSvg( inputFilePath, outputFilePath );
