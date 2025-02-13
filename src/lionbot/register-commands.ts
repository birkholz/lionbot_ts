import {
  InteractionContextType,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js"

// Create the slash command
const sumReactionsCommand = new SlashCommandBuilder()
  .setName("sum-reactions")
  .setDescription("Lists users ranked by most +2/-2 reactions received")
  .setContexts(InteractionContextType.Guild)
// Create REST instance
const rest = new REST().setToken(process.env.DISCORD_TOKEN!)

async function registerCommands() {
  try {
    console.log("Started refreshing application (/) commands.")
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
      body: [sumReactionsCommand.toJSON()],
    })
    console.log("Successfully reloaded application (/) commands.")
  } catch (error) {
    console.error("Error registering commands:", error)
    process.exit(1)
  }
  process.exit(0)
}

// Execute the registration
registerCommands()
