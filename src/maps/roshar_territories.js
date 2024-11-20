const territories = [
    {
        "id": 0,
        "name": "Marat",
        "connections": [1, 2, 11, 47, 48],
        "continent": "Makabak"
    },
    {
        "id": 1,
        "name": "Tukar",
        "connections": [0, 2],
        "continent": "Makabak"
    },
    {
        "id": 2,
        "name": "Emul",
        "connections": [0, 1, 4, 10],
        "continent": "Makabak"
    },
    {
        "id": 3,
        "name": "Triax",
        "connections": [12, 17],
        "continent": "Makabak"
    },
    {
        "id": 4,
        "name": "Azir",
        "connections": [2, 10, 6, 5, 29],
        "continent": "Makabak"
    },
    {
        "id": 5,
        "name": "Desh",
        "connections": [4, 6],
        "continent": "Makabak"
    },
    {
        "id": 6,
        "name": "Yezier",
        "connections": [4, 5, 7, 8, 10],
        "continent": "Makabak"
    },
    {
        "id": 7,
        "name": "Alm",
        "connections": [6, 8, 38],
        "continent": "Makabak"
    },
    {
        "id": 8,
        "name": "Liafor",
        "connections": [7, 6, 10, 9],
        "continent": "Makabak"
    },
    {
        "id": 9,
        "name": "Steen",
        "connections": [38, 8],
        "continent": "Makabak"
    },
    {
        "id": 10,
        "name": "Tashikk",
        "connections": [8, 2, 4, 6],
        "continent": "Makabak"
    },
    {
        "id": 11,
        "name": "Greater Hexi",
        "connections": [0, 12],
        "continent": "Makabak"
    },
    {
        "id": 12,
        "name": "Tu Fallia",
        "connections": [11, 3],
        "continent": "Makabak"
    },
    {
        "id": 13,
        "name": "Bavland",
        "connections": [16, 14, 17],
        "continent": "Vedan"
    },
    {
        "id": 14,
        "name": "Central Jah Keved",
        "connections": [13, 15, 16, 17, 18],
        "continent": "Vedan"
    },
    {
        "id": 15,
        "name": "Horneater Peaks",
        "connections": [14, 17, 18],
        "continent": "Vedan"
    },
    {
        "id": 16,
        "name": "Tu Bayla",
        "connections": [13, 14, 18, 28, 29, 31],
        "continent": "Vedan"
    },
    {
        "id": 17,
        "name": "Vedenar",
        "connections": [13, 15, 14, 18, 3, 44, 46, 47],
        "continent": "Vedan"
    },
    {
        "id": 18,
        "name": "North Jah Keved",
        "connections": [15, 16, 14, 17, 20, 43, 41],
        "continent": "Vedan"
    },
    {
        "id": 19,
        "name": "Abri",
        "connections": [24, 25],
        "continent": "Reshi"
    },
    {
        "id": 20,
        "name": "Herdaz",
        "connections": [18, 43, 27, 22, 21],
        "continent": "Reshi"
    },
    {
        "id": 21,
        "name": "Arak",
        "connections": [20, 22, 23],
        "continent": "Reshi"
    },
    {
        "id": 22,
        "name": "Sumi",
        "connections": [20, 21, 23],
        "continent": "Reshi"
    },
    {
        "id": 23,
        "name": "Reshi Isles",
        "connections": [21, 22, 24],
        "continent": "Reshi"
    },
    {
        "id": 24,
        "name": "Kadrix",
        "connections": [23, 19, 26],
        "continent": "Reshi"
    },
    {
        "id": 25,
        "name": "Quili",
        "connections": [19, 36],
        "continent": "Reshi"
    },
    {
        "id": 26,
        "name": "Kurth",
        "connections": [24, 33],
        "continent": "Reshi"
    },
    {
        "id": 27,
        "name": "Akak",
        "connections": [20, 43],
        "continent": "Reshi"
    },
    {
        "id": 28,
        "name": "Purelake",
        "connections": [16, 29, 30, 31],
        "continent": "Selay"
    },
    {
        "id": 29,
        "name": "Yulay",
        "connections": [4, 16, 28, 30],
        "continent": "Selay"
    },
    {
        "id": 30,
        "name": "Babatharnam",
        "connections": [29, 28, 31, 32],
        "continent": "Selay"
    },
    {
        "id": 31,
        "name": "Marabethia",
        "connections": [28, 30, 16],
        "continent": "Selay"
    },
    {
        "id": 32,
        "name": "Southern Rira",
        "connections": [30, 33, 34],
        "continent": "Iri"
    },
    {
        "id": 33,
        "name": "Northern Rira",
        "connections": [26, 32, 35],
        "continent": "Iri"
    },
    {
        "id": 34,
        "name": "Eila",
        "connections": [37, 35, 32],
        "continent": "Iri"
    },
    {
        "id": 35,
        "name": "Kasitor",
        "connections": [33, 34, 36],
        "continent": "Iri"
    },
    {
        "id": 36,
        "name": "Rall Elorim",
        "connections": [35, 25],
        "continent": "Iri"
    },
    {
        "id": 37,
        "name": "Northern Shinovar",
        "connections": [34, 38],
        "continent": "Western Roshar"
    },
    {
        "id": 38,
        "name": "Southern Shinovar",
        "connections": [37, 7, 9, 39],
        "continent": "Western Roshar"
    },
    {
        "id": 39,
        "name": "Eastern Aimia",
        "connections": [38, 40],
        "continent": "Western Roshar"
    },
    {
        "id": 40,
        "name": "Western Aimia",
        "connections": [39],
        "continent": "Western Roshar"
    },
    {
        "id": 41,
        "name": "Kholinar",
        "connections": [18, 43, 45, 44],
        "continent": "Alethi"
    },
    {
        "id": 42,
        "name": "The Shattered Plains",
        "connections": [45, 46, 49, 50],
        "continent": "Alethi"
    },
    {
        "id": 43,
        "name": "Northern Alethkar",
        "connections": [18, 20, 27, 41, 45],
        "continent": "Alethi"
    },
    {
        "id": 44,
        "name": "Rathalas",
        "connections": [41, 45, 46, 17],
        "continent": "Alethi"
    },
    {
        "id": 45,
        "name": "Unclaimed Hills",
        "connections": [41, 42, 43, 44, 46, 50],
        "continent": "Alethi"
    },
    {
        "id": 46,
        "name": "Southern Alethkar",
        "connections": [42, 44, 45, 17, 49],
        "continent": "Alethi"
    },
    {
        "id": 47,
        "name": "Kharbranth",
        "connections": [0, 17, 48, 49],
        "continent": "Thaylen"
    },
    {
        "id": 48,
        "name": "Thaylen City",
        "connections": [0, 47, 51],
        "continent": "Thaylen"
    },
    {
        "id": 49,
        "name": "Frostlands",
        "connections": [47, 51, 50, 42, 46],
        "continent": "Thaylen"
    },
    {
        "id": 50,
        "name": "New Natanan",
        "connections": [42, 45, 49],
        "continent": "Thaylen"
    },
    {
        "id": 51,
        "name": "East Thaylenah",
        "connections": [48, 49],
        "continent": "Thaylen"
    }
];

import { territoryPolygons, mapDecoration } from "./roshar_polygons.js";

const continents = [
    {
        name: 'Western Roshar',
        territories: [37, 38, 39, 40],
        bonus: 2
    },
    {
        name: 'Makabak',
        territories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        bonus: 7
    },
    {
        name: 'Iri',
        territories: [32, 33, 34, 35, 36],
        bonus: 3
    },

    {
        name: 'Selay',
        territories: [28, 29, 30, 31],
        bonus: 2
    },
    {
        name: 'Vedan',
        territories: [13, 14, 15, 16, 17, 18],
        bonus: 5
    },
    {
        name: 'Reshi',
        territories: [19, 20, 21, 22, 23, 24, 25, 26, 27],
        bonus: 6
    },
    {
        name: 'Thaylen',
        territories: [47, 48, 49, 50, 51],
        bonus: 3
    },
    {
        name: 'Alethi',
        territories: [41, 42, 43, 44, 45, 46],
        bonus: 5
    },
];

export const roshar = {
    territories,
    territoryPolygons,
    continents,
    mapDecoration
};