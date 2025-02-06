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
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        <Skeleton className="mx-auto h-8 w-32" />
      </h1>
      <p className="mx-4 mb-6 text-center">
        <Skeleton className="mx-auto h-4 w-64" />
      </p>
      <p className="mx-4 mb-2 text-left text-sm text-muted-foreground">
        <Skeleton className="h-4 w-full" />
      </p>
      <p className="mx-4 mb-2 text-left text-sm text-muted-foreground">
        <Skeleton className="h-4 w-full" />
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>First Ride</TableHead>
            <TableHead>Total Rides</TableHead>
            <TableHead>Highest Output</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-[21px] w-[21px] rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
