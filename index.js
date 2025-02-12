require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require("express");

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
    console.log("🌐 Web server running on port 3000! Keeping bot alive.");
});

// "Gay" triggers
const gayTriggers = [
    "i'm gay", "im gay", "i am gay", "gay af", "super gay", 
    "gay vibes", "gay energy", "fruity", "big gay", "gay moment"
];

// "Ur/Your Gay" triggers
const urGayTriggers = [
    "ur gay", "your gay", "you're gay", "ur gay af", "your gay af", "you're gay af"
];

// Funny random police-style responses
const policeResponses = [
    `🚔 **GAY POLICE ALERT!** @USER, explain yourself!`,
    `🛑 STOP RIGHT THERE, @USER! This is the **GAY POLICE**!`,
    `👮‍♂️ **We got a fruity one!** What do you have to say for yourself, @USER?`,
    `🚓 **GAY DETECTED!** @USER, you have been caught in 4K!`,
    `🔎 **Analysis complete:** Yep, that's definitely **gay**. @USER, step forward!`,
    `📢 **BREAKING NEWS:** @USER has been **caught red-handed** in **fruity activities**! 🚔`
];

// Responses to bot mentions
const botReplies = [
    "🚔 Stay in your lane before I take you to **Gay Jail**!",
    "👮‍♂️ Don't make me take you downtown for **questioning**.",
    "🚨 Keep calling my attention, and I'll have to get a taste of your donut... I mean **uhhhh**.",
    "🕵️‍♂️ You're looking **real suspicious** right now, buddy.",
    "🔦 Caught in **4K**. Explain yourself, @USER!",
    "🎤 **Sir, step out of the vehicle.** We have a **flaming violation** here.",
    "🚔 **License and registration, fruity behavior detected.**",
    "😏 Keep talking, and I might just have to **inspect** you further.",
    "👮‍♂️ Hands up! You're under arrest for **excessive sassiness!**"
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

// Detect "gay" messages, bot mentions, and respond
client.on('messageCreate', async message => {
    if (message.author.bot) return; 

    const lowerMessage = message.content.toLowerCase();
    console.log(`📩 Message received: "${lowerMessage}" from ${message.author.username}`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const stickers = await guild.stickers.fetch();

        // Case-insensitive sticker search
        const sticker = stickers.find(s => s.name.toLowerCase().replace(/\s+/g, '') === "gaypolice");

        // If someone says a "gay" phrase
        if (gayTriggers.some(trigger => lowerMessage.includes(trigger))) {
            console.log("🚨 Triggered Gay Police response!");
            if (sticker) await message.channel.send({ stickers: [sticker] });

            let response = policeResponses[Math.floor(Math.random() * policeResponses.length)];
            response = response.replace("@USER", `@${message.author.username}`);
            await message.channel.send(response);
        }

        // If someone says "ur gay"
        if (urGayTriggers.some(trigger => lowerMessage.startsWith(trigger))) {
            console.log("🚔 Someone said 'Ur Gay' - Triggering response!");
            await message.reply(`👀 **@${message.author.username}, who exactly is gay? Point them out!**`);
        }

        // If the bot is mentioned
        if (message.mentions.has(client.user)) {
            console.log("💬 Bot was pinged! Sending response...");
            let response = botReplies[Math.floor(Math.random() * botReplies.length)];
            response = response.replace("@USER", `@${message.author.username}`);
            await message.reply(response);
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

        let response = policeResponses[Math.floor(Math.random() * policeResponses.length)];
        response = response.replace("@USER", `@${user.username}`);
        await interaction.reply(response);
    }
});

// Start the bot
client.login(TOKEN);