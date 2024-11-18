import { earth } from "@/maps/earth_territories.js";
import { roshar } from "@/maps/roshar_territories.js";

export const maps = {
    "earth": {
        name: "Earth",
        territories: earth.territories,
        territoryPolygons: earth.territoryPolygons,
        continents: earth.continents,
        mapDecoration: earth.mapDecoration
    },
    "roshar": {
        name: "Roshar",
        territories: roshar.territories,
        territoryPolygons: roshar.territoryPolygons,
        continents: roshar.continents,
        mapDecoration: roshar.mapDecoration
    },
};