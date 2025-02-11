require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require("express"); // Web server to keep bot alive

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Create a simple web server to keep bot alive
const app = express();

app.get("/", (req, res) => {
    res.send("🚔 Gay Police Bot is running and patrolling!");
});

app.listen(3000, () => {
    console.log("🌐 Web server is running on port 3000! Use this URL in your cron job.");
});

// Define "gay" triggers
const gayTriggers = [
    "i'm gay", "im gay", "i am gay", "gay af", "super gay", 
    "gay vibes", "gay energy", "fruity", "big gay", "gay moment"
];

// Define "Ur/Your Gay" triggers
const urGayTriggers = [
    "ur gay", "your gay", "you're gay", "ur gay af", "your gay af", "you're gay af"
];

// Slash command setup
const commands = [
    new SlashCommandBuilder()
        .setName('gaypolice')
        .setDescription('Summon the Gay Police on someone!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Who are you calling out?')
                .setRequired(true))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`🚓 Gay Police is online as ${client.user.tag}`);

    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
});

// Detect "gay" messages
client.on('messageCreate', async message => {
    if (message.author.bot) return; 

    const lowerMessage = message.content.toLowerCase();
    console.log(`📩 Message received: "${lowerMessage}" from ${message.author.username}`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const stickers = await guild.stickers.fetch();

        // Case-insensitive sticker search
        const sticker = stickers.find(s => s.name.toLowerCase().replace(/\s+/g, '') === "gaypolice");

        if (!sticker) {
            console.log("🚨 Sticker 'Gay Police' not found!");
        } else {
            // Check for general "gay" phrases
            if (gayTriggers.some(trigger => lowerMessage.includes(trigger))) {
                console.log("🚨 Triggered Gay Police response!");
                await message.channel.send({ stickers: [sticker] });

                const responses = [
                    `🚔 **GAY POLICE ALERT!** 🚨 @${message.author.username}, explain yourself!`,
                    `🛑 STOP RIGHT THERE, @${message.author.username}! This is the **GAY POLICE**!`,
                    `👮‍♂️ **We got a fruity one!** What do you have to say for yourself, @${message.author.username}?`,
                    `🚓 **GAY DETECTED!** @${message.author.username}, you have been caught in 4K!`,
                    `🔎 **Analysis complete:** Yep, that's definitely **gay**. @${message.author.username}, step forward!`
                ];
                await message.channel.send(responses[Math.floor(Math.random() * responses.length)]);
            }

            // Check for "Ur/Your Gay" phrases
            if (urGayTriggers.some(trigger => lowerMessage.startsWith(trigger))) {
                console.log("🚔 Someone said 'Ur Gay' - Triggering response!");
                await message.reply(`👀 **@${message.author.username}, who exactly is gay? Point them out!**`);
            }
        }
    } catch (error) {
        console.error("❌ Error processing message:", error);
    }
});

// Slash command: /gaypolice
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'gaypolice') {
        const user = interaction.options.getUser('target');
        if (user.bot) return interaction.reply("🚨 The Gay Police don't arrest bots!");

        const responses = [
            `🚨 **GAY POLICE ALERT!** @${user.username}, explain yourself!`,
            `🚔 **You have been caught!** @${user.username}, the Gay Police are here!`,
            `👮‍♂️ **Suspect Detected!** @${user.username}, step forward for questioning!`
        ];
        await interaction.reply(responses[Math.floor(Math.random() * responses.length)]);
    }
});

// Start the bot
client.login(TOKEN);