import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { Skeleton } from "@components/ui/skeleton"

export default function Loading() {
  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-4">
        <Skeleton className="h-[80px] w-[80px] rounded-full" />
        <div>
          <h1 className="text-3xl font-bold">
            <Skeleton className="h-8 w-48" />
          </h1>
          <div className="text-sm text-muted-foreground">
            <Skeleton className="mt-2 h-4 w-36" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-4 text-center text-xl font-bold">
          <Skeleton className="mx-auto h-6 w-48" />
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ride</TableHead>
              <TableHead>Instructor/Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-64" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
