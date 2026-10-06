export type Garment = "tee" | "hoodie" | "jacket" | "pants" | "cap" | "bomber";
export type Material = "cotton" | "denim" | "leather" | "nylon" | "fleece" | "wool";
export type Category = "outerwear" | "tops" | "bottoms" | "essentials" | "accessories";

export interface ColorWay { name: string; hex: string }
export interface Product {
  slug: string;
  name: string;
  price: number;
  gender: "men" | "women" | "unisex";
  category: Category;
  garment: Garment;
  material: Material;
  badge?: "NEW" | "LIMITED" | "BESTSELLER";
  collection: string;
  colors: ColorWay[];
  sizes: string[];
  stock: Record<string, number>;
  description: string;
  details: { material: string; fit: string; care: string };
  rating: number;
  reviews: number;
  createdAt: string;
}

const S = ["XS", "S", "M", "L", "XL"];
const stock = (n: number) => Object.fromEntries(S.map((s, i) => [s, Math.max(0, n - i * 3)]));

export const products: Product[] = [
  {
    slug: "essential-heavyweight-hoodie", name: "K&F Essential Heavyweight Hoodie", price: 120, gender: "unisex",
    category: "tops", garment: "hoodie", material: "fleece", badge: "BESTSELLER", collection: "Essentials",
    colors: [{ name: "Onyx", hex: "#16161a" }, { name: "Bone", hex: "#e4dfd5" }, { name: "Ash", hex: "#6f7076" }, { name: "Oxblood", hex: "#4b1620" }],
    sizes: S, stock: stock(24),
    description: "A 480gsm loopback fleece hoodie cut boxy through the shoulder with a double-lined hood that holds its shape. Garment-washed for a lived-in hand from day one, finished with tonal K&F embroidery.",
    details: { material: "100% organic brushed-back cotton, 480gsm. Ribbed cuffs and hem with 2% elastane.", fit: "Relaxed, boxy. Model is 185cm and wears size M. Size down for a closer fit.", care: "Machine wash cold inside out. Hang dry. Do not bleach." },
    rating: 4.9, reviews: 312, createdAt: "2027-01-12",
  },
  {
    slug: "signature-oversized-tee", name: "K&F Signature Oversized Tee", price: 65, gender: "unisex",
    category: "tops", garment: "tee", material: "cotton", badge: "NEW", collection: "Signature",
    colors: [{ name: "Washed Black", hex: "#1b1b1e" }, { name: "Off-White", hex: "#ece8df" }, { name: "Stone", hex: "#a8a59d" }],
    sizes: S, stock: stock(40),
    description: "Our signature tee in a dense 260gsm Supima jersey. Dropped shoulder, extended body, and a collar built to resist stretching. Quiet logo at the nape.",
    details: { material: "100% Supima cotton jersey, 260gsm, enzyme washed.", fit: "Oversized. Model is 183cm and wears size M.", care: "Machine wash cold. Tumble dry low." },
    rating: 4.8, reviews: 198, createdAt: "2027-02-02",
  },
  {
    slug: "technical-jacket", name: "K&F Technical Jacket", price: 190, gender: "unisex",
    category: "outerwear", garment: "jacket", material: "nylon", badge: "NEW", collection: "Form 01",
    colors: [{ name: "Carbon", hex: "#1c1d21" }, { name: "Silver", hex: "#a9adb4" }],
    sizes: S, stock: stock(15),
    description: "A shell jacket in matte ripstop nylon with taped seams, a storm collar and concealed magnetic closures. Engineered to move through weather without looking like it.",
    details: { material: "100% recycled nylon ripstop, DWR finish. Lining: breathable mesh.", fit: "Regular with room for layering. Model wears size M.", care: "Wipe clean or machine wash cold on a delicate cycle. Do not iron." },
    rating: 4.7, reviews: 86, createdAt: "2027-02-18",
  },
  {
    slug: "premium-cargo-pants", name: "K&F Premium Cargo Pants", price: 145, gender: "men",
    category: "bottoms", garment: "pants", material: "cotton", collection: "Form 01",
    colors: [{ name: "Slate", hex: "#3a3c40" }, { name: "Sand", hex: "#b3a791" }, { name: "Black", hex: "#141416" }],
    sizes: ["28", "30", "32", "34", "36"], stock: Object.fromEntries(["28", "30", "32", "34", "36"].map((s, i) => [s, 14 - i * 2])),
    description: "Articulated cargos in a heavy cotton twill with bellows pockets, adjustable ankle drawcords and a clean, tapered leg. Utility, refined.",
    details: { material: "98% cotton twill, 2% elastane, 340gsm.", fit: "Relaxed through the thigh, tapered at the ankle. Model is 186cm wearing 32.", care: "Machine wash cold. Line dry." },
    rating: 4.8, reviews: 143, createdAt: "2027-01-28",
  },
  {
    slug: "essential-sweatpants", name: "K&F Essential Sweatpants", price: 110, gender: "unisex",
    category: "essentials", garment: "pants", material: "fleece", badge: "BESTSELLER", collection: "Essentials",
    colors: [{ name: "Onyx", hex: "#17171a" }, { name: "Heather", hex: "#8b8c91" }, { name: "Bone", hex: "#e1dcd1" }],
    sizes: S, stock: stock(30),
    description: "The matching bottom to our heavyweight hoodie. Straight leg, flat drawcord and a clean hem with a subtle embroidered K&F at the hip.",
    details: { material: "100% organic cotton loopback fleece, 450gsm.", fit: "Straight, relaxed. Model wears size M.", care: "Machine wash cold. Hang dry." },
    rating: 4.9, reviews: 254, createdAt: "2027-01-12",
  },
  {
    slug: "studio-bomber", name: "K&F Studio Bomber", price: 210, gender: "unisex",
    category: "outerwear", garment: "bomber", material: "leather", badge: "LIMITED", collection: "Campaign 2027",
    colors: [{ name: "Black", hex: "#0e0e10" }, { name: "Burgundy", hex: "#4a1822" }],
    sizes: S, stock: stock(9),
    description: "A cropped bomber in supple lambskin-feel leather with a satin-lined interior, ribbed collar and a polished silver zip. The centerpiece of Campaign 2027.",
    details: { material: "Leather shell, viscose satin lining, wool-blend rib.", fit: "Cropped, structured shoulder. Model wears size M.", care: "Professional leather clean only." },
    rating: 5.0, reviews: 41, createdAt: "2027-03-01",
  },
  {
    slug: "signature-cap", name: "K&F Signature Cap", price: 45, gender: "unisex",
    category: "accessories", garment: "cap", material: "wool", collection: "Signature",
    colors: [{ name: "Black", hex: "#131315" }, { name: "Charcoal", hex: "#3b3c40" }, { name: "Bone", hex: "#e2ddd2" }],
    sizes: ["ONE SIZE"], stock: { "ONE SIZE": 60 },
    description: "A six-panel cap in brushed wool twill with a pre-curved brim and a metal-tipped adjustable strap. Embroidered K&F in tonal thread.",
    details: { material: "Wool-blend twill, cotton sweatband.", fit: "One size, adjustable.", care: "Spot clean only." },
    rating: 4.7, reviews: 77, createdAt: "2027-02-10",
  },
  {
    slug: "denim-trucker", name: "K&F Raw Denim Trucker", price: 175, gender: "women",
    category: "outerwear", garment: "jacket", material: "denim", badge: "NEW", collection: "Form 01",
    colors: [{ name: "Indigo", hex: "#1f2a44" }, { name: "Washed Black", hex: "#25262b" }],
    sizes: S, stock: stock(12),
    description: "A cropped trucker in 13oz selvedge denim, rigid and ready to age. Copper hardware, double-needle stitching and a tailored back seam.",
    details: { material: "100% cotton selvedge denim, 13oz.", fit: "Cropped, slightly boxy. Model wears size S.", care: "Wash rarely. Cold, inside out." },
    rating: 4.8, reviews: 59, createdAt: "2027-03-05",
  },
  {
    slug: "wool-overshirt", name: "K&F Wool Overshirt", price: 160, gender: "women",
    category: "tops", garment: "jacket", material: "wool", collection: "Signature",
    colors: [{ name: "Charcoal", hex: "#2c2d31" }, { name: "Camel", hex: "#a38d6d" }],
    sizes: S, stock: stock(14),
    description: "A felted wool overshirt that sits between layers. Clean placket, hidden snaps and a soft structured collar.",
    details: { material: "80% wool, 20% nylon.", fit: "Relaxed, hip length. Model wears size S.", care: "Dry clean recommended." },
    rating: 4.6, reviews: 33, createdAt: "2027-03-10",
  },
];

