import Image from "next/image";
import { servicePhotoKind, studioPhotos } from "./studioPhotography";

export default function ServicePhoto({ slug }: { slug: string }) {
  const kind = servicePhotoKind(slug);
  return <figure className="-mx-5 -mt-5 mb-5" data-service-photo={kind}>
    <div className="relative aspect-[2/1] overflow-hidden bg-[#10212a]">
      <Image src={studioPhotos[kind]} alt="" fill placeholder="blur" sizes="(max-width: 1023px) 100vw, 45vw" className="object-cover"/>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03050a]/65 to-transparent"/>
      <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[.14em] text-white">Orbitamos / Da ideia à operação</span>
    </div>
  </figure>;
}
