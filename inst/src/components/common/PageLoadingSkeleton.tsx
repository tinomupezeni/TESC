import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="space-y-2 px-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      
      <div className="px-1">
        <Skeleton className="h-10 w-full sm:w-[400px] rounded-md" />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow space-y-6 p-6">
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full md:w-1/3" />
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <div className="border-b h-12 bg-muted/50 flex items-center px-4 gap-4">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-32" />
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-24" />
          </div>
          <div className="p-4 space-y-4">
             <Skeleton className="h-6 w-full" />
             <Skeleton className="h-6 w-full" />
             <Skeleton className="h-6 w-full" />
             <Skeleton className="h-6 w-full" />
             <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
