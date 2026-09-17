"use client";
import { useEffect } from "react";

/** Local integration hook only: no cookies, storage, personal data or network requests. */
export default function ServiceSignals({ slug }: { slug: string }) {
  useEffect(()=>{
    const page=document.querySelector<HTMLElement>("[data-sales-page]");
    if(!page)return;
    const emit=(action:string,detail?:string)=>window.dispatchEvent(new CustomEvent("orbitamos:service",{detail:{slug,action,detail}}));
    const click=(event:MouseEvent)=>{
      const target=event.target instanceof Element ? event.target.closest<HTMLElement>("[data-service-event]") : null;
      if(target&&page.contains(target))emit(target.dataset.serviceEvent!,target.dataset.serviceDetail);
    };
    emit("view");page.addEventListener("click",click);
    return ()=>page.removeEventListener("click",click);
  },[slug]);
  return null;
}
