const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { catchMsg } = require('../../util');
const { getChatIdByName } = require('./find');
const GROUP_TO_SEND = process.env.GROUP_TO_SEND || 'Partithura - monitor 💻';

function parseNumber(number) {
  if (!number) {
    return null;
  }
  return `${number}`.replace('+', '') + '@c.us';
}

/**
 * @typedef {{
 * _events: object
 * _eventsCount: number
 * _maxListeners?: number
 * options: OptionsClient
 * authStrategy: object
 * }} WhatsAppClient
 */
/**
 * @typedef {{
 * authStrategy: object
 * puppeteer: object
 * authTimeoutMs: number
 * qrMaxRetries: number
 * takeoverOnConflict: boolean
 * takeoverTimeoutMs: number
 * userAgent: string
 * ffmpegPath: string
 * bypassCSP: boolean
 * }} OptionsClient
 */

/**
 * Constrói um cliente WhatsApp e monitora os eventos para sua configuração
 * @param {string} clientId
 * @returns {Promise<WhatsAppClient>}
 */
async function buildClient(clientId) {
  let chatId = '';
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId,
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })

    .on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    })
    .on('error', (err) => console.log({ err }))
    .on('message', catchMsg)
    .on('ready', async () => {
      // console.log('ready'); // TODO: adicionar o logger

      chatId = getChatIdByName(await client.getChats(), GROUP_TO_SEND);
    });

  await client.initialize();
  return {
    sendMessage: async (phone, message) => {
      try {
        const receiver = parseNumber(phone) || chatId;

        const { ack } = await client.sendMessage(receiver, message);

        return {
          statusText: ack,
        };
      } catch ({ message }) {
        return {
          statusText: -1,
          error: message,
        };
      }
    },
  };
}

module.exports = { buildClient };
