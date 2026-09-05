import type { NetworkSummary } from "@/lib/api";
import { texts } from "@/texts";

type NetworkOverviewProps = {
  summary: NetworkSummary | undefined;
  suggestionCount: number;
};

export function NetworkOverview({ summary, suggestionCount }: NetworkOverviewProps) {
  const stats = [
    { label: texts.network.stats.connections, value: summary?.connections ?? 0 },
    { label: texts.network.stats.following, value: summary?.followers ?? 0 },
    {
      label: texts.network.stats.requests,
      value: summary?.pendingRequests ?? 0,
      isHighlighted: true,
    },
    { label: texts.network.stats.suggestions, value: suggestionCount },
  ];

  return (
    <div className="surface-card p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{texts.network.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{texts.network.description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <NetworkStat
            key={stat.label}
            label={stat.label}
            value={String(stat.value)}
            isHighlighted={stat.isHighlighted}
          />
        ))}
      </div>
    </div>
  );
}

type NetworkStatProps = {
  label: string;
  value: string;
  isHighlighted?: boolean;
};

function NetworkStat({ label, value, isHighlighted }: NetworkStatProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isHighlighted ? "border-primary/30 bg-primary-soft" : "border-border bg-muted/40"
      }`}
    >
      <p className={`text-2xl font-semibold ${isHighlighted ? "text-primary" : ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
