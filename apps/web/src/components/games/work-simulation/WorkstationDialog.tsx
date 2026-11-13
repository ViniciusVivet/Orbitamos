"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { ArrowRight, X, type LucideIcon } from "lucide-react";
import s from "../WorkSimulation.module.css";
import styles from "./WorkstationDialog.module.css";

export type WorkstationPanel = { id: string; label: string; icon: LucideIcon };

export interface WorkstationDialogProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  ticket: string;
  panel: string;
  panels: readonly WorkstationPanel[];
  onPanelChange: (id: string) => void;
  pathLabel: string;
  testIdPrefix: "delivery" | "incident";
  chromeLabel?: string;
}

/** Shared workstation shell; episode state, timers and content stay in its caller. */
export default function WorkstationDialog({
  children, open, onClose, title, ticket, panel, panels, onPanelChange, pathLabel,
  testIdPrefix, chromeLabel = "LOJA DO BAIRRO / ESTAÇÃO DE TRABALHO",
}: WorkstationDialogProps) {
  const terminal = useRef<HTMLDialogElement>(null);
  const titleId = `${testIdPrefix}-computer-title`;
  const testAttributes = testIdPrefix === "delivery" ? { "data-delivery-computer": "" } : { "data-incident-computer": "" };

  useLayoutEffect(() => {
    const node = terminal.current;
    // Close before a caller's layout effect opens its conversation dialog.
    if (!open && node?.open) node.close();
    return () => { if (node?.open) node.close(); };
  }, [open]);

  useEffect(() => {
    const node = terminal.current;
    if (!open || !node) return;
    // The caller closes a previous conversation in its layout effect first.
    if (!node.open) node.showModal();
    node.scrollTop = 0;
    const heading = node.querySelector<HTMLElement>(`[data-${testIdPrefix}-panel="${panel}"] h3`);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [open, panel, testIdPrefix]);

  return <dialog
    ref={terminal}
    className={`${s.computer} ${styles.dialog}`}
    onCancel={event => { event.preventDefault(); onClose(); }}
    aria-labelledby={titleId}
    data-workstation={testIdPrefix}
    {...testAttributes}
  >
    <div className={`${s.computerChrome} ${styles.chrome}`} data-workstation-chrome>
      <div className={s.windowDots} aria-hidden="true"><i/><i/><i/></div>
      <span>{chromeLabel}</span>
      <button type="button" aria-label="Voltar ao escritório" onClick={onClose}><X size={20}/></button>
    </div>
    <div className={s.computerHeading}>
      <div><p>{ticket}</p><h2 id={titleId}>{title}</h2></div>
      <span className={s.environment}><i/> Homologação</span>
    </div>
    <div className={s.computerBody}>
      <nav className={s.panelNav} aria-label="Áreas do computador" data-workstation-nav>
        {panels.map(item => <button key={item.id} type="button" aria-pressed={panel === item.id} onClick={() => onPanelChange(item.id)}><item.icon size={18}/><span>{item.label}</span></button>)}
      </nav>
      <div className={s.workspace}>
        <div className={s.workspacePath}><span>{panels.find(item => item.id === panel)?.label}</span><span>{pathLabel}</span></div>
        {children}
      </div>
    </div>
    <footer className={s.computerFooter}>
      <span><i/> Simulação local · produção sem mudanças</span>
      <button type="button" onClick={onClose}>Voltar ao escritório <ArrowRight size={14}/></button>
    </footer>
  </dialog>;
}
