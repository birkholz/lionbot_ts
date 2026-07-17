import type React from "react"

import { Skeleton } from "@components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"

export default function Loading(): React.ReactElement {
  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        <Skeleton className="mx-auto h-8 w-48" />
      </h1>
      <div className="mx-4 mb-6 text-left text-sm text-muted-foreground">
        <Skeleton className="h-4 w-full" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Ride</TableHead>
            <TableHead className="text-nowrap text-center">Published</TableHead>
            <TableHead className="text-nowrap text-center">
              Last Posted
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="aspect-video w-28 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="mb-1 h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-20" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
