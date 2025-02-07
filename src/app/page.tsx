import { Button } from "@components/ui/button"
import bothImage from "/public/both.png"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "#TheEggCarton",
  description: "The home of #TheEggCarton on Peloton",
  openGraph: {
    title: "#TheEggCarton",
    description: "The home of #TheEggCarton on Peloton",
    images: [{ url: bothImage.src }],
  },
}

export default function HomePage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="mb-8 text-2xl">
          Welcome to the home of #TheEggCarton on Peloton
        </p>
        <div className="mb-8 flex justify-center">
          <Link href="/latest">
            <Button size="lg">View Latest Leaderboards</Button>
          </Link>
        </div>
        <p className="mb-8 text-lg">
          Wondering how to join? #TheEggCarton gathers every morning around 6am
          PT to ride together, with smaller groups riding at other times
          throughout the day.{" "}
          <a
            href="https://www.peloton.com/us/community/tags/TheEggCarton"
            target="_blank"
            className="text-primary hover:text-primary/80 hover:underline"
          >
            Join the tag on Peloton
          </a>{" "}
          and start riding! To get onto the leaderboards here, you'll need to
          join one our group rides. The group rides are announced in{" "}
          <a
            href="https://www.reddit.com/r/northernlion/comments/hwrixs/how_to_join_the_discord/"
            target="_blank"
            className="text-primary hover:text-primary/80 hover:underline"
          >
            Northernlion's discord server
          </a>{" "}
          in the #pelotoninfo channel. You'll want to join the subscriber
          discord anyways, because that's the home of discussion for
          #TheEggCarton.
        </p>
      </div>
    </>
  )
}
