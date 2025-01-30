import { redirect } from 'next/navigation';
import { format, subDays } from 'date-fns';

export default function Page() {
    const today = subDays(new Date(), 1);
    redirect(`/${format(today, 'yyyy-MM-dd')}`);
}