export const collections = [
  { key: "new", label: "New Arrivals", href: "/shop?filter=new", tone: "#2b2b30", garment: "jacket" as Garment },
  { key: "men", label: "Men", href: "/shop?gender=men", tone: "#1d1d21", garment: "pants" as Garment },
  { key: "women", label: "Women", href: "/shop?gender=women", tone: "#33262a", garment: "jacket" as Garment },
  { key: "outerwear", label: "Outerwear", href: "/shop?category=outerwear", tone: "#202226", garment: "bomber" as Garment },
  { key: "tops", label: "Tops", href: "/shop?category=tops", tone: "#2a2a2a", garment: "hoodie" as Garment },
  { key: "bottoms", label: "Bottoms", href: "/shop?category=bottoms", tone: "#18191c", garment: "pants" as Garment },
  { key: "essentials", label: "Essentials", href: "/shop?category=essentials", tone: "#2f2d2a", garment: "tee" as Garment },
  { key: "accessories", label: "Accessories", href: "/shop?category=accessories", tone: "#222126", garment: "cap" as Garment },
];

export const lookbook = [
  { id: 1, title: "Look 01 / Night Shell", tone: "#17181b", items: [
    { slug: "technical-jacket", x: 50, y: 34 }, { slug: "premium-cargo-pants", x: 50, y: 70 }, { slug: "signature-cap", x: 50, y: 10 } ] },
  { id: 2, title: "Look 02 / Heavyweight", tone: "#1e1b1a", items: [
    { slug: "essential-heavyweight-hoodie", x: 50, y: 32 }, { slug: "essential-sweatpants", x: 50, y: 72 }, { slug: "signature-cap", x: 50, y: 9 } ] },
  { id: 3, title: "Look 03 / Oxblood", tone: "#241518", items: [
    { slug: "studio-bomber", x: 50, y: 33 }, { slug: "signature-oversized-tee", x: 50, y: 46 }, { slug: "premium-cargo-pants", x: 50, y: 74 } ] },
];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
export const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
