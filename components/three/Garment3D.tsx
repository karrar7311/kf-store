"use client";
import Apparel from "./Apparel";
import Accessory from "./Accessories";
import type { Garment, Material } from "@/lib/products";

export const ACCESSORIES: Garment[] = ["beanie", "tote", "sunglasses", "belt", "scarf"];

export default function Garment3D(props: { garment: Garment; color: string; material: Material; stitching?: boolean }) {
  return ACCESSORIES.includes(props.garment) ? <Accessory {...props} /> : <Apparel {...props} />;
}
