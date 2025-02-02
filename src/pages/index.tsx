import type { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/latest",
      permanent: false,
    },
  }
}

export default function Home() {
  return null
}
