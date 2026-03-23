import { ACTIVITY_TONE_MAP, type ActivityType } from "@/lib/constants";

interface ActivityChipProps {
  activity: string; 
}

export function ActivityChip({ activity }: ActivityChipProps) {
  const tone = ACTIVITY_TONE_MAP[activity as ActivityType] ?? "auto";
  
  return (
    <span className={`activity-chip activity-${tone}`}>
      {activity}
    </span>
  );
}