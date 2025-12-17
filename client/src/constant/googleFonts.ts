export const ADMINS_GOOGLE_FONTS: string[] = [
  // Classic scripts (your list)… trimmed duplicates
  "Tangerine",
  "Great Vibes",
  "Alex Brush",
  "Parisienne",
  "Carattere",
  "Courgette",
  "Satisfy",
  "Cookie",
  "Dancing Script",
  "Lobster",
  "Pacifico",
  "Handlee",
  "Kaushan Script",
  "Allura",
  "Windsong",
  "Yellowtail",
  "Homemade Apple",
  "Rouge Script",
  "Delius Swash Caps",
  "Marck Script",
  "Grand Hotel",
  "Monsieur La Doulaise",
  "Bilbo",
  "Bilbo Swash Caps",
  "Bonbon",
  "Charm",
  "Crafty Girls",
  "Damion",
  "Dawning of a New Day",
  "Griffy",
  "La Belle Aurore",
  "Leckerli One",
  "Lovers Quarrel",
  "Meow Script",
  "Mrs Saint Delafield",
  "Mrs Sheppards",
  "Mystery Quest",
  "Playball",
  "Princess Sofia",
  // Additions
  "Pinyon Script",
  "Sacramento",
  "Norican",
  "Mr Dafoe",
  "Arizonia",
  "Yesteryear",
  "Italianno",
  "Meddon",
  "Qwigley",
  "Vibur",
  "Bad Script",
  "Gloria Hallelujah",
  "Indie Flower",
  "Nothing You Could Do",
  "Caveat",
  "Caveat Brush",
  "Amatic SC",
  "Gochi Hand",
  "Kalam",
  "Permanent Marker",
  "Rock Salt",
  "Sedgwick Ave",
  "Sedgwick Ave Display",
  "Patrick Hand",
  "Patrick Hand SC",
  "Sriracha",
  "Beth Ellen",
  "Shadows Into Light",
  "Shadows Into Light Two",
  "Reenie Beanie",
  "Nanum Pen Script",
  "Covered By Your Grace",
  "Just Another Hand",
  "Allison",
  "Clicker Script",
  "MonteCarlo",
  "The Nautigal",
  "Waterfall",
  "Libre Baskerville",
  "Playfair Display",
];

// Optional weight hints for a FEW families only (keeps CSS small).
const WEIGHT_HINTS: Record<string, number[]> = {
  "Playfair Display": [400, 700],
  "Libre Baskerville": [400, 700],
  "Dancing Script": [400, 600, 700],
  Caveat: [400, 600, 700],
  "Amatic SC": [400, 700],
  Kalam: [300, 400, 700],
};

/** Build a CSS URL from families with optional weights. */
function buildUrl(families: string[]): string {
  const q = families
    .map((name) => {
      const fam = name.trim().replace(/\s+/g, "+");
      const weights = WEIGHT_HINTS[name];
      return weights?.length
        ? `family=${fam}:wght@${Array.from(new Set(weights)).sort().join(";")}`
        : `family=${fam}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/** Split families into multiple URLs, each under a safe max length. */
export function buildGoogleFontsUrls(
  families: string[],
  maxUrlLen = 1800 // keep below typical limits
): string[] {
  const uniq = Array.from(new Set(families)); // dedupe
  const urls: string[] = [];
  let buf: string[] = [];

  for (const f of uniq) {
    const test = buildUrl([...buf, f]);
    if (test.length > maxUrlLen) {
      if (buf.length === 0) {
        // Single family already exceeds: still push to avoid infinite loop.
        urls.push(test);
        buf = [];
      } else {
        urls.push(buildUrl(buf));
        buf = [f];
      }
    } else {
      buf.push(f);
    }
  }
  if (buf.length) urls.push(buildUrl(buf));
  return urls;
}

/** Idempotently inject link tags. */
export function loadGoogleFontsOnce(urls: string[]): void {
  if (typeof document === "undefined") return;

  // Preconnect once
  if (!document.getElementById("gf-preconnect-apis")) {
    const a = document.createElement("link");
    a.id = "gf-preconnect-apis";
    a.rel = "preconnect";
    a.href = "https://fonts.googleapis.com";
    a.crossOrigin = "anonymous";
    document.head.appendChild(a);
  }
  if (!document.getElementById("gf-preconnect-static")) {
    const a = document.createElement("link");
    a.id = "gf-preconnect-static";
    a.rel = "preconnect";
    a.href = "https://fonts.gstatic.com";
    a.crossOrigin = "anonymous";
    document.head.appendChild(a);
  }

  // Stylesheets
  for (const url of urls) {
    const id = "gf-css-" + btoa(url).slice(0, 12);
    if (document.getElementById(id)) continue;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
}

/** Convenience: load a large list safely. */
export function loadAdminFonts(): void {
  const urls = buildGoogleFontsUrls(ADMINS_GOOGLE_FONTS);
  loadGoogleFontsOnce(urls);
}

// ======================= Example usage =======================
// 1) Load globally in your app entry (_app.tsx, main.tsx, or Layout)
/// import { useEffect } from "react";
/// import { loadAdminFonts } from "./fonts/googleFonts";
/// useEffect(() => { loadAdminFonts(); }, []);
//
// 2) Or load per-screen:
//   loadGoogleFontsOnce(buildGoogleFontsUrls(["Great Vibes","Playfair Display"]));
//
// 3) Use in styles:
//   <div style={{ fontFamily: "'Great Vibes', cursive" }}>Hello</div>
