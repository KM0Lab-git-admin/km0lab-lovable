import { cn } from "@/lib/utils";

interface PointsCoinProps {
  points: number;
  earned?: boolean;
  className?: string;
}

const PointsCoin = ({ points, earned = false, className }: PointsCoinProps) => (
  <span className={cn("inline-flex min-h-[30px] shrink-0 items-center gap-1 rounded-full bg-km0-yellow-500 py-1 pl-1 pr-2.5 font-ui text-[13px] font-extrabold tabular-nums text-km0-blue-900", className)}>
    <span aria-hidden className="h-5 w-5 rounded-full border-2 border-km0-yellow-700 bg-km0-yellow-300" />
    {earned ? "+" : ""}{points.toLocaleString("es-ES")}
  </span>
);

export default PointsCoin;