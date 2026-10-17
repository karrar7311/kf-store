/** The six looks in the K&F digital runway show (pure data, shared by the page and the 3D scene). */
export interface Look {
  title: string;
  note: string;
  top: { slug: string; ci?: number };
  bottom: { slug: string; ci?: number };
  acc: { slug: string; ci?: number }[];
  skin: string;
}

export const LOOKS: Look[] = [
  { title: "Night Shell", note: "Matte ripstop, cut long in the arm. Made for weather you plan around.", top: { slug: "technical-jacket" }, bottom: { slug: "premium-cargo-pants" }, acc: [{ slug: "signature-cap" }, { slug: "studio-sunglasses" }], skin: "#c99a7a" },
  { title: "Heavyweight", note: "480gsm fleece, worn head to toe in one tone.", top: { slug: "essential-heavyweight-hoodie" }, bottom: { slug: "essential-sweatpants" }, acc: [{ slug: "essential-beanie" }], skin: "#7b4e33" },
  { title: "Oxblood", note: "Lambskin-feel leather over a heavyweight base, finished in silver.", top: { slug: "studio-bomber", ci: 1 }, bottom: { slug: "premium-cargo-pants", ci: 2 }, acc: [{ slug: "studio-sunglasses" }, { slug: "leather-belt", ci: 1 }], skin: "#e0b08c" },
  { title: "The Overcoat", note: "Felted wool to the knee, a scarf thrown over, nothing else needed.", top: { slug: "wool-overcoat" }, bottom: { slug: "essential-sweatpants" }, acc: [{ slug: "wool-scarf", ci: 2 }], skin: "#a9744f" },
  { title: "Padded", note: "Quilted warmth without the bulk, with shorts for contrast.", top: { slug: "padded-vest", ci: 1 }, bottom: { slug: "studio-shorts" }, acc: [{ slug: "essential-beanie", ci: 1 }], skin: "#f0cdb2" },
  { title: "Merino", note: "A fine-gauge crewneck and a tote. Quiet, exact.", top: { slug: "merino-crewneck", ci: 1 }, bottom: { slug: "premium-cargo-pants" }, acc: [{ slug: "signature-tote" }], skin: "#c99a7a" },
];
