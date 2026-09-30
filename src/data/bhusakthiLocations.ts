/**
 * BHUSAKTHI AI — AUTHORITATIVE LOCATION DATABASE
 * Single Source of Truth for 3D Digital Twin and Geographic Navigation
 */

export interface BhusakthiLocation {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  cameraHeight: number;
  heading?: number;
  pitch?: number;
}

export const BHUSAKTHI_LOCATIONS: Record<string, BhusakthiLocation> = {
  agartala: {
    id: "agartala",
    name: "Agartala",
    state: "Tripura",
    latitude: 23.83150,
    longitude: 91.28680,
    cameraHeight: 2500
  },

  tawang: {
    id: "tawang",
    name: "Tawang",
    state: "Arunachal Pradesh",
    latitude: 27.58605,
    longitude: 91.85900,
    cameraHeight: 4800
  },

  gangtok: {
    id: "gangtok",
    name: "Gangtok",
    state: "Sikkim",
    latitude: 27.33890,
    longitude: 88.60650,
    cameraHeight: 3600
  },

  majuli: {
    id: "majuli",
    name: "Majuli",
    state: "Assam",
    latitude: 27.00140,
    longitude: 94.22460,
    cameraHeight: 2800
  },

  cherrapunji: {
    id: "cherrapunji",
    name: "Cherrapunji",
    state: "Meghalaya",
    latitude: 25.28400,
    longitude: 91.72100,
    cameraHeight: 3200
  },

  aizawl: {
    id: "aizawl",
    name: "Aizawl",
    state: "Mizoram",
    latitude: 23.72710,
    longitude: 92.71760,
    cameraHeight: 3000
  },

  kohima: {
    id: "kohima",
    name: "Kohima",
    state: "Nagaland",
    latitude: 25.67510,
    longitude: 94.10860,
    cameraHeight: 3200
  },

  chungthang: {
    id: "chungthang",
    name: "Chungthang",
    state: "Sikkim",
    latitude: 27.60390,
    longitude: 88.64640,
    cameraHeight: 3800
  },

  noney: {
    id: "noney",
    name: "Noney Tupul",
    state: "Manipur",
    latitude: 24.71260,
    longitude: 93.63180,
    cameraHeight: 2800
  },

  dima_hasao: {
    id: "dima_hasao",
    name: "Dima Hasao",
    state: "Assam",
    latitude: 25.18430,
    longitude: 93.01630,
    cameraHeight: 2800
  },

  rathong: {
    id: "rathong",
    name: "Rathong Glacier",
    state: "Sikkim",
    latitude: 27.48330,
    longitude: 88.16670,
    cameraHeight: 6500
  },

  khangri_karpo: {
    id: "khangri_karpo",
    name: "Khangri Karpo",
    state: "Arunachal Pradesh",
    latitude: 28.38330,
    longitude: 94.41670,
    cameraHeight: 6500
  },

  bhalukpong: {
    id: "bhalukpong",
    name: "Bhalukpong",
    state: "Arunachal Pradesh",
    latitude: 27.01350,
    longitude: 92.64150,
    cameraHeight: 2800
  },

  wayanad: {
    id: "wayanad",
    name: "Wayanad",
    state: "Kerala",
    latitude: 11.68540,
    longitude: 76.13200,
    cameraHeight: 2800
  },

  chamoli: {
    id: "chamoli",
    name: "Chamoli",
    state: "Uttarakhand",
    latitude: 30.40740,
    longitude: 79.32760,
    cameraHeight: 4500
  },

  umiam: {
    id: "umiam",
    name: "Umiam",
    state: "Meghalaya",
    latitude: 25.65860,
    longitude: 91.90560,
    cameraHeight: 3000
  },

  tura: {
    id: "tura",
    name: "Tura",
    state: "Meghalaya",
    latitude: 25.51410,
    longitude: 90.20320,
    cameraHeight: 2600
  },

  baramura: {
    id: "baramura",
    name: "Baramura",
    state: "Tripura",
    latitude: 23.87420,
    longitude: 91.56420,
    cameraHeight: 2500
  },

  mokokchung: {
    id: "mokokchung",
    name: "Mokokchung",
    state: "Nagaland",
    latitude: 26.32450,
    longitude: 94.51550,
    cameraHeight: 3200
  },

  kurseong: {
    id: "kurseong",
    name: "Kurseong",
    state: "West Bengal",
    latitude: 26.88140,
    longitude: 88.27790,
    cameraHeight: 3400
  }
};

export const BHUSAKTHI_LOCATIONS_LIST: BhusakthiLocation[] = Object.values(BHUSAKTHI_LOCATIONS);

export function getBhusakthiLocation(id: string): BhusakthiLocation {
  return BHUSAKTHI_LOCATIONS[id] || BHUSAKTHI_LOCATIONS['agartala'];
}
