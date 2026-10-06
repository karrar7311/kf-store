import { Lookbook } from "@/components/Lookbook";
export const metadata = { title: "Lookbook" };
export default function Page() {
  return (
    <div className="pt-32">
      <div className="wrap mb-12"><p className="eyebrow">K&amp;F Campaign 2027</p><h1 className="display mt-3 text-6xl md:text-9xl">The New Form</h1></div>
      <Lookbook />
    </div>
  );
}
