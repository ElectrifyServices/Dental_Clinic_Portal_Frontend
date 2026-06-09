import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: React.ReactNode;
  className?: string;
}

export function ErrorState({ title = "An error occurred", message, className }: ErrorStateProps) {
  return (
    <div className={cn("p-4 text-center bg-destructive/5 border border-destructive/10 rounded-2xl flex flex-col items-center justify-center gap-3", className)}>
      <AlertCircle className="w-8 h-8 text-destructive" />
      <h4 className="text-sm font-bold text-destructive">{title}</h4>
      <div className="text-xs text-muted-foreground">{message}</div>
    </div>
  );
}
