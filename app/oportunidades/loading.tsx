import { PremiumSkeleton } from "@/components/ui/premium-skeleton"

export default function OportunidadesLoading() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
      <div className="flex flex-col gap-12">
        <div className="space-y-4">
          <PremiumSkeleton className="h-10 w-64 md:h-12 md:w-96" />
          <PremiumSkeleton className="h-6 w-full max-w-2xl" />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 p-6 rounded-xl border border-white/5 bg-black/20">
              <div className="flex justify-between items-start">
                <PremiumSkeleton className="h-8 w-8 rounded-full" />
                <PremiumSkeleton className="h-6 w-24 rounded-full" />
              </div>
              <PremiumSkeleton className="h-6 w-3/4" />
              <PremiumSkeleton className="h-4 w-full" />
              <PremiumSkeleton className="h-4 w-5/6" />
              <PremiumSkeleton className="h-4 w-1/2 mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
