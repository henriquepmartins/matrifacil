"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  size = "md",
}: StatsCardProps) {
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  const sizeClasses = {
    sm: {
      card: "p-4",
      title: "text-xs",
      value: "text-lg",
      icon: "h-3 w-3",
      trend: "text-xs",
    },
    md: {
      card: "p-6",
      title: "text-sm",
      value: "text-2xl",
      icon: "h-4 w-4",
      trend: "text-xs",
    },
    lg: {
      card: "p-8",
      title: "text-base",
      value: "text-3xl",
      icon: "h-6 w-6",
      trend: "text-sm",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Card
      className={cn(
        "rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900",
        currentSize.card,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={cn("font-medium text-muted-foreground", currentSize.title)}
        >
          {title}
        </CardTitle>
        <Icon className={cn("text-muted-foreground", currentSize.icon)} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn("font-bold", currentSize.value)}>{value}</div>
        {trend && (
          <div
            className={cn(
              "flex items-center text-muted-foreground mt-2",
              currentSize.trend
            )}
          >
            {isPositive && (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            )}
            {isNegative && (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={cn(
                isPositive && "text-green-500",
                isNegative && "text-red-500"
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
