import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
  MessageFlags,
} from "discord.js"

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
})

async function processReactions(channel: TextChannel) {
  const reactionCounts = new Collection<
    string,
    { plus2: number; minus2: number; total: number }
  >()

  // Track only top messages
  const topTotalMessages = new Array<{
    url: string
    total: number
    plus2: number
    minus2: number
  }>(3).fill({ url: "", total: -Infinity, plus2: 0, minus2: 0 })
  const topPlus2Messages = new Array<{ url: string; plus2: number }>(3).fill({
    url: "",
    plus2: -Infinity,
  })
  const topMinus2Messages = new Array<{ url: string; minus2: number }>(3).fill({
    url: "",
    minus2: -Infinity,
  })

  try {
    let lastId: string | undefined = undefined
    let hasMore = true

    while (hasMore) {
      const options: { limit: number; before?: string } = { limit: 100 }
      if (lastId) options.before = lastId

      const messages = await channel.messages.fetch(options)
      if (messages.size < 100) hasMore = false

      // Update lastId for next iteration
      const lastMessage = messages.last()
      if (lastMessage) lastId = lastMessage.id

      // Only process messages that have reactions
      for (const [, message] of messages) {
        if (message.reactions.cache.size === 0) continue

        let messagePlus2 = 0
        let messageMinus2 = 0

        for (const reaction of message.reactions.cache.values()) {
          if (
            reaction.emoji.name === "plustwo" ||
            reaction.emoji.name === "minustwo"
          ) {
            const messageAuthorId = message.author.id

            if (!reactionCounts.has(messageAuthorId)) {
              reactionCounts.set(messageAuthorId, {
                plus2: 0,
                minus2: 0,
                total: 0,
              })
            }

            const count = reactionCounts.get(messageAuthorId)!
            if (reaction.emoji.name === "plustwo") {
              count.plus2 += reaction.count
              count.total += reaction.count * 2
              messagePlus2 = reaction.count
            } else {
              count.minus2 += reaction.count
              count.total -= reaction.count * 2
              messageMinus2 = reaction.count
            }
          }
        }

        // Update top messages if this message qualifies
        if (messagePlus2 > 0 || messageMinus2 > 0) {
          const total = messagePlus2 * 2 - messageMinus2 * 2

          // Update top total messages
          for (let i = 0; i < topTotalMessages.length; i++) {
            if (total > topTotalMessages[i].total) {
              topTotalMessages.splice(i, 0, {
                url: message.url,
                total,
                plus2: messagePlus2,
                minus2: messageMinus2,
              })
              topTotalMessages.pop()
              break
            }
          }

          // Update top plus2 messages
          if (messagePlus2 > 0) {
            for (let i = 0; i < topPlus2Messages.length; i++) {
              if (messagePlus2 > topPlus2Messages[i].plus2) {
                topPlus2Messages.splice(i, 0, {
                  url: message.url,
                  plus2: messagePlus2,
                })
                topPlus2Messages.pop()
                break
              }
            }
          }

          // Update top minus2 messages
          if (messageMinus2 > 0) {
            for (let i = 0; i < topMinus2Messages.length; i++) {
              if (messageMinus2 > topMinus2Messages[i].minus2) {
                topMinus2Messages.splice(i, 0, {
                  url: message.url,
                  minus2: messageMinus2,
                })
                topMinus2Messages.pop()
                break
              }
            }
          }
        }
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  } catch (error) {
    console.error(`Error fetching messages from channel ${channel.id}:`, error)
  }

  return {
    reactionCounts,
    topTotalMessages: topTotalMessages.filter((m) => m.url),
    topPlus2Messages: topPlus2Messages.filter((m) => m.url),
    topMinus2Messages: topMinus2Messages.filter((m) => m.url),
  }
}

async function formatReactionResults(
  client: Client,
  results: Awaited<ReturnType<typeof processReactions>>,
) {
  const {
    reactionCounts,
    topTotalMessages,
    topPlus2Messages,
    topMinus2Messages,
  } = results

  // Sort users by total score
  const sortedUsers = [...reactionCounts.entries()].sort(
    ([, a], [, b]) => b.total - a.total,
  )

  // Get top and bottom 5 users
  const topUsers = sortedUsers.slice(0, 5)
  const bottomUsers = sortedUsers.slice(-5).reverse()

  // Create response message
  let response = "**Top 5 Users by Reaction Score**\n"
  for (const [userId, counts] of topUsers) {
    const user = await client.users.fetch(userId)
    response += `${user.username}: ${counts.total} (${counts.plus2} +2s, ${counts.minus2} -2s)\n`
  }

  response += "\n**Bottom 5 Users by Reaction Score**\n"
  for (const [userId, counts] of bottomUsers) {
    const user = await client.users.fetch(userId)
    response += `${user.username}: ${counts.total} (${counts.plus2} +2s, ${counts.minus2} -2s)\n`
  }

  response += "\n**Top 3 Messages by Total Score**\n"
  for (const msg of topTotalMessages) {
    response += `${msg.total} (${msg.plus2} +2s, ${msg.minus2} -2s) ${msg.url}\n`
  }

  response += "\n**Top 3 Messages by +2s**\n"
  for (const msg of topPlus2Messages) {
    response += `${msg.plus2} ${msg.url}\n`
  }

  response += "\n**Top 3 Messages by -2s**\n"
  for (const msg of topMinus2Messages) {
    response += `${msg.minus2} ${msg.url}\n`
  }

  return response
}

// Handle the slash command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName !== "sum-reactions") return

  // Check if the user is authorized
  if (interaction.user.id !== "140333328241786880") {
    await interaction.reply({
      content: "You are not authorized to use this command.",
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  // Acknowledge the command immediately
  await interaction.reply({
    content:
      "Processing reactions... I'll send you the results in a DM when finished.",
    flags: MessageFlags.Ephemeral,
  })

  try {
    const channel = interaction.channel as TextChannel
    const results = await processReactions(channel)
    const response = await formatReactionResults(client, results)

    // Send results via DM
    await interaction.user.send({
      content: `Results for ${channel.name}:\n\n${response}`,
    })
  } catch (error) {
    console.error("Error processing sum-reactions command:", error)
    // Try to send error via DM
    try {
      await interaction.user.send(
        "An error occurred while processing the command.",
      )
    } catch (dmError) {
      console.error("Could not send DM to user:", dmError)
      // If DM fails, try to edit the original reply if we're still within time limit
      await interaction
        .editReply(
          "Error: Could not send results via DM. Please make sure you have DMs enabled.",
        )
        .catch(() => {})
    }
  }
})

// When the client is ready, log ready status
client.once(Events.ClientReady, (readyClient: Client<true>) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
