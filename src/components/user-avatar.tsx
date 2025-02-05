"use client"

import Image from "next/image"

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
  return `https://res.cloudinary.com/peloton-cycle/image/fetch/ar_1,c_fill,dpr_2.0,f_auto,g_face,h_${height},q_auto:good,w_${width}/${url}`
}

export function UserAvatar({ avatar_url, width, height }: Props) {
  return (
    <Image
      src={getOptimizedAvatarUrl(avatar_url, width, height)}
      alt="User avatar"
      width={width}
      height={height}
      className="rounded-full"
    />
  )
}
