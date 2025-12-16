const { ethers } = require('ethers');

async function main() {
  const target = (process.argv[2] || '').trim();
  if (!target) {
    console.error('Usage: node scripts/mint_usdc_to_amoy.cjs <address>');
    process.exit(1);
  }

  const pkRaw = process.env.PRIVATE_KEY || '';
  if (!pkRaw) {
    console.error('Missing PRIVATE_KEY in env');
    process.exit(1);
  }
  const pk = pkRaw.startsWith('0x') ? pkRaw : '0x' + pkRaw;

  const rpc = process.env.AMOY_RPC_URL;
  if (!rpc) {
    console.error('Missing AMOY_RPC_URL in env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);

  const usdc =
    process.env.USDC_ADDRESS_AMOY ||
    process.env.NEXT_PUBLIC_USDC_ADDRESS_AMOY;
  if (!usdc) {
    console.error('Missing USDC_ADDRESS_AMOY or NEXT_PUBLIC_USDC_ADDRESS_AMOY in env');
    process.exit(1);
  }

  const erc20 = new ethers.Contract(
    usdc,
    [
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function transfer(address,uint256) external returns (bool)',
      'function mint(address,uint256) external',
    ],
    wallet
  );

  console.log('Sender:', wallet.address);
  console.log('Token :', usdc);
  console.log('Target:', target);

  const decimals = await erc20.decimals();
  const amount = ethers.parseUnits('1000', decimals);
  console.log('Amount (raw):', amount.toString());

  try {
    console.log('Trying mint(...) to target...');
    const txMint = await erc20.mint(target, amount);
    console.log('Mint tx sent:', txMint.hash);
    await txMint.wait();
    console.log('Mint success');
    const bal = await erc20.balanceOf(target);
    console.log('Target balance after mint:', bal.toString());
    return;
  } catch (e) {
    console.log('Mint failed, fallback to transfer:', e.message || String(e));
  }

  const senderBal = await erc20.balanceOf(wallet.address);
  console.log('Sender balance:', senderBal.toString());
  if (senderBal < amount) {
    console.error('Insufficient balance to transfer to target');
    process.exit(1);
  }

  console.log('Transferring to target...');
  const tx = await erc20.transfer(target, amount);
  console.log('Transfer tx sent:', tx.hash);
  await tx.wait();
  const balAfter = await erc20.balanceOf(target);
  console.log('Target balance after transfer:', balAfter.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

