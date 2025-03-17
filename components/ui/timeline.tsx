import * as React from "react";
import { cn } from "@/lib/utils";

type TimelineProps = React.HTMLAttributes<HTMLDivElement>;

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </div>
  )
);
Timeline.displayName = "Timeline";

type TimelineItemProps = React.HTMLAttributes<HTMLDivElement>;

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex mb-6 last:mb-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineItem.displayName = "TimelineItem";

type TimelineSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col items-center mr-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineSeparator.displayName = "TimelineSeparator";

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "primary" | "success" | "warning" | "destructive" | "gray";
  variant?: "filled" | "outlined";
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, color = "primary", variant = "filled", ...props }, ref) => {
    // Determine dot color styles based on color
    const colorStyles = {
      primary: variant === "filled" ? "bg-primary border-primary" : "border-primary",
      success: variant === "filled" ? "bg-success border-success" : "border-success",
      warning: variant === "filled" ? "bg-warning border-warning" : "border-warning",
      destructive: variant === "filled" ? "bg-destructive border-destructive" : "border-destructive",
      gray: variant === "filled" ? "bg-muted border-muted" : "border-muted",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "h-4 w-4 rounded-full border-2",
          variant === "filled" && "border-transparent",
          colorStyles[color],
          className
        )}
        {...props}
      />
    );
  }
);
TimelineDot.displayName = "TimelineDot";

type TimelineConnectorProps = React.HTMLAttributes<HTMLDivElement>;

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-0.5 bg-border grow my-1", className)}
      {...props}
    />
  )
);
TimelineConnector.displayName = "TimelineConnector";

type TimelineContentProps = React.HTMLAttributes<HTMLDivElement>;

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pt-0.5 grow", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineContent.displayName = "TimelineContent";

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
}; 