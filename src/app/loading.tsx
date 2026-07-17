import type React from "react"

import { Skeleton } from "@components/ui/skeleton"

export default function Loading(): React.ReactElement {
  return (
    <>
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
