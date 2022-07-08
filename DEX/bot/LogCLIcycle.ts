type swap = {
  Ex: {
    Factory: string;
    Router: string;
    Name: string;
    LpFee: number;
  };
  Trades: [
    {
      address: string;
      symbol: string;
      decimals: number;
    },
    {
      address: string;
      symbol: string;
      decimals: number;
    },
    {
      address: string;
      symbol: string;
      decimals: number;
    },
    {
      address: string;
      symbol: string;
      decimals: number;
    }
  ];

  amountIn: string;
  hop1: string;
  hop2: string;
  amountOut: string;
  Timestamp: number;
  Gas: number;
  Profit: number;
  ProfitBG: number;
};

export const logCLIcycle = (swap: swap) => {
  for (let trade of swap.Trades) {
    console.log(trade.symbol, "->");
  }

  console.log(swap.amountIn, "------->", swap.amountOut);

  console.log("Gas", swap.Gas, "--> Profit = ", swap.Profit, "%");
};
