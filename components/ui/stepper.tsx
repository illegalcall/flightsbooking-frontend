"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  steps: {
    id: string;
    label: string;
    description?: string;
  }[];
  activeStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({ steps, activeStep, onStepClick, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="md:flex-1">
            <div
              className={cn(
                "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                index < activeStep
                  ? "border-primary"
                  : index === activeStep
                  ? "border-primary"
                  : "border-border",
                onStepClick ? "cursor-pointer" : ""
              )}
              onClick={() => onStepClick?.(index)}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  index < activeStep
                    ? "text-primary"
                    : index === activeStep
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Step {index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  index <= activeStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span
                  className={cn(
                    "text-xs",
                    index <= activeStep ? "text-muted-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {step.description}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 