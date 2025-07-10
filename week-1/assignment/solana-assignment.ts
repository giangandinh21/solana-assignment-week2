import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

(async () => {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const from = Keypair.generate();
  const airdropSig = await connection.requestAirdrop(from.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSig);
  console.log("🪪 Source Wallet:", from.publicKey.toBase58());

  const newAccount = Keypair.generate();
  const rentExempt = await connection.getMinimumBalanceForRentExemption(0);

  const createIx = SystemProgram.createAccount({
    fromPubkey: from.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports: rentExempt + 0.1 * LAMPORTS_PER_SOL,
    space: 0,
    programId: SystemProgram.programId,
  });

  const recipient = new PublicKey('63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs');
  const transferIx = SystemProgram.transfer({
    fromPubkey: newAccount.publicKey,
    toPubkey: recipient,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  });

  const closeIx = SystemProgram.transfer({
    fromPubkey: newAccount.publicKey,
    toPubkey: from.publicKey,
    lamports: rentExempt,
  });

  const tx = new Transaction().add(createIx, transferIx, closeIx);
  const sig = await sendAndConfirmTransaction(connection, tx, [from, newAccount]);
  console.log('✅ Transaction Signature:', sig);
})();
