import { SteelProfile } from "./types";

export const PROFILES_AISC: SteelProfile[] = [
    { name: "W14x90", standard: "AISC", h: 356, b: 369, tf: 18, tw: 11.2, area: 17100 },
    { name: "W14x132", standard: "AISC", h: 372, b: 374, tf: 26.2, tw: 16.3, area: 25100 },
    { name: "W12x65", standard: "AISC", h: 307, b: 305, tf: 15.4, tw: 9.9, area: 12300 },
    { name: "W12x120", standard: "AISC", h: 333, b: 312, tf: 28.1, tw: 18.0, area: 22800 },
    { name: "W10x49", standard: "AISC", h: 253, b: 254, tf: 14.2, tw: 8.6, area: 9290 },
    { name: "W8x31", standard: "AISC", h: 203, b: 203, tf: 11, tw: 7.2, area: 5890 },
];

export const PROFILES_EURO: SteelProfile[] = [
    { name: "HEB 240", standard: "EURO", h: 240, b: 240, tf: 17, tw: 10, area: 10600 },
    { name: "HEB 300", standard: "EURO", h: 300, b: 300, tf: 19, tw: 11, area: 14900 },
    { name: "HEB 500", standard: "EURO", h: 500, b: 300, tf: 28, tw: 14.5, area: 23900 },
    { name: "IPE 300", standard: "EURO", h: 300, b: 150, tf: 10.7, tw: 7.1, area: 5380 },
    { name: "IPE 450", standard: "EURO", h: 450, b: 190, tf: 14.6, tw: 9.4, area: 9880 },
    { name: "IPE 600", standard: "EURO", h: 600, b: 220, tf: 19, tw: 12, area: 15600 },
];

export const PROFILES_CHILE: SteelProfile[] = [
    // ICHA 2008 - HN Names
    { name: "HN 20x24.1", standard: "CHILE", h: 200, b: 150, tf: 9, tw: 6, area: 3080 },
    { name: "HN 30x40.5", standard: "CHILE", h: 300, b: 200, tf: 10, tw: 6, area: 5160 },
    { name: "HN 40x60.1", standard: "CHILE", h: 400, b: 250, tf: 12, tw: 8, area: 7650 },
    { name: "HN 50x85.3", standard: "CHILE", h: 500, b: 300, tf: 14, tw: 10, area: 10900 },
    { name: "HN 60x114.7", standard: "CHILE", h: 600, b: 300, tf: 18, tw: 12, area: 14600 },
    // ICHA 2008 - IN Names
    { name: "IN 20x16.1", standard: "CHILE", h: 200, b: 100, tf: 8, tw: 5, area: 2050 },
    { name: "IN 30x34.1", standard: "CHILE", h: 300, b: 150, tf: 10, tw: 6, area: 4350 },
    { name: "IN 40x55.4", standard: "CHILE", h: 400, b: 200, tf: 12, tw: 8, area: 7050 },
    { name: "IN 50x75.6", standard: "CHILE", h: 500, b: 250, tf: 14, tw: 10, area: 9600 },
];

export const ALL_PROFILES = [...PROFILES_AISC, ...PROFILES_EURO, ...PROFILES_CHILE];
