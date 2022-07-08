export type swap = {
  Ex1: {
    Factory: string;
    Router: string;
    Name: string;
    LpFee: number;
  };
  Ex2: {
    Factory: string;
    Router: string;
    Name: string;
    LpFee: number;
  };
  Swap1: {
    from: {
      address: string;
      symbol: string;
      decimals: number;
    };
    to: {
      address: string;
      symbol: string;
      decimals: number;
    };
    amountIn: string;
    amountOut: string;
    pool: {
      token1amount: string;
      token2amount: string;
    };
  };
  Swap2: {
    from: {
      address: string;
      symbol: string;
      decimals: number;
    };
    to: {
      address: string;
      symbol: string;
      decimals: number;
    };
    amountIn: string;
    amountOut: string;
    pool: {
      token1amount: string;
      token2amount: string;
    };
  };
  Timestamp: number;
  Gas: number;
  Profit: number;
  ProfitBG: number;
};

export const logCLIStart = () =>{
  console.log('                                                   ARBITRAGE OPPORTUNITIES                                           ')
  console.log('---------------------------------------------------------------------------------------------------------------------')
  console.log(' Profit   ||Currency Pair||                       Trade 1               ||                    Trade2')
  console.log('---------------------------------------------------------------------------------------------------------------------')
}

export const logCLI = (swap: swap) => {
  console.log("",
    swap.Profit.toFixed(3),
    "%  ||",
    swap.Swap1.from.symbol,
    "/",swap.Swap1.to.symbol,
    "||  ",
    Number(swap.Swap1.amountIn),
    swap.Swap1.from.symbol,
    "/",
    Number(swap.Swap1.amountOut).toFixed(6),
    swap.Swap1.to.symbol,
    "on",
    swap.Ex1.Name,
    " || ",
    Number(swap.Swap2.amountIn),
    swap.Swap2.from.symbol,
    "/",
    Number(swap.Swap2.amountOut).toFixed(6),
    swap.Swap2.to.symbol,
    "on",
    swap.Ex2.Name
  );
};
