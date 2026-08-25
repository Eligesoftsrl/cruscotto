interface PageHeaderProps {
  title: string;
  subtitle: string;
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const PageHeader = ({ title, subtitle, tabs, activeTab, onTabChange }: PageHeaderProps) => {
  return (
    <div className="bg-card border-b px-5 pt-4 pb-3 flex items-end justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex gap-0.5 bg-secondary p-[3px] rounded-lg border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-[5px] text-[11.5px] rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
