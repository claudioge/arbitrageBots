# arbitrageBots
A respository that implements several arbitrage bots for CeFi and DeFi

Installation Guidelines
Prerequisites
1. The necessary libraries and tools to build and run this project:
• Node v14
• npm
• Python 3.10
• pip

## Spatial CEX Bot
NOTICE: Assets on the CEXes are necessary to execute arbitrage trades.
1. Add API Keys and Secrets to .env file
2. Enter the following commands into the terminal:
• pip install json
• pip install time
• pip install dotenv
• pip install os
• pip install ccxt
• pip install datetime
• python Start.py

## DEX Bot
1. The smart contract for the arbitrage bot has to be deployed:
• Connect Wallet to the Metamask extension for the browser.
• Choose Network to check for arbitrage opportunities (ETH, BSC, AVA are
available for the bot).
• Go to ”remix.ethereum.org” and connect Metamask wallet.
• Choose ”Load a local file into current workspace” and chose contract for desired
arbitrage strategy. SpatialArb.sol for spatial arbitrage bot or CyclicArb.sol for
cyclic arbitrage bot (available only on BSC).
• Open the file on remix, then go to the compile tab (Figure 2) and compile the
smart contract.
• Go to the deploy tab, make sure the Environment is set to Injected Web3 and
choose the right contract to deploy. Then deploy smart contract.
Figure A.1: Interfact to deploy smart contract taken from remix.ethereum.org
• Use Metamask to send base asset (WETH on ETH, WBNB on BSC, WAVA
on AVA) to the address of the deployed smart contract visible on Figure 4.
• Assets can be withdrawn by calling the function through remix. The token
address of the token to be withdrawn has to be given as input to this function.
2. The Secretes.json file has to be filled with the following information:
• Private key of wallet
• Address of wallet
• API link of provider depending on network
A.2. DEX BOT 67
• Address of deployed smart contract
3. Enter the following commands into the terminal:
• npm i
• npx ts-node SpatialArbETH.ts or SpatialArbBSC.ts or CyclicArb.ts
