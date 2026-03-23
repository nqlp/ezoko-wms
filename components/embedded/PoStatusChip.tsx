import { PO_STATUS_TONE_MAP, STATUS_LABELS, type PoHeaderStatus } from "@/lib/constants";

interface PoStatusChipProps {
  status: string;
}

export function PoStatusChip({ status }: PoStatusChipProps) {
  const tone = PO_STATUS_TONE_MAP[status as PoHeaderStatus] ?? "critical";
  
  const label = STATUS_LABELS[status as PoHeaderStatus] ?? status;

  return (
    <span className={`status-pill status-${tone}`}>
      {label}
    </span>
  );
}