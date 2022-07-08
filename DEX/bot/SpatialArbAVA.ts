import { logCLI } from "./LogCLI";
import { ethers } from "ethers";
import { fetchTrade, fillPairContracts, estimateSpatialSCGas, executeSpatialSwap } from "./Fetch";
import { Tokens, Token } from "../Tokens";

//Get all important addresses necessary for making requests to DEX contracts, and provider API links
const exchanges = require("./Exchanges.json");
//Get Wallet and Private Key  
const secrets = require("../Secrets.json");
//Logging library
const jsonfile = require("jsonfile");

//Provider for AVA has to be included in Secrets.json
const avaProvider = new ethers.providers.JsonRpcProvider(secrets.AvaProvider);
const scAdress = secrets.AvaSpatialSc;
const PROFITTHRESHOLD = 0.15;
const provider = avaProvider;
const output = "../output/output.json";
let gasPrice: ethers.BigNumber;

//All token pairs that should be checked for arbitrage opportunities
const routesAVA = [
  [Tokens.WAVAX, Tokens.AVAWETH],
  [Tokens.WAVAX, Tokens.AVAUSDC],
  [Tokens.WAVAX, Tokens.AVAWBTC],
  [Tokens.WAVAX, Tokens.SAVAX],
  [Tokens.WAVAX, Tokens.AVAUSDT],
];

//Fills a dictionary with all necessary pair contract addresses
const init = async () => {
  try {
    for (let pair of routesAVA) {
      await fillPairContracts(exchanges.TraderJoe.Router, exchanges.TraderJoe.Factory, pair, provider);
      await new Promise((r) => setTimeout(r, 1000));
      await fillPairContracts(exchanges.TraderJoe.Router, exchanges.TraderJoe.Factory, [...pair].reverse(), provider);
      await new Promise((r) => setTimeout(r, 1000));

      await fillPairContracts(exchanges.Pangolin.Router, exchanges.Pangolin.Factory, pair, provider);
      new Promise((r) => setTimeout(r, 1000));
      await fillPairContracts(exchanges.Pangolin.Router, exchanges.Pangolin.Factory, [...pair].reverse(), provider);
      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch (error) {
    console.error(error);
  }
};

//start of programm
init();

//start of arbitrage detection, repeats main arb detection call every 50 seconds
const SpatialArbAVA = setInterval(async () => {
  try {
    gasPrice = await provider.getGasPrice();
    await checkPairs();
  } catch (e) {
    new Promise((r) => setTimeout(r, 20000));
    await checkPairs();
  }
}, 50000);

//Calls check Market for every pair in both directions exchangeA->exchangeB->exchangeA and exchangeB->exchangeA->exchangeB
const checkPairs = async () => {
  try {
    for (let pair of routesAVA) {
      await checkMarket(pair, exchanges.TraderJoe, exchanges.Pangolin, "16");
      new Promise((r) => setTimeout(r, 5000));
      await checkMarket(pair, exchanges.Pangolin, exchanges.TraderJoe, "16");
      new Promise((r) => setTimeout(r, 5000));
    }
  } catch (error) {
    console.error(error);
  }
};

//Checks amount returned for possible trades, estimates return after fees
const checkMarket = async (route: Token[], ex1: any, ex2: any, amount: string) => {
  const gasCost = await estimateSpatialSCGas(ex1.Router, ex2.Router, scAdress, route, amount, gasPrice, provider);

  const trade0 = await fetchTrade(ex1.Router, ex1.Factory, route, amount, provider);

  const minAmountOut0 = trade0[0][1];
  const trade0token0amount = trade0[1];
  const trade0token1amount = trade0[2];

  const revRoute = [...route].reverse();

  const trade1 = await fetchTrade(ex2.Router, ex2.Factory, revRoute, String(minAmountOut0), provider);
  const minAmountOut1 = trade1[0][1];
  const trade1token0amount = trade1[1];
  const trade1token1amount = trade1[2];

  const swap = {
    Ex1: ex1,
    Ex2: ex2,
    Swap1: {
      from: route[0],
      to: route[route.length - 1],
      amountIn: amount,
      amountOut: minAmountOut0,
      pool: {
        token1amount: trade0token0amount,
        token2amount: trade0token1amount,
      },
    },
    Swap2: {
      from: revRoute[0],
      to: revRoute[revRoute.length - 1],
      amountIn: minAmountOut0,
      amountOut: minAmountOut1,
      pool: {
        token1amount: trade1token0amount,
        token2amount: trade1token1amount,
      },
    },
    Timestamp: Date.now(),
    Gas: gasCost,
  };

  checkOp(swap);
};

//Checks if current trade is profitable or not, if yes calls execute trades function
const checkOp = (swap: any) => {
  let gasCost = swap.Gas;
  const amountIn = swap.Swap1.amountIn;
  const amountOut = swap.Swap2.amountOut;
  let Profit = ((amountOut - amountIn - gasCost) / amountIn) * 100;
  let ProfitBG = ((amountOut - amountIn) / amountIn) * 100;
  swap.Profit = Profit;
  swap.ProfitBG = ProfitBG;

  if (Profit > PROFITTHRESHOLD) {
    console.log("--------------Opportunity Found!!----------------");
    console.log("Trying to execute arbitrage...");
    executeSpatialSwap(
      swap.Swap1.from.address,
      swap.Swap1.to.address,
      swap.Ex1.Router,
      swap.Ex2.Router,
      String(ethers.utils.parseUnits(amountIn, swap.Swap1.from.decimals)),
      scAdress,
      provider
    );
  }

  logCLI(swap);
  jsonfile.writeFile(output, swap, { flag: "a" }, function (err: any) {
    if (err) console.error(err);
  });

  console.log("--");
};
