import dotenv from 'dotenv';
import { Wallet } from 'ethers';
import { ClobClient } from '@polymarket/clob-client';

dotenv.config();

const HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137;

async function main(): Promise<void> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Missing PRIVATE_KEY in .env');
  }

  const signer = new Wallet(privateKey);
  const client = new ClobClient(
    HOST,
    CHAIN_ID,
    signer,
    undefined,
    undefined,
    undefined,
    process.env.POLYMARKET_GEO_TOKEN || undefined
  );

  let creds = await client.deriveApiKey().catch(() => null);
  if (!creds || (creds as any).error) {
    creds = await client.createApiKey();
  }

  const apiKey = (creds as any)?.apiKey || (creds as any)?.key;
  const secret = (creds as any)?.secret;
  const passphrase = (creds as any)?.passphrase;

  if (!apiKey || !secret || !passphrase) {
    throw new Error(`Could not generate API creds: ${JSON.stringify(creds)}`);
  }

  console.log('POLYMARKET_USER_API_KEY=' + apiKey);
  console.log('POLYMARKET_USER_SECRET=' + secret);
  console.log('POLYMARKET_USER_PASSPHRASE=' + passphrase);
}

main().catch((error) => {
  console.error('❌ Failed to generate API credentials:', error.message || error);
  process.exit(1);
});
