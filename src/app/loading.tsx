import { Separator } from "@components/ui/separator"
import { Skeleton } from "@components/ui/skeleton"

export default function Loading() {
  return (
    <>
      <div className="absolute right-3 top-3">
        <Skeleton className="h-[32px] w-[32px]" />
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <Skeleton className="h-[30px] w-[30px]" />
        <Skeleton className="h-[30px] w-[9em]" />
        <Skeleton className="h-[30px] w-[30px]" />
      </div>
      <Separator className="mt-2" />
      <div className="border-b py-4">
        <Skeleton className="mt-2 h-[1.5rem] w-[24rem]" />
      </div>
      <div className="border-b py-4">
        <Skeleton className="mt-2 h-[1.5rem] w-[24rem]" />
      </div>
      <div className="border-b py-4">
        <Skeleton className="mt-2 h-[1.5rem] w-[24rem]" />
      </div>
      {/* <div className="mt-2 flex items-center justify-center gap-2">
        <Skeleton className="h-[300px] w-full" />
      </div> */}
    </>
  )
}
