export function scoreColor(score: string | number): string {
  const v = Math.max(0, Math.min(10, parseFloat(String(score))));
  return `hsl(${(v * 12.5).toFixed(0)} 62% 42%)`;
}

export interface Post {
  name: string;
  place: string;
  context: string;
  score: string;
  take: string;
  liked: 0 | 1;
  food: string;
  person: string;
  reactions: [string, number][];
}

export const posts: Post[] = [
  {
    name: "Adam",
    place: "Blacklock",
    context: "Soho, Steak",
    score: "9.2",
    take: "the bavette and chips, every time",
    liked: 1,
    food: "steak.jpg",
    person: "canal.jpg",
    reactions: [
      ["🤤", 42],
      ["🔥", 18],
      ["🫡", 7],
    ],
  },
  {
    name: "Zayn",
    place: "Maki & Ramen",
    context: "Soho, Japanese",
    score: "9.1",
    take: "the spicy katsu broth, unreal",
    liked: 1,
    food: "ramen.jpg",
    person: "arena.jpg",
    reactions: [
      ["🔥", 64],
      ["🤤", 23],
    ],
  },
  {
    name: "Josh",
    place: "Bancone",
    context: "Covent Garden, Italian",
    score: "9.0",
    take: "the carbonara on the terrace, yes",
    liked: 1,
    food: "carbonara.jpg",
    person: "concert.jpg",
    reactions: [
      ["🤤", 31],
      ["🫡", 12],
    ],
  },
  {
    name: "Tomi",
    place: "Master Wei",
    context: "Bloomsbury, Chinese",
    score: "8.9",
    take: "hand-pulled noodles, bring a friend",
    liked: 0,
    food: "noodles.jpg",
    person: "mirror.jpg",
    reactions: [
      ["🔥", 50],
      ["🤤", 14],
    ],
  },
  {
    name: "Leo",
    place: "Pizza Union",
    context: "Kings Cross, Pizza",
    score: "8.7",
    take: "proper thin base, still think about it",
    liked: 0,
    food: "pizza.jpg",
    person: "canal.jpg",
    reactions: [
      ["🫡", 22],
      ["🔥", 9],
    ],
  },
  {
    name: "Sam",
    place: "Norma",
    context: "Fitzrovia, Italian",
    score: "8.6",
    take: "burrata and a spritz in the sun",
    liked: 0,
    food: "burrata.jpg",
    person: "arena.jpg",
    reactions: [
      ["🤤", 38],
      ["🔥", 16],
    ],
  },
  {
    name: "Zayn",
    place: "Kuro",
    context: "Soho, Sandwiches",
    score: "8.4",
    take: "the bacon bagel walking through town",
    liked: 0,
    food: "bagel.jpg",
    person: "concert.jpg",
    reactions: [["🤤", 27]],
  },
  {
    name: "Adam",
    place: "Bar Douro",
    context: "Borough, Dessert",
    score: "8.8",
    take: "the burnt cheesecake, order two",
    liked: 1,
    food: "cheesecake.jpg",
    person: "mirror.jpg",
    reactions: [
      ["🔥", 19],
      ["🫡", 8],
    ],
  },
];

export interface Spot {
  lat: number;
  lng: number;
  name: string;
  context: string;
  score: string;
  primary: boolean;
}

export const spots: Spot[] = [
  { lat: 51.5175, lng: -0.078, name: "Blacklock", context: "Adam went", score: "9.2", primary: true },
  { lat: 51.5165, lng: -0.065, name: "Maki & Ramen", context: "Zayn went", score: "9.1", primary: false },
  { lat: 51.517, lng: -0.113, name: "Master Wei", context: "Tomi went", score: "8.9", primary: false },
  { lat: 51.515, lng: -0.0955, name: "Bancone", context: "Josh went", score: "9.0", primary: true },
  { lat: 51.514, lng: -0.1235, name: "Norma", context: "Sam went", score: "8.6", primary: false },
];

export const HERE_POSITION: [number, number] = [51.5145, -0.101];
export const MAP_CENTER: [number, number] = [51.51, -0.094];
export const MAP_ZOOM = 14;

export const appleSvg =
  '<svg viewBox="0 0 24 24" fill="#fff"><path d="M16.36 12.9c.02 2.32 2.03 3.09 2.05 3.1-.02.05-.32 1.11-1.06 2.2-.64.95-1.3 1.9-2.35 1.92-1.02.02-1.36-.6-2.53-.6-1.18 0-1.55.58-2.52.62-1.01.04-1.78-1.02-2.43-1.96-1.32-1.92-2.33-5.42-.97-7.79.67-1.17 1.88-1.92 3.19-1.94.99-.02 1.93.67 2.53.67.61 0 1.75-.83 2.94-.71.5.02 1.9.2 2.8 1.52-.07.05-1.67.98-1.65 2.94M14.45 5.9c.54-.65.9-1.56.8-2.46-.78.03-1.71.52-2.26 1.17-.5.57-.93 1.49-.81 2.37.86.07 1.74-.44 2.27-1.08"/></svg>';

export const gplaySvg =
  '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gplay-blue" x1="32" y1="16" x2="280" y2="256" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00C3FF"/><stop offset="100%" stop-color="#0090E0"/></linearGradient><linearGradient id="gplay-green" x1="32" y1="16" x2="497" y2="256" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00E26B"/><stop offset="100%" stop-color="#00C94E"/></linearGradient><linearGradient id="gplay-yellow" x1="32" y1="496" x2="497" y2="256" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFD500"/><stop offset="100%" stop-color="#FFBC00"/></linearGradient><linearGradient id="gplay-red" x1="32" y1="496" x2="280" y2="256" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF4B4B"/><stop offset="100%" stop-color="#D6002F"/></linearGradient></defs><path fill="url(#gplay-blue)" d="M32 16 L32 256 L280 256 Z"/><path fill="url(#gplay-green)" d="M32 16 L280 256 L497 256 Z"/><path fill="url(#gplay-red)" d="M32 496 L32 256 L280 256 Z"/><path fill="url(#gplay-yellow)" d="M32 496 L280 256 L497 256 Z"/></svg>';
