import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { fontiDati } from "@/data/mockData";

interface DataSourceNavProps {
  activeSource: string;
  activeSubItem: string;
  onSourceChange: (sourceId: string, subItemId?: string) => void;
}

export const DataSourceNav = ({ activeSource, activeSubItem, onSourceChange }: DataSourceNavProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-wrap items-stretch gap-0 border-b bg-card px-4" ref={dropdownRef}>
      {fontiDati.map((fonte) => {
        const hasDropdown = fonte.subItems && fonte.subItems.length > 0;
        const isActive = activeSource === fonte.id;
        const isDropdownOpen = openDropdown === fonte.id;

        return (
          <div key={fonte.id} className="relative">
            <button
              onClick={() => {
                if (hasDropdown) {
                  setOpenDropdown(isDropdownOpen ? null : fonte.id);
                } else {
                  onSourceChange(fonte.id);
                  setOpenDropdown(null);
                }
              }}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <span className="whitespace-nowrap">
                {fonte.label}
                {hasDropdown && isActive && activeSubItem && (
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    ({fonte.subItems!.find(s => s.id === activeSubItem)?.label ?? ""})
                  </span>
                )}
              </span>
              {hasDropdown && <ChevronDown className="h-3 w-3" />}
            </button>

            {hasDropdown && isDropdownOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[260px] rounded-b-md border border-t-0 bg-card shadow-lg">
                {fonte.subItems!.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onSourceChange(fonte.id, sub.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs hover:bg-muted/60 transition-colors ${
                      activeSubItem === sub.id
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-foreground"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
