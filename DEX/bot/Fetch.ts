import { BigNumber, FixedNumber, ContractInterface, ethers } from "ethers";
import { Token } from "../Tokens";

const secrets = require("../Secrets.json");

//This Fetch works for all forks of UNISWAP V2

//Initialization of pair contract dictionary used for fetching DEX data
let paircontracts: { [key: string]: string } = {};

//Fills paircontract dictionary if pool available on give DEX between given Tokens
export const fillPairContracts = async (
  exRouter: string,
  exFactory: string,
  route: Token[],
  provider: any
) => {
  const factoryContract = new ethers.Contract(
    exFactory,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    provider
  );

  const key: string = `${exRouter + route[0].address + route[1].address}`;

  paircontracts[key] = await factoryContract.getPair(route[0].address, route[1].address);
};

//Estimates transaction cost when executing given spatial trade
export const estimateSpatialSCGas = async (
  ex1: string,
  ex2: string,
  sc: string,
  route: Token[],
  amount: string,
  gasPrice: ethers.BigNumber,
  provider: any
) => {
  const addressRoute = route.map((x) => x.address);
  const decimals0 = route[0].decimals;
  const amountIn = String(ethers.utils.parseUnits(amount, decimals0));
  const wallet = new ethers.Wallet(secrets.PrivateKey);
  const from = wallet.address;
  const params = [addressRoute[0], addressRoute[1], ex1, ex2, amountIn];
  const contract = new ethers.Contract(
    sc,
    [
      "function swapNormal(address _tokenIn, address _tokenOut, address ex1, address ex2, uint256 _amountIn) external",
    ],
    provider
  );
  const method = contract.estimateGas["swapNormal"];
  if (!method) {
    throw new Error(`Method swapNormal not found`);
  }
  const gasLimit = await method(...params, {
    from,
  });
  return Number(gasLimit) * Number(ethers.utils.formatUnits(gasPrice, "18"));
};

//Estimates transaction cost when executing given cyclic trade
export const estimateCyclicSCGas = async (
  ex: string,
  sc: string,
  route: Token[],
  amount: string,
  gasPrice: ethers.BigNumber,
  provider: any
) => {
  const decimals0 = route[0].decimals;
  const amountIn = String(ethers.utils.parseUnits(amount, decimals0));
  const addressRoute = route.map((x) => x.address);
  const wallet = new ethers.Wallet(secrets.PrivateKey);
  const params = [addressRoute, ex, amountIn];
  const from = wallet.address;
  const contract = new ethers.Contract(
    sc,
    ["function swapNormal(address[] memory path, address router, uint256 _amountIn) external"],
    provider
  );
  const method = contract.estimateGas["swapNormal"];
  if (!method) {
    throw new Error(`Method swapNormal not found`);
  }

  const gasLimit = await method(...params, {
    from,
  });

  return Number(gasLimit) * Number(ethers.utils.formatUnits(gasPrice, "18"));
};

//Executes cyclic swap by calling swapSave on cyclicSwap.sol
export const executeCyclicSwap = async (
  route: string[],
  ex: string,
  amount: string,
  sc: string,
  provider: any
) => {
  const wallet = new ethers.Wallet(secrets.PrivateKey);
  const signer = wallet.connect(provider);
  const cyclicSwapContract = new ethers.Contract(
    sc,
    ["function swapSave(address[] memory path, address router, uint256 _amountIn)"],
    signer
  );
  try {
    await cyclicSwapContract.swapSave(route, ex, amount, {
      gasLimit: 500000,
    });
  } catch (e) {
    console.log(e);
    console.log("Swap Execution Failed, due to error or no profit made...");
  }
};

//Executes spatial swap by calling swapSave on spatialSwap.sol
export const executeSpatialSwap = async (
  token1: string,
  token2: string,
  ex1: string,
  ex2: string,
  amount: string,
  sc: string,
  provider: any
) => {
  const wallet = new ethers.Wallet(secrets.PrivateKey);
  const signer = wallet.connect(provider);
  const spatialSwapContract = new ethers.Contract(
    sc,
    [
      "function swapSave(address _tokenIn, address _tokenOut, address ex1, address ex2, uint256 _amountIn)",
    ],
    signer
  );
  try {
    await spatialSwapContract.swapSave(token1, token2, ex1, ex2, amount, {
      gasLimit: 500000,
    });
  } catch (e) {
    console.log(e);
    console.log("Swap Execution Failed, due to error or no profit made...");
  }
};

//Gets estimated amount out from router contract on DEX
export const fetchTrade = async (
  exRouter: string,
  exFactory: string,
  route: Token[],
  amount: string,
  provider: any
) => {
  const router = exRouter;
  const wallet = new ethers.Wallet(secrets.PrivateKey);
  const signer = wallet.connect(provider);
  const decimals0 = route[0].decimals;
  const decimals1 = route[route.length - 1].decimals;
  const addressRoute = route.map((x) => x.address);

  const routerContract = new ethers.Contract(
    router,
    [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    ],
    signer
  );

  const pairContract = new ethers.Contract(
    paircontracts[router + route[0].address + route[1].address],
    [
      "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
      "function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    ],
    provider
  );

  const amountIn = ethers.utils.parseUnits(amount, decimals0);
  const pairData = await pairContract.getReserves();
  let token0Reserve = ethers.utils.formatUnits(pairData[0], decimals0);
  let token1Reserve = ethers.utils.formatUnits(pairData[1], decimals1);
  if (Number(token0Reserve) < 1 || Number(token1Reserve) < 1) {
    token0Reserve = ethers.utils.formatUnits(pairData[0], decimals1);
    token1Reserve = ethers.utils.formatUnits(pairData[1], decimals0);
  }
  let amounts = [];
  let hopps = route.length - 1;
  amounts = await routerContract.getAmountsOut(amountIn, addressRoute);
  const amountOut = amounts.map((s: any) =>
    Number(ethers.utils.formatUnits(s, decimals1)).toString()
  );

  return [amountOut, token0Reserve, token1Reserve];
};
