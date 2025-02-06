import { Skeleton } from "@components/ui/skeleton"

export default function Loading() {
  return (
    <div>
      <h1 className="mb-4 text-center text-2xl font-bold">
        <Skeleton className="mx-auto h-8 w-64" />
      </h1>
      <p className="mx-4 mb-6 text-sm text-muted-foreground">
        <Skeleton className="h-6 w-full" />
      </p>
      <div className="mb-8">
        <h2 className="mb-4 text-center text-xl font-bold">
          <Skeleton className="mx-auto h-6 w-48" />
        </h2>
        <Skeleton className="h-[200px] w-full md:h-[300px]" />
      </div>
      <div className="mb-8">
        <h2 className="mb-4 text-center text-xl font-bold">
          <Skeleton className="mx-auto h-6 w-48" />
        </h2>
        <Skeleton className="h-[200px] w-full md:h-[300px]" />
      </div>
      <div className="mb-8">
        <h2 className="mb-4 text-center text-xl font-bold">
          <Skeleton className="mx-auto h-6 w-48" />
        </h2>
        <Skeleton className="h-[200px] w-full md:h-[300px]" />
      </div>
    </div>
  )
}
