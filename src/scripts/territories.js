// Territories data (simplified polygons and layout)
export const territories = [
    //North America
    { "id": 0, "name": "Alaska", "connections": [ 1, 3, 29 ], "continent": "North America" },
    { "id": 1, "name": "Northwest Territory", "connections": [ 0, 2, 3, 4 ], "continent": "North America" },
    { "id": 2, "name": "Greenland", "connections": [ 1, 4, 5, 13 ], "continent": "North America" },
    { "id": 3, "name": "Alberta", "connections": [ 0, 1, 4, 6 ], "continent": "North America" },
    { "id": 4, "name": "Ontario", "connections": [ 1, 2, 3, 5, 6, 7 ], "continent": "North America" },
    { "id": 5, "name": "Quebec", "connections": [ 1, 2, 3, 4, 6, 7 ], "continent": "North America" },
    { "id": 6, "name": "Western United States", "connections": [ 3, 4, 7, 8 ], "continent": "North America" },
    { "id": 7, "name": "Eastern United States", "connections": [ 4, 5, 6, 8 ], "continent": "North America" },
    { "id": 8, "name": "Central America", "connections": [ 6, 7, 9 ], "continent": "North America" },
    //South America
    { "id": 9, "name": "Venezuela", "connections": [ 8, 10, 11 ], "continent": "South America" },
    { "id": 10, "name": "Peru", "connections": [ 9, 11, 12 ], "continent": "South America" },
    { "id": 11, "name": "Brazil", "connections": [ 9, 10, 12, 20 ], "continent": "South America" },
    { "id": 12, "name": "Argentina", "connections": [ 10, 11 ], "continent": "South America" },
    //Europe
    { "id": 13, "name": "Iceland", "connections": [ 2, 14, 16 ], "continent": "Europe" },
    { "id": 14, "name": "Scandinavia", "connections": [ 13, 15, 16, 17 ], "continent": "Europe" },
    { "id": 15, "name": "Russia", "connections": [ 14, 17, 19, 26, 33, 35 ], "continent": "Europe" },
    { "id": 16, "name": "Great Britain", "connections": [ 13, 14, 17, 18 ], "continent": "Europe" },
    { "id": 17, "name": "Northern Europe", "connections": [ 14, 15, 16, 18, 19 ], "continent": "Europe" },
    { "id": 18, "name": "Western Europe", "connections": [ 16, 17, 19, 20 ], "continent": "Europe" },
    { "id": 19, "name": "Southern Europe", "connections": [ 15, 17, 18, 20, 21, 35 ], "continent": "Europe" },
    //Africa
    { "id": 20, "name": "North Africa", "connections": [ 11, 18, 19, 21, 22, 23 ], "continent": "Africa" },
    { "id": 21, "name": "Egypt", "connections": [ 19, 20, 22, 35 ], "continent": "Africa" },
    { "id": 22, "name": "East Africa", "connections": [ 20, 21, 23, 24, 25, 35 ], "continent": "Africa" },
    { "id": 23, "name": "Central Africa", "connections": [ 20, 22, 24 ], "continent": "Africa" },
    { "id": 24, "name": "South Africa", "connections": [ 22, 23, 25 ], "continent": "Africa" },
    { "id": 25, "name": "Madagascar", "connections": [ 22, 24 ], "continent": "Africa" },
    //Asia
    { "id": 26, "name": "Ural", "connections": [ 15, 27, 33, 34 ], "continent": "Asia" },
    { "id": 27, "name": "Siberia", "connections": [ 26, 28, 30, 31 ], "continent": "Asia" },
    { "id": 28, "name": "Yakutsk", "connections": [ 27, 30, 29 ], "continent": "Asia" },
    { "id": 29, "name": "Kamchatka", "connections": [ 0, 28, 31, 32, 30 ], "continent": "Asia" },
    { "id": 30, "name": "Irkutsk", "connections": [ 27, 28, 29, 31 ], "continent": "Asia" },
    { "id": 31, "name": "Mongolia", "connections": [ 27, 29, 30, 32, 34 ], "continent": "Asia" },
    { "id": 32, "name": "Japan", "connections": [ 29, 31 ], "continent": "Asia" },
    { "id": 33, "name": "Afghanistan", "connections": [ 15, 26, 34, 35, 36 ], "continent": "Asia" },
    { "id": 34, "name": "China", "connections": [ 26, 33, 37, 27, 31, 36 ], "continent": "Asia" },
    { "id": 35, "name": "Middle East", "connections": [ 15, 19, 21, 22, 33, 36 ], "continent": "Asia" },
    { "id": 36, "name": "India", "connections": [ 33, 34, 35, 37 ], "continent": "Asia" },
    { "id": 37, "name": "Southeast Asia", "connections": [ 34, 36, 38 ], "continent": "Asia" },
    //Australia
    { "id": 38, "name": "Indonesia", "connections": [ 37, 39, 40 ], "continent": "Australia" },
    { "id": 39, "name": "New Guinea", "connections": [ 38, 41 ], "continent": "Australia" },
    { "id": 40, "name": "Western Australia", "connections": [ 38, 41 ], "continent": "Australia" },
    { "id": 41, "name": "Eastern Australia", "connections": [ 39, 40 ], "continent": "Australia" }
];

import { territoryPolygons as TP } from "@/scripts/polygons.js";

export const territoryPolygons = TP.map( a => a.length === 4 ? a : a.map( b => b.map( c => c * 6.5 - 6.5 ) ) );
export const continents = [
    {
        name: "North America",
        territories: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ],
        bonus: 5
    },
    {
        name: "South America",
        territories: [ 9, 10, 11, 12 ],
        bonus: 2
    },
    {
        name: "Europe",
        territories: [ 13, 14, 15, 16, 17, 18, 19 ],
        bonus: 5
    },
    {
        name: "Africa",
        territories: [ 20, 21, 22, 23, 24, 25 ],
        bonus: 3
    },
    {
        name: "Asia",
        territories: [ 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37 ],
        bonus: 7
    },
    {
        name: "Australia",
        territories: [ 38, 39, 40, 41 ],
        bonus: 2
    }
];
