// Territories data (simplified polygons and layout)
const territories = [
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
const territoryPolygons = [
    //Alaska
    [[9, 14], [13, 14], [13, 15], [17, 15], [17, 20], [18, 20], [18, 21], [19, 21], [19, 22], [20, 22], [20, 23], [21, 23], [21, 24], [20, 24], [20, 25], [19, 25], [19, 23], [18, 23], [18, 22], [16, 22], [16, 21], [15, 21], [15, 22], [14, 22], [14, 21], [13, 21], [13, 22], [12, 22], [12, 23], [11, 23], [11, 24], [10, 24], [10, 22], [11, 22], [11, 21], [9, 21], [9, 19], [10, 19], [10, 18], [9, 18], [9, 17], [10, 17], [10, 15], [9, 15]],
    //Northwest Territory
    [[17, 15], [23, 15], [23, 14], [25, 14]],
    //Greenland
    [[175, 0], [225, 0], [225, 50], [175, 50]],
    //Alberta
    [[18, 20], [32, 20], [32, 29], [23, 29], [23, 27], [22, 27], [22, 25], [21, 25], [21, 24], [22, 24], [22, 23], [21, 23], [21, 22], [20, 22], [20, 21], [19, 21]],
    //Ontario
    [[32, 20], [38, 20], [41, 24], [41, 31], [39, 31], [39, 30], [38, 30], [38, 28], [37, 28], [37, 29], [32, 29]],
    //Quebec
    [[43, 19], [46, 19], [48, 22], [49, 21], [44, 27], [44, 28], [41, 34], [40, 34], [40, 33], [38, 33], [38,31], [37, 31], [37, 32], [35, 32], [35, 33], [34, 33], [34, 32], [32, 32], [32, 26], [33, 26], [33, 24], [34, 24]],
    //Western United States
    [[100, 190], [160, 190], [150, 240], [110, 230]],
    //Eastern United States
    [[170, 190], [230, 190], [220, 240], [170, 230]],
    //Central America
    [[110, 250], [170, 250], [160, 290], [120, 280]],
    //Venezuela
    [[120, 300], [170, 300], [160, 350], [110, 340]],
    //Peru
    [[110, 360], [160, 360], [150, 400], [100, 390]],
    //Brazil
    [[180, 320], [230, 320], [220, 380], [170, 370]],
    //Argentina
    [[110, 410], [160, 410], [150, 450], [100, 440]],
    //Iceland
    [[300, 50], [350, 70], [340, 110], [290, 90]],
    //Scandinavia
    [[360, 30], [420, 30], [410, 90], [350, 80]],
    //Russia
    [[430, 40], [500, 40], [490, 100], [420, 90]],
    //Great Britain
    [[300, 130], [350, 140], [340, 180], [290, 170]],
    //Northern Europe
    [[360, 140], [420, 140], [410, 190], [350, 180]],
    //Western Europe
    [[290, 200], [350, 210], [340, 260], [280, 250]],
    //Southern Europe
    [[360, 200], [420, 210], [410, 260], [350, 250]],
    //North Africa
    [[270, 270], [330, 280], [320, 330], [260, 320]],
    //Egypt
    [[340, 280], [390, 280], [380, 330], [330, 320]],
    //East Africa
    [[400, 300], [450, 300], [440, 350], [390, 340]],
    //Central Africa
    [[330, 350], [380, 350], [370, 400], [320, 390]],
    //South Africa
    [[340, 410], [390, 410], [380, 460], [330, 450]],
    //Madagascar
    [[400, 420], [450, 420], [440, 470], [390, 460]],
    //Ural
    [[510, 50], [570, 50], [560, 100], [500, 90]],
    //Siberia
    [[580, 50], [640, 50], [630, 100], [570, 90]],
    //Yakutsk
    [[650, 50], [710, 50], [700, 100], [640, 90]],
    //Kamchatka
    [[720, 50], [770, 60], [760, 110], [710, 100]],
    //Irkutsk
    [[580, 120], [640, 120], [630, 170], [570, 160]],
    //Mongolia
    [[650, 120], [710, 120], [700, 170], [640, 160]],
    //Japan
    [[720, 130], [770, 140], [760, 190], [710, 180]],
    //Afghanistan
    [[500, 130], [560, 140], [550, 190], [490, 180]],
    //China
    [[570, 140], [630, 150], [620, 200], [560, 190]],
    //Middle East
    [[480, 200], [540, 200], [530, 250], [470, 240]],
    //India
    [[550, 210], [610, 220], [600, 270], [540, 260]],
    //Southeast Asia
    [[620, 230], [680, 240], [670, 290], [610, 280]],
    //Indonesia
    [[590, 310], [650, 320], [640, 370], [580, 360]],
    //New Guinea
    [[660, 320], [710, 330], [700, 380], [650, 370]],
    //Western Australia
    [[580, 380], [630, 390], [620, 440], [570, 430]],
    //Eastern Australia
    [[640, 390], [690, 400], [680, 450], [630, 440]]
];
const continents = [
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
