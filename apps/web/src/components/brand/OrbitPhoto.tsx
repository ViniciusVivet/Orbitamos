import Image from "next/image";
import { orbitamosPhotos, type OrbitPhotoKind } from "./orbitamosPhotography";

type Props = {
  kind: OrbitPhotoKind;
  className?: string;
  sizes?: string;
  fill?: boolean;
};

/** Decorative editorial imagery. Never use as an actual person's avatar or case evidence. */
export default function OrbitPhoto({ kind, className = "", sizes = "(max-width: 767px) 100vw, 50vw", fill = false }: Props) {
  return <div data-orbit-photo={kind} className={`${fill ? "absolute inset-0" : "relative aspect-[3/2]"} overflow-hidden bg-[#101a23] ${className}`}>
    <Image src={orbitamosPhotos[kind]} alt="" fill sizes={sizes} placeholder="blur" className="object-cover" />
  </div>;
}

export function OrbitScene(props: Omit<Props, "fill">) {
  return <figure className="min-w-0">
    <OrbitPhoto {...props} />
  </figure>;
}
