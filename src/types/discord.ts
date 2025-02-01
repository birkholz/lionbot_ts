export interface DiscordEmbed {
  type: string
  title: string
  description: string
  url: string
  thumbnail: {
    url: string
  }
  fields: {
    name: string
    value: string
    inline: boolean
  }[]
}
