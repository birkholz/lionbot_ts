import { Skeleton } from "@components/ui/skeleton"
import { Separator } from "@components/ui/separator"
export default function Loading() {
  return (
    <>
      <div className="mt-2 flex items-center justify-center gap-2">
        <Skeleton className="h-[32px] w-[32px]" />
        <Skeleton className="h-[32px] w-[10em]" />
        <Skeleton className="h-[32px] w-[32px]" />
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
    </>
  )
}
