import { logCLIcycle } from "./LogCLIcycle";
import { ethers } from "ethers";
import { fetchTrade, fillPairContracts, estimateCyclicSCGas, executeCyclicSwap } from "./Fetch";
import { Tokens, Token } from "../Tokens";
import { findRoutes } from "./RouteFinder";

//Get all important addresses necessary for making requests to DEX contracts
const exchanges = require("../Exchanges.json");
//Get Wallet and Private Key  
const secrets = require("../Secrets.json");
//Logging library
const jsonfile = require("jsonfile");

//Provider has to be included in Secrets.json
const provider = new ethers.providers.JsonRpcProvider(secrets.BscProvider);
//Initialize routes to empty 2D array
let routesBNB: Token[][];
//Address of deployed cyclicSwap.sol smart contract on BSC
const scAdress = secrets.BnbCyclicSc;
//How much profit to execute arbitrage trade in %
const PROFITTHRESHOLD = 0.1;
//Trade size for bot, in BNB 
const TRADE_AMOUNT = "2"
//Output file for logs
const output = "output/output.json";

let gasPrice: ethers.BigNumber;

//Finds all Routes of size 3 in DEX for Cyclic Arb. Is executed before main programm loop.
const init = async () => {
  routesBNB = await findRoutes(provider);
  try {
    for (let route of routesBNB) {
      let index = 0;
      while (index < route.length) {
        await fillPairContracts(
          exchanges.Pancake.Router,
          exchanges.Pancake.Factory,
          [route[index], route[index + 1]],
          provider
        );
        new Promise((r) => setTimeout(r, 1000));
        index++;
      }
      index = 0;
      while (index < route.length) {
        new Promise((r) => setTimeout(r, 1000));
        await fillPairContracts(exchanges.Pancake.Router, exchanges.Pancake.Factory, [...route].reverse(), provider);
        new Promise((r) => setTimeout(r, 1000));
        index++;
      }
    }
  } catch (error) {
    console.error(error);
  }
};


// Start of programm
init();

// Start of arb detection, is repeated every 20 seconds
const marketScanner = setInterval(async () => {
    gasPrice = await provider.getGasPrice();
    await scanMarkets();
}, 20000);

//Function that calls checkMarket for every route in routes list
const scanMarkets = async () => {
  try {
    for (let route of routesBNB) {
      await checkMarket(route, exchanges.Pancake, TRADE_AMOUNT);
      new Promise((r) => setTimeout(r, 5000));
    }
  } catch (error) {
    console.error(error);
  }
};

//Main arb detection function, checks for amounts return by swap
const checkMarket = async (route: Token[], ex: any, amount: string) => {
  let gasCost = 0;
  let amountIn = amount;
  gasCost = await estimateCyclicSCGas(ex.Router, scAdress, route, amount, gasPrice, provider);

  const trade = await fetchTrade(ex.Router, ex.Factory, route, amountIn, provider);

  const swap = {
    Ex: ex,
    Trades: route,
    amountIn: amountIn,
    hop1: trade[0][1],
    hop2: trade[0][2],
    amountOut: trade[0][3],
    Timestamp: Date.now(),
    Gas: gasCost,
  };

  checkOp(swap);
};

//Checks available opportunity when passed a swap object with all market information
const checkOp = (swap: any) => {
  let gasCost = swap.Gas;
  const amountIn = swap.amountIn;
  const amountOut = swap.amountOut;
  let Profit = ((amountOut - amountIn - gasCost) / amountIn) * 100;
  let ProfitBG = ((amountOut - amountIn) / amountIn) * 100;
  swap.Profit = Profit;
  swap.ProfitBG = ProfitBG;
  const addressRoute = swap.Trades.map((x: Token) => x.address);

  //When profit of arb trade higher than defined threshold execute trade
  if (Profit > PROFITTHRESHOLD) {
    console.log("-------------Opportunity Found!!----------------");
    console.log("Trying to execute arbitrage...");
    executeCyclicSwap(
      addressRoute,
      swap.Ex.Router,
      String(ethers.utils.parseUnits(amountIn, swap.Swap1.from.decimals)),
      scAdress,
      provider
    );
  }

  //function soley used for CLI output
  logCLIcycle(swap);
  //writes logs of all checked trades to defined output file
  jsonfile.writeFile(output, swap, { flag: "a" }, function (err: any) {
    if (err) console.error(err);
  });
  console.log("--");
};



