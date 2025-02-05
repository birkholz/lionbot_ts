import { Separator } from "@components/ui/separator"
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
      <h1 className="mb-6 text-center text-2xl font-bold">Users</h1>
      <div className="mx-6 my-2">
        <Skeleton className="h-[350px] w-full" />
      </div>
      <div className="mx-8 mb-2">
        <Skeleton className="h-10 w-full" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>First Ride</TableHead>
            <TableHead>Total Rides</TableHead>
            <TableHead>Highest Wattage</TableHead>
            <TableHead>Highest Output</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
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
