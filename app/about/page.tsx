import Link from "next/link";
import Shot from "@/components/Shot";
import { ImageReveal, Lines, Reveal } from "@/components/Reveal";

export const metadata = { title: "About" };

const pillars = [
  ["Why we exist", "Because the best clothes disappear into the person wearing them. We started K&F to make pieces with enough presence to hold a room, and enough restraint to never shout."],
  ["Philosophy", "Form is the silhouette. Function is how it lives with you. Identity is what remains after trends leave. We design in that order, and refuse to skip a step."],
  ["Quality", "480gsm fleece. Selvedge denim. Taped seams. Every fabric is tested for a hundred washes before it earns a place in the collection."],
  ["Craft", "Small runs, long relationships. Our partner ateliers cut, sew and finish by hand, and sign every pattern they touch."],
];

export default function About() {
  return (
    <div className="pt-36">
      <section className="wrap">
        <p className="eyebrow">About K&amp;F</p>
        <h1 className="display mt-6 text-[12vw] md:text-[8.5vw]"><Lines lines={["K&F is not about", "following the moment.", "It is about creating", "your own."]} /></h1>
      </section>
      <section className="wrap grid gap-6 py-28 md:grid-cols-12 md:py-40">
        <ImageReveal className="aspect-[3/4] md:col-span-5"><Shot garment="jacket" color="#1c1d21" view="model" tone="#202024" /></ImageReveal>
        <div className="flex flex-col justify-end md:col-span-5 md:col-start-8"><Reveal><p className="display text-3xl md:text-5xl">We make clothes for people who already know who they are.</p><p className="mt-8 text-sm leading-relaxed text-fog">K&amp;F began in 2024 as two friends and one pattern table. The question was simple: what would a wardrobe look like if every piece had to earn its place? The answer is a tight, deliberate collection built around proportion, weight and finish.</p></Reveal></div>
      </section>
      <section className="border-y border-white/10 bg-char"><div className="wrap grid divide-white/10 md:grid-cols-2 md:divide-x">{pillars.map(([t, b], i) => (
        <Reveal key={t} delay={i * 0.06} className="border-b border-white/10 py-14 md:px-10 md:[&:nth-child(n+3)]:border-b-0"><p className="eyebrow">0{i + 1}</p><h2 className="display mt-4 text-4xl md:text-5xl">{t}</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-fog">{b}</p></Reveal>))}</div></section>
      <section className="wrap py-32 text-center"><Reveal><p className="display text-5xl md:text-8xl">Form. Function. Identity.</p><Link href="/shop" className="btn btn-solid mt-12">Shop the collection</Link></Reveal></section>
    </div>
  );
}
