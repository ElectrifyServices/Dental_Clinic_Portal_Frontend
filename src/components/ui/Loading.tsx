import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  type?: "skeleton" | "spinner";
  text?: string;
}

export function Loading({ className, type = "skeleton", text }: LoadingProps) {
  if (type === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        {text && <p className="text-sm font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse space-y-6", className)}>
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-8 bg-muted-foreground/10 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-xl" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="h-3 w-40 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-xl" />
        </div>
      </div>
      <div className="p-4 bg-muted/40 border border-border rounded-2xl flex gap-3 items-center">
        <div className="w-5 h-5 bg-muted rounded-full shrink-0" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
    </div>
  );
}
