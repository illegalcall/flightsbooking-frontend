import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface BookingSummaryProps {
  title: string;
  value: number;
  description: string;
  icon?: ReactNode;
  variant?: "default" | "outline" | "secondary";
}

export default function BookingSummary({
  title,
  value,
  description,
  icon,
  variant = "default",
}: BookingSummaryProps) {
  // Determine card styles based on variant
  const cardClasses = variant === "outline" 
    ? "border border-border" 
    : variant === "secondary" 
      ? "bg-secondary" 
      : "bg-card";

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
} 