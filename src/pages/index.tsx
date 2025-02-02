import { format } from "date-fns"
import type { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `/${format(new Date(), "yyyy-MM-dd")}`,
      permanent: false,
    },
  }
}

export default function Home() {
  return null
}
