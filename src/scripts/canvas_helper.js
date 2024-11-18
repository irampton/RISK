export async function getClickedPolygonIndex( canvas, polygons ) {
    return new Promise( ( resolve ) => {
        function isPointInPolygon( point, polygon ) {
            let [x, y] = point;
            let inside = false;

            for ( let i = 0, j = polygon.length - 1; i < polygon.length; j = i++ ) {
                let [xi, yi] = polygon[i];
                let [xj, yj] = polygon[j];
                let intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

                if ( intersect ) inside = !inside;
            }
            return inside;
        }

        function handleClick( event ) {
            const rect = canvas.getBoundingClientRect();

            // Get the scale factors for the canvas (accounting for CSS scaling)
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // Calculate the mouse position within the canvas, adjusting for any scaling
            const clickX = (event.clientX - rect.left) * scaleX;
            const clickY = (event.clientY - rect.top) * scaleY;

            console.log(clickX, clickY);

            // Loop through each polygon to check if the point is inside
            for ( let i = 0; i < polygons.length; i++ ) {
                if ( isPointInPolygon( [clickX, clickY], polygons[i] ) ) {
                    canvas.removeEventListener( "click", handleClick );
                    resolve( i );
                    return;
                }
            }

            return null;
        }

        canvas.addEventListener( "click", handleClick );
    });
}

export function drawPathFromPoints(ctx, points){
    ctx.beginPath();
    ctx.moveTo( points[0][0], points[0][1] );
    for ( let i = 1; i < points.length; i++ ) {
        ctx.lineTo( points[i][0], points[i][1] );
    }
    ctx.closePath();
}

export function calculatePolygonCenter(points) {
    let area = 0;
    let centroidX = 0;
    let centroidY = 0;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [x0, y0] = points[j];
        const [x1, y1] = points[i];
        const cross = x0 * y1 - x1 * y0;

        area += cross;
        centroidX += (x0 + x1) * cross;
        centroidY += (y0 + y1) * cross;
    }

    area /= 2;
    centroidX /= (6 * area);
    centroidY /= (6 * area);

    return [centroidX, centroidY];
}
