import type { ReactNode } from "react";

/** Contenitore standard per un grafico: bordo + titolo + contenuto. */
export const ChartCard = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`bg-card border rounded-lg p-4 ${className ?? ""}`}>
    <h3 className="text-xs font-semibold text-foreground mb-3">{title}</h3>
    {children}
  </div>
);
