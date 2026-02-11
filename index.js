const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, Routes, ChannelType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const express = require('express');

// --- RENDER 7/24 AKTİF TUTMA (EXPRESS) ---
const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000);

// --- BOT AYARLARI VE INTENTLER ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Verileri tutmak için (Bot resetlenince gider, kalıcı olması için DB gerekir)
const warnings = new Map();
const userCash = new Map();

// --- SLASH KOMUT TANIMLAMALARI ---
const commands = [
    new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı sunucudan yasaklar').addUserOption(o => o.setName('hedef').setDescription('Banlanacak kişi').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı sunucudan atar').addUserOption(o => o.setName('hedef').setDescription('Atılacak kişi').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    new SlashCommandBuilder().setName('uyar').setDescription('Kullanıcıya uyarı verir (Mute cezalı)').addUserOption(o => o.setName('hedef').setDescription('Uyarılacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('uyarı-göster').setDescription('Kullanıcının uyarı sayısını gösterir').addUserOption(o => o.setName('hedef').setDescription('Bakılacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('kanal-kilitle').setDescription('Kanalı mesaj gönderimine kapatır').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('kanal-aç').setDescription('Kanalın kilidini açar').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('kategori-aç').setDescription('Yeni bir kategori oluşturur').addStringOption(o => o.setName('isim').setDescription('Kategori adı').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('kategori-sil').setDescription('Belirtilen kategoriyi siler').addChannelOption(o => o.setName('kategori').setDescription('Silinecek kategori').setRequired(true).addChannelTypes(ChannelType.GuildCategory)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('rol-ver').setDescription('Kullanıcıya rol verir').addUserOption(o => o.setName('hedef').setRequired(true)).addRoleOption(o => o.setName('rol').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    new SlashCommandBuilder().setName('rol-al').setDescription('Kullanıcıdan rol alır').addUserOption(o => o.setName('hedef').setRequired(true)).addRoleOption(o => o.setName('rol').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    new SlashCommandBuilder().setName('sil').setDescription('Mesajları toplu siler (Max 100)').addIntegerOption(o => o.setName('adet').setDescription('Kaç mesaj silinsin?').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
].map(c => c.toJSON());

// --- OTO MESAJ VE EKONOMİ (!404 OWO/CASH) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase();
    
    // Sa-As - Naber-İyiyim
    if (msg === 'sa') return message.reply('Aleykümselam hoş geldin kanka!');
    if (msg === 'naber') return message.reply('İyiyim kanka, sen nasılsın?');

    // !404 owo / cash sistemi
    if (msg === '!4
