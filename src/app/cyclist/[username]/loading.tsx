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
          <Skeleton className="mb-2 h-9 w-48" />
          <Skeleton className="mb-1 h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-4 text-center text-xl font-bold">Group Rides</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ride</TableHead>
              <TableHead>Instructor/Description</TableHead>
              <TableHead className="text-right">Output</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="text-nowrap text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
