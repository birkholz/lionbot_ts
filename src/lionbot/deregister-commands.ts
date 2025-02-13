import { REST, Routes } from "discord.js"

// Create REST instance
const rest = new REST().setToken(process.env.DISCORD_TOKEN!)

async function deregisterAllCommands() {
  try {
    console.log("Started removing all application (/) commands.")
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
      body: [],
    })
    console.log("Successfully removed all application (/) commands.")
  } catch (error) {
    console.error("Error removing application commands:", error)
    process.exit(1)
  }
  process.exit(0)
}

// Execute the deregistration
deregisterAllCommands()
