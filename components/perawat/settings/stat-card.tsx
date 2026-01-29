import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  className 
}: StatCardProps) {
  
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };

  const iconColorMap = {
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
    gray: "text-gray-500",
  };

  return (
    <div className={cn(
      "rounded-xl border p-4 flex flex-col justify-between h-full transition-all hover:shadow-md",
      colorMap[color],
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
          {title}
        </span>
        {Icon && <Icon className={cn("w-4 h-4", iconColorMap[color])} />}
      </div>
      <div className="text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}
