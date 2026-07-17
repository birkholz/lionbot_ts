"use client"

import Image from "next/image"
import type React from "react"

interface Props {
  avatar_url: string
  width: number
  height: number
}

function getOptimizedAvatarUrl(
  url: string,
  width: number,
  height: number,
): string {
  if (
    url.startsWith("https://res.cloudinary.com/") ||
    url.startsWith("https://placehold.co/")
  ) {
    return url
  }
  return `https://res.cloudinary.com/peloton-uat/image/fetch/ar_1,c_fill,dpr_2.0,f_auto,g_face,h_${height},q_auto:good,w_${width}/${url}`
}

export function UserAvatar({
  avatar_url,
  width,
  height,
}: Props): React.ReactElement {
  return (
    <Image
      src={getOptimizedAvatarUrl(avatar_url, width, height)}
      alt="User avatar"
      width={width}
      height={height}
      className="rounded-full"
      unoptimized
    />
  )
}
