interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PASS: { bg: "bg-emerald-900/50", text: "text-emerald-400", label: "PASS" },
  WARN: { bg: "bg-amber-900/50", text: "text-amber-400", label: "WARN" },
  BLOCK: { bg: "bg-red-900/50", text: "text-red-400", label: "BLOCK" },
  GREEN: { bg: "bg-emerald-900/50", text: "text-emerald-400", label: "GREEN" },
  AMBER: { bg: "bg-amber-900/50", text: "text-amber-400", label: "AMBER" },
  RED: { bg: "bg-red-900/50", text: "text-red-400", label: "RED" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PASS;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
