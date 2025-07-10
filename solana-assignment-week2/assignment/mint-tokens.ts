import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";

import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.RPC_URL!, "confirmed");

  const payer = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(fs.readFileSync(process.env.PAYER_JSON!, "utf-8"))
    )
  );

  const receiver = new PublicKey(
    "63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs"
  );

  // === Mint Fungible Token (FT) ===
  const ftMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6 // decimals
  );

  const payerFtAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    ftMint,
    payer.publicKey
  );

  const receiverFtAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    ftMint,
    receiver
  );

  const tx1 = new Transaction().add(
    createMintToInstruction(
      ftMint,
      payerFtAccount.address,
      payer.publicKey,
      100 * 10 ** 6
    ),
    createMintToInstruction(
      ftMint,
      receiverFtAccount.address,
      payer.publicKey,
      10 * 10 ** 6
    )
  );

  const sig1 = await sendAndConfirmTransaction(connection, tx1, [payer]);
  console.log("✅ FT Minted - Tx Signature:", sig1);

  // === Mint NFT ===
  const nftMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    0 // NFT = 0 decimals
  );

  const nftTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    nftMint,
    payer.publicKey
  );

  const tx2 = new Transaction().add(
    createMintToInstruction(
      nftMint,
      nftTokenAccount.address,
      payer.publicKey,
      1
    ),
    createSetAuthorityInstruction(
      nftMint,
      payer.publicKey,
      AuthorityType.MintTokens,
      null
    )
  );

  const sig2 = await sendAndConfirmTransaction(connection, tx2, [payer]);
  console.log("🎨 NFT Minted - Tx Signature:", sig2);
};

main().catch((err) => {
  console.error("❌ Error:", err);
});
