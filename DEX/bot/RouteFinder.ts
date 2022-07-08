import { Tokens, Token } from "../Tokens";
import { BigNumber, FixedNumber, ContractInterface, ethers } from "ethers";
const secrets = require("../Secrets.json");
const exchanges = require("../Exchanges.json");

const exFactory = exchanges.Pancake.Factory;
const baseToken = Tokens.WBNB;
const HOPS = 3;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const fetchPairContracts = async (route: Token[], provider: any) => {
  const factoryContract = new ethers.Contract(
    exFactory,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    provider
  );
  return await factoryContract.getPair(route[0].address, route[1].address);
};

export const findRoutes = async (provider: any) => {
  const bscTokens: Token[] = [
    Tokens.WBNB,
    Tokens.BUSD,
    Tokens.BUSDC,
    Tokens.CAKE,
    Tokens.RACA,
    Tokens.BTCB,
    Tokens.BUSDT,
  ];

  let graph: { [token: string]: Token[] } = {};
  let routes: Token[][] = [];
  let token1: Token;
  let token2: Token;

  for (token1 of bscTokens) {
    graph[token1.symbol] = [];
    for (token2 of bscTokens) {
      if (token1 == token2) {
      } else {
        try {
          if ((await fetchPairContracts([token1, token2], provider)) != NULL_ADDRESS) {
            graph[token1.symbol].push(token2);
          }
        } catch (e) {}
      }
    }
  }

  graph[baseToken.symbol].forEach((connection) => {
    let route = [baseToken, connection];
    graph[connection.symbol].forEach((connection2) => {
      if (graph[connection2.symbol].includes(baseToken)) {
        route.push(connection2);
        route.push(baseToken);
        const routeToAdd = [...route];
        routes.push(routeToAdd);
        route.pop();
        route.pop();
      }
    });
    route.pop();
  });
  console.log(routes.length, "Routes have been found");
  return routes;
};
