// Territories data (simplified polygons and layout)
export const territories = [
    //North America
    { "id": 0, "name": "Alaska", "connections": [1, 3, 29], "continent": "North America" },
    { "id": 1, "name": "Northwest Territory", "connections": [0, 2, 3, 4], "continent": "North America" },
    { "id": 2, "name": "Greenland", "connections": [1, 4, 5, 13], "continent": "North America" },
    { "id": 3, "name": "Alberta", "connections": [0, 1, 4, 6], "continent": "North America" },
    { "id": 4, "name": "Ontario", "connections": [1, 2, 3, 5, 6, 7], "continent": "North America" },
    { "id": 5, "name": "Quebec", "connections": [1, 2, 3, 5, 6, 7], "continent": "North America" },
    { "id": 6, "name": "Western United States", "connections": [3, 4, 7, 8], "continent": "North America" },
    { "id": 7, "name": "Eastern United States", "connections": [4, 5, 6, 8], "continent": "North America" },
    { "id": 8, "name": "Central America", "connections": [6, 7, 9], "continent": "North America" },
    //South America
    { "id": 9, "name": "Venezuela", "connections": [8, 10, 11], "continent": "South America" },
    { "id": 10, "name": "Peru", "connections": [9, 11, 12], "continent": "South America" },
    { "id": 11, "name": "Brazil", "connections": [9, 10, 12, 20], "continent": "South America" },
    { "id": 12, "name": "Argentina", "connections": [10, 11], "continent": "South America" },
    //Europe
    { "id": 13, "name": "Iceland", "connections": [2, 14, 16], "continent": "Europe" },
    { "id": 14, "name": "Scandinavia", "connections": [13, 15, 16, 17], "continent": "Europe" },
    { "id": 15, "name": "Russia", "connections": [14, 17, 19, 26, 33, 35], "continent": "Europe" },
    { "id": 16, "name": "Great Britain", "connections": [13, 14, 17, 18], "continent": "Europe" },
    { "id": 17, "name": "Northern Europe", "connections": [14, 15, 16, 18, 19], "continent": "Europe" },
    { "id": 18, "name": "Western Europe", "connections": [16, 17, 19, 20], "continent": "Europe" },
    { "id": 19, "name": "Southern Europe", "connections": [15, 17, 18, 20, 21, 35], "continent": "Europe" },
    //Africa
    { "id": 20, "name": "North Africa", "connections": [11, 18, 19, 21, 22, 23], "continent": "Africa" },
    { "id": 21, "name": "Egypt", "connections": [19, 20, 22, 35], "continent": "Africa" },
    { "id": 22, "name": "East Africa", "connections": [20, 21, 23, 24, 25, 35], "continent": "Africa" },
    { "id": 23, "name": "Central Africa", "connections": [20, 22, 24], "continent": "Africa" },
    { "id": 24, "name": "South Africa", "connections": [22, 23, 25], "continent": "Africa" },
    { "id": 25, "name": "Madagascar", "connections": [22, 24], "continent": "Africa" },
    //Asia
    { "id": 26, "name": "Ural", "connections": [15, 27, 33, 34], "continent": "Asia" },
    { "id": 27, "name": "Siberia", "connections": [26, 28, 30, 31], "continent": "Asia" },
    { "id": 28, "name": "Yakutsk", "connections": [27, 30, 29], "continent": "Asia" },
    { "id": 29, "name": "Kamchatka", "connections": [0, 28, 31, 32, 30], "continent": "Asia" },
    { "id": 30, "name": "Irkutsk", "connections": [27, 28, 29, 31], "continent": "Asia" },
    { "id": 31, "name": "Mongolia", "connections": [27, 29, 30, 32, 34], "continent": "Asia" },
    { "id": 32, "name": "Japan", "connections": [29, 31], "continent": "Asia" },
    { "id": 33, "name": "Afghanistan", "connections": [15, 26, 34, 35, 36], "continent": "Asia" },
    { "id": 34, "name": "China", "connections": [26, 33, 37, 27, 31, 36], "continent": "Asia" },
    { "id": 35, "name": "Middle East", "connections": [15, 19, 21, 22, 33, 36], "continent": "Asia" },
    { "id": 36, "name": "India", "connections": [33, 34, 35, 37], "continent": "Asia" },
    { "id": 37, "name": "Southeast Asia", "connections": [34, 36, 38], "continent": "Asia" },
    //Australia
    { "id": 38, "name": "Indonesia", "connections": [37, 39, 40], "continent": "Australia" },
    { "id": 39, "name": "New Guinea", "connections": [38, 41], "continent": "Australia" },
    { "id": 40, "name": "Western Australia", "connections": [38, 41], "continent": "Australia" },
    { "id": 41, "name": "Eastern Australia", "connections": [39, 40], "continent": "Australia" }
];
export const territoryPolygons = [
    //Alaska
    [ [ 52, 84.5 ], [ 78, 84.5 ], [ 78, 91 ], [ 104, 91 ], [ 104, 123.5 ], [ 110.5, 123.5 ], [ 110.5, 130 ], [ 117, 130 ], [ 117, 136.5 ], [ 123.5, 136.5 ], [ 123.5, 143 ], [ 130, 143 ], [ 130, 149.5 ], [ 123.5, 149.5 ], [ 123.5, 156 ], [ 117, 156 ], [ 117, 143 ], [ 110.5, 143 ], [ 110.5, 136.5 ], [ 97.5, 136.5 ], [ 97.5, 130 ], [ 91, 130 ], [ 91, 136.5 ], [ 84.5, 136.5 ], [ 84.5, 130 ], [ 78, 130 ], [ 78, 136.5 ], [ 71.5, 136.5 ], [ 71.5, 143 ], [ 65, 143 ], [ 65, 149.5 ], [ 58.5, 149.5 ], [ 58.5, 136.5 ], [ 65, 136.5 ], [ 65, 130 ], [ 52, 130 ], [ 52, 117 ], [ 58.5, 117 ], [ 58.5, 110.5 ], [ 52, 110.5 ], [ 52, 104 ], [ 58.5, 104 ], [ 58.5, 91 ], [ 52, 91 ] ],
    [[100, 50], [170, 50], [160, 100], [100, 90]],
    [[200, 30], [290, 30], [270, 90], [210, 80]],
    //Alberta
    [ [ 110.5, 123.5 ], [ 201.5, 123.5 ], [ 201.5, 182 ], [ 143, 182 ], [ 143, 169 ], [ 136.5, 169 ], [ 136.5, 156 ], [ 130, 156 ], [ 130, 149.5 ], [ 136.5, 149.5 ], [ 136.5, 143 ], [ 130, 143 ], [ 130, 136.5 ], [ 123.5, 136.5 ], [ 123.5, 130 ], [ 117, 130 ] ],
    //Ontario
    [ [ 201.5, 123.5 ], [ 240.5, 123.5 ], [ 260, 149.5 ], [ 260, 195 ], [ 247, 195 ], [ 247, 188.5 ], [ 240.5, 188.5 ], [ 240.5, 175.5 ], [ 234, 175.5 ], [ 234, 182 ], [ 201.5, 182 ] ],
    [[240, 120], [290, 90], [280, 150], [230, 180]],
    [[100, 190], [160, 190], [150, 240], [110, 230]],
    [[170, 190], [230, 190], [220, 240], [170, 230]],
    [[110, 250], [170, 250], [160, 290], [120, 280]],
    //Venezuela
    [ [ 188.5, 299 ], [ 214.5, 292.5 ], [ 279.5, 312 ], [ 266.5, 325 ], [ 240.5, 325 ], [ 234, 318.5 ], [ 214.5, 318.5 ], [ 188.5, 344.5 ], [ 175.5, 331.5 ], [ 175.5, 312 ], [ 182, 305.5 ], [ 188.5, 305.5 ] ],
    //Peru
    [ [ 175.5, 422.5 ], [ 188.5, 422.5 ], [ 247, 403 ], [ 247, 409.5 ], [ 273, 409.5 ], [ 240.5, 364 ], [ 208, 364 ], [ 188.5, 344.5 ], [ 175.5, 331.5 ], [ 156, 351 ] ],
    //Brazil
    [ [ 279.5, 312 ], [ 325, 338 ], [ 318.5, 403 ], [ 286, 442 ], [ 273, 422.5 ], [ 273, 409.5 ], [ 240.5, 364 ], [ 208, 364 ], [ 188.5, 344.5 ], [ 214.5, 318.5 ], [ 234, 318.5 ], [ 240.5, 325 ], [ 266.5, 325 ] ],
    //Argentina
    [ [ 175.5, 422.5 ], [ 188.5, 422.5 ], [ 247, 403 ], [ 247, 409.5 ], [ 273, 409.5 ], [ 273, 422.5 ], [ 286, 442 ], [ 234, 500.5 ], [ 234, 546 ], [ 253.5, 578.5 ], [ 253.5, 585 ], [ 253.5, 585 ], [ 247, 585 ], [ 188.5, 546 ], [ 188.5, 448.5 ] ],
    [[300, 50], [350, 70], [340, 110], [290, 90]],
    [[360, 30], [420, 30], [410, 90], [350, 80]],
    [[430, 40], [500, 40], [490, 100], [420, 90]],
    [[300, 130], [350, 140], [340, 180], [290, 170]],
    [[360, 140], [420, 140], [410, 190], [350, 180]],
    [[290, 200], [350, 210], [340, 260], [280, 250]],
    [[360, 200], [420, 210], [410, 260], [350, 250]],
    [[270, 270], [330, 280], [320, 330], [260, 320]],
    [[340, 280], [390, 280], [380, 330], [330, 320]],
    [[400, 300], [450, 300], [440, 350], [390, 340]],
    [[330, 350], [380, 350], [370, 400], [320, 390]],
    [[340, 410], [390, 410], [380, 460], [330, 450]],
    [[400, 420], [450, 420], [440, 470], [390, 460]],
    [[510, 50], [570, 50], [560, 100], [500, 90]],
    [[580, 50], [640, 50], [630, 100], [570, 90]],
    [[650, 50], [710, 50], [700, 100], [640, 90]],
    [[720, 50], [770, 60], [760, 110], [710, 100]],
    [[580, 120], [640, 120], [630, 170], [570, 160]],
    [[650, 120], [710, 120], [700, 170], [640, 160]],
    [[720, 130], [770, 140], [760, 190], [710, 180]],
    [[500, 130], [560, 140], [550, 190], [490, 180]],
    [[570, 140], [630, 150], [620, 200], [560, 190]],
    [[480, 200], [540, 200], [530, 250], [470, 240]],
    [[550, 210], [610, 220], [600, 270], [540, 260]],
    [[620, 230], [680, 240], [670, 290], [610, 280]],
    [[590, 310], [650, 320], [640, 370], [580, 360]],
    [[660, 320], [710, 330], [700, 380], [650, 370]],
    [[580, 380], [630, 390], [620, 440], [570, 430]],
    [[640, 390], [690, 400], [680, 450], [630, 440]]
];
export const continents = [
    {
        name: "North America",
        territories: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        bonus: 5
    },
    {
        name: "South America",
        territories: [9, 10, 11, 12],
        bonus: 2
    },
    {
        name: "Europe",
        territories: [13, 14, 15, 16, 17, 18, 19],
        bonus: 5
    },
    {
        name: "Africa",
        territories: [20, 21, 22, 23, 24, 25],
        bonus: 3
    },
    {
        name: "Asia",
        territories: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        bonus: 7
    },
    {
        name: "Australia",
        territories: [38, 39, 40, 41],
        bonus: 2
    }
];
