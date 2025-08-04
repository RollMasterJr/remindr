import chalk from "chalk";
import { Client, EmbedBuilder, IntentsBitField, MessageFlags, Events, ChatInputCommandInteraction, CacheType } from "discord.js";
import fetch from "node-fetch";
import ora from "ora";
import prompts from "prompts";

// Initial log
console.log(chalk.bold.green("Remindr"));
console.log(chalk.bold(chalk.red("Remember **not** to share your bot token with anyone!\n")));
console.log(chalk.bold("This bot is here to help with server management and interaction!"));
console.log(chalk.bold("If you need help, contact on Discord.\n"));

// Function to check the validity of the token
export async function checkToken(value: string): Promise<boolean> {
 if (!value) return false;
 const res = await fetch("https://discord.com/api/v10/users/@me", {
  method: "GET",
  headers: { Authorization: `Bot ${value.toString()}` },
 });
 return res.status !== 200 ? false : true;
}

// Server check
const community = await prompts({
 type: "confirm",
 name: "value",
 message: "Have you created a new Discord server and enabled the Community option in server settings?",
 initial: true,
});

if (!community.value) {
 console.log(chalk.bold.red("✖ You need to create a Discord server and enable the Community option!"));
 process.exit(0);
}

// Ask for the bot token
const tokenPrompt = await prompts({
 type: "password",
 name: "token",
 message: "Enter your Discord bot token (Ctrl + Shift + V to paste):",
 validate: async (value: string) => {
  const valid = await checkToken(value);
  return valid ? true : "Invalid Discord bot token!";
 },
});

const valid = await checkToken(tokenPrompt.token);
if (!valid) {
 console.log(chalk.bold.red("✖ Invalid Discord bot token!"));
 process.exit(0);
}

console.log();
const spinner = ora(chalk.bold("Running the Discord bot")).start();

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });

try {
 client.login(tokenPrompt.token);
} catch (_e) {
 spinner.fail(chalk.bold("Error logging in to Discord!"));
 process.exit(0);
}

const slashSpinner = ora(chalk.bold("Creating slash commands..."));

client.on("ready", async (client) => {
 spinner.succeed(chalk.bold(`Logged in as ${chalk.cyan.underline(client.user.tag)}!`));
 console.log(
  chalk.bold.green("✔") +
   chalk.bold(" Use this link to add the bot to your server: ") +
   chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)
 );

 // Create several useful commands
 await client.application?.commands.set([
  {
   name: "active",
   description: "Get the Discord Active Developer Badge",
  },
  {
   name: "serverinfo",
   description: "Get information about the server",
  },
  {
   name: "welcome",
   description: "Send a welcome message to the new member",
  },
  {
   name: "help",
   description: "Show all available commands",
  },
  {
   name: "meme",
   description: "Get a random meme",
  },
  {
   name: "trivia",
   description: "Start a trivia game",
  }
 ]);

 slashSpinner.text = chalk.bold("Go to your Discord server and try the new slash commands!");
 slashSpinner.start();
});

// Handle user interactions
client.on(Events.InteractionCreate, async (interaction) => {
 try {
  if (!interaction.isCommand()) return;

  // Check if the interaction is of type ChatInputCommandInteraction
  if (interaction instanceof ChatInputCommandInteraction) {

// "/active" command - providing the badge with a more subtle approach
if (interaction.commandName === "active") {
    console.log(chalk.bold.green("Slash command /active received!"));

    // Obtenção da data atual
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(currentDate);

    // Criando o embed com a data
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Active Developer Badge", iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless" })
        .setTitle("Follow the instructions to get your Active Developer Badge!")
        .setColor("#34DB98")
        .setDescription(
            "- Go to *https://discord.com/developers/active-developer* and claim your badge\n - Verification may take up to 24 hours."
        )
        .addFields(
            { name: "Date of Activation", value: `The command was activated on: **${formattedDate}**` }
        )
        .setFooter({ text: "Made by @RollMasterJR", iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless" });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

   // "/serverinfo" command - provides server info
   if (interaction.commandName === "serverinfo") {
    if (interaction.guild) {
     const serverEmbed = new EmbedBuilder()
      .setTitle(`${interaction.guild.name} Info`)
      .addFields(
       { name: "Server Name", value: interaction.guild.name },
       { name: "Total Members", value: `${interaction.guild.memberCount}` },
       { name: "Owner", value: `${interaction.guild.ownerId}` }
      )
      .setColor("#00BFFF")
      .setFooter({ text: "Server Info" });
     await interaction.reply({ embeds: [serverEmbed] });
    } else {
     await interaction.reply("This command must be used in a server.");
    }
   }

   // "/welcome" command - welcome message
   if (interaction.commandName === "welcome") {
    const user = interaction.options.getUser("user");
    const welcomeEmbed = new EmbedBuilder()
     .setTitle("Welcome to the Server!")
     .setDescription(`Hello ${user}, welcome to ${interaction.guild?.name}! Enjoy your stay.`)
     .setColor("#32CD32")
     .setFooter({ text: "Enjoy your time here!" });
    await interaction.reply({ embeds: [welcomeEmbed] });
   }

   // "/meme" command - random meme
   if (interaction.commandName === "meme") {
    const memeEmbed = new EmbedBuilder()
     .setTitle("Here's a meme for you!")
     .setImage("https://some-random-meme-api.com/meme.jpg")
     .setColor("#FF6347");
    await interaction.reply({ embeds: [memeEmbed] });
   }

   // "/help" command - show commands
   if (interaction.commandName === "help") {
    const helpEmbed = new EmbedBuilder()
     .setTitle("Available Commands")
     .addFields(
      { name: "/active", value: "Get your Active Developer Badge" },
      { name: "/serverinfo", value: "Get information about the server" },
      { name: "/welcome", value: "Send a welcome message to a member" },
      { name: "/meme", value: "Get a random meme" },
      { name: "/trivia", value: "Start a trivia game" }
     )
     .setColor("#FFD700")
     .setFooter({ text: "Bot Help" });
    await interaction.reply({ embeds: [helpEmbed] });
   }
  }

 } catch (error) {
  console.error(error);
  slashSpinner.fail(chalk.bold.red("An error occurred while handling the interaction."));
 }
});
