import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface NotificationBellProps { hasAlerts?: boolean; onClick?: () => void; className?: string; ariaLabel?: string; }
const NotificationBell = ({ hasAlerts = false, onClick, className, ariaLabel }: NotificationBellProps) => (
  <Button variant="ghost" size="icon" onClick={onClick} aria-label={ariaLabel} className={cn("relative h-11 w-11 shrink-0 rounded-full bg-card text-km0-blue-800 shadow-[var(--shadow-bubble)] hover:bg-card active:scale-[0.96]", className)}>
    <Bell aria-hidden className="!h-6 !w-6" />
    {hasAlerts && <span aria-hidden className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-card bg-km0-coral-400" />}
  </Button>
);
export default NotificationBell;
