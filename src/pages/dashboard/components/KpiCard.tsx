import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
  delay?: string;
  subtitle?: string;
  colorVariant?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'indigo';
  progressValue?: number;
  progressText?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  isLoading,
  delay,
  subtitle = "Mes Actual",
  colorVariant = 'blue',
  progressValue,
  progressText
}: KpiCardProps) {
  
  const colorStyles = {
    blue: {
      bg: "bg-blue-50/30",
      iconBg: "bg-blue-100 group-hover:bg-blue-600",
      iconText: "text-blue-600 group-hover:text-white",
      accent: "bg-blue-600",
      glow: "shadow-blue-600/30",
      text: "text-blue-700",
      blob: "bg-blue-400/20",
      progress: "[&>div]:bg-blue-600"
    },
    emerald: {
      bg: "bg-emerald-50/30",
      iconBg: "bg-emerald-100 group-hover:bg-emerald-600",
      iconText: "text-emerald-600 group-hover:text-white",
      accent: "bg-emerald-600",
      glow: "shadow-emerald-600/30",
      text: "text-emerald-700",
      blob: "bg-emerald-400/20",
      progress: "[&>div]:bg-emerald-600"
    },
    violet: {
      bg: "bg-violet-50/30",
      iconBg: "bg-violet-100 group-hover:bg-violet-600",
      iconText: "text-violet-600 group-hover:text-white",
      accent: "bg-violet-600",
      glow: "shadow-violet-600/30",
      text: "text-violet-700",
      blob: "bg-violet-400/20",
      progress: "[&>div]:bg-violet-600"
    },
    amber: {
      bg: "bg-amber-50/30",
      iconBg: "bg-amber-100 group-hover:bg-amber-600",
      iconText: "text-amber-600 group-hover:text-white",
      accent: "bg-amber-600",
      glow: "shadow-amber-600/30",
      text: "text-amber-700",
      blob: "bg-amber-400/20",
      progress: "[&>div]:bg-amber-600"
    },
    rose: {
      bg: "bg-rose-50/30",
      iconBg: "bg-rose-100 group-hover:bg-rose-600",
      iconText: "text-rose-600 group-hover:text-white",
      accent: "bg-rose-600",
      glow: "shadow-rose-600/30",
      text: "text-rose-700",
      blob: "bg-rose-400/20",
      progress: "[&>div]:bg-rose-600"
    },
    indigo: {
      bg: "bg-indigo-50/30",
      iconBg: "bg-indigo-100 group-hover:bg-indigo-600",
      iconText: "text-indigo-600 group-hover:text-white",
      accent: "bg-indigo-600",
      glow: "shadow-indigo-600/30",
      text: "text-indigo-700",
      blob: "bg-indigo-400/20",
      progress: "[&>div]:bg-indigo-600"
    }
  };

  const style = colorStyles[colorVariant] || colorStyles.blue;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border-zinc-200/60 bg-white/70 backdrop-blur-xl",
        "transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl",
        "animate-in fade-in slide-in-from-bottom-8 fill-both",
        style.bg
      )}
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 right-0 p-5 opacity-0 transform translate-x-4 -translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-10">
        <ArrowUpRight className={cn("w-6 h-6 opacity-70", style.text)} />
      </div>
      
      <div className={cn(
        "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 z-0",
        style.blob
      )}></div>
      
      <CardContent className="p-7 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:shadow-lg",
            style.iconBg,
            `group-hover:${style.glow}`
          )}>
            <Icon className={cn("h-7 w-7 transition-colors duration-500", style.iconText)} />
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-white/80 border border-zinc-100 shadow-sm px-2.5 py-1 rounded-lg">
               {subtitle}
             </span>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-zinc-500 tracking-wide uppercase">{title}</h3>
          {isLoading ? (
            <div className="h-10 w-28 bg-zinc-200/50 rounded-lg animate-pulse mt-2"></div>
          ) : (
            <div className="text-4xl font-extrabold text-zinc-900 font-mono tracking-tighter drop-shadow-sm">
              {value}
            </div>
          )}
        </div>
        
        {progressValue !== undefined && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <span>{progressText}</span>
              <span className={style.text}>{Math.round(progressValue)}%</span>
            </div>
            <Progress
              value={progressValue}
              className={cn("h-1.5 bg-zinc-200/50", style.progress)}
            />
          </div>
        )}
      </CardContent>
      
      <div className={cn("absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-700 ease-out", style.accent)}></div>
    </Card>
  );
}