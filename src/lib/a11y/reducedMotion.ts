/**
 * Accessibilità · «riduci movimento».
 * Se l'utente ha chiesto al sistema operativo di ridurre le animazioni, si disattivano
 * anche le animazioni dei grafici (gestite via JavaScript, non coperte dal CSS globale).
 */
import { Area, Bar, Line, Pie, Radar, RadialBar, Scatter } from "recharts";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export function applyReducedMotionToCharts() {
  if (!prefersReducedMotion()) return;
  for (const C of [Area, Bar, Line, Pie, Radar, RadialBar, Scatter] as unknown as {
    defaultProps?: Record<string, unknown>;
  }[]) {
    if (C.defaultProps) C.defaultProps = { ...C.defaultProps, isAnimationActive: false };
  }
}
