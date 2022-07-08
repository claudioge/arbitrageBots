export type Token = {
  address: string;
  symbol: string;
  decimals: number;
};

export let Tokens: { [name: string]: Token } = {
  DAI: {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    decimals: 18,
  },
  WETH: {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    symbol: "WETH",
    decimals: 18,
  },
  SAI: {
    address: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    symbol: "SAI",
    decimals: 18,
  },
  USDC: {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    decimals: 6,
  },
  WBTC: {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    decimals: 8,
  },
  WXRP: {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WXRP",
    decimals: 18,
  },
  ZRX: {
    address: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    symbol: "ZRX",
    decimals: 18,
  },
  AAVE: {
    address: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    symbol: "AAVE",
    decimals: 18,
  },
  USDT: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6,
  },
  FRAX: {
    address: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
    symbol: "FRAX",
    decimals: 18,
  },
  SUSHI: {
    address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
    symbol: "SUSHI",
    decimals: 18,
  },
  TOKE: {
    address: "0x2e9d63788249371f1DFC918a52f8d799F4a38C94",
    symbol: "TOKE",
    decimals: 18,
  },
  OHM: {
    address: "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5",
    symbol: "OHM",
    decimals: 9,
  },
  MATIC: {
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    symbol: "MATIC",
    decimals: 18,
  },
  GOVI: {
    address: "0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107",
    symbol: "GOVI",
    decimals: 18,
  },
  BWETH: {
    address: "0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea",
    symbol: "WETH",
    decimals: 18,
  },
  WBNB: {
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    symbol: "WBNB",
    decimals: 18,
  },
  BUSD: {
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    symbol: "BUSD",
    decimals: 18,
  },
  BUSDT: {
    address: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "BUSDT",
    decimals: 18,
  },
  BTWT: {
    address: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    symbol: "BTWT",
    decimals: 18,
  },
  BUSDC: {
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    symbol: "BUSDC",
    decimals: 18,
  },
  CAKE: {
    address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    symbol: "CAKE",
    decimals: 18,
  },
  RACA: {
    address: "0x12bb890508c125661e03b09ec06e404bc9289040",
    symbol: "RACA",
    decimals: 18,
  },
  BTCB: {
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    symbol: "BTCB",
    decimals: 18,
  },
  UST: {
    address: "0x3d4350cD54aeF9f9b2C29435e0fa809957B3F30a",
    symbol: "UST",
    decimals: 6,
  },
  BDAI: {
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    symbol: "DAI",
    decimals: 18,
  },
  AVAWETH: {
    address: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
    symbol: "WETH.e",
    decimals: 18,
  },
  WAVAX: {
    address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    symbol: "WAVA",
    decimals: 18,
  },
  AVAUSDC: {
    address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    symbol: "USDC",
    decimals: 6,
  },
  AVAUSDT: {
    address: "0xc7198437980c041c805a1edcba50c1ce5db95118",
    symbol: "USDT",
    decimals: 6,
  },
  AVAWBTC: {
    address: "0x50b7545627a5162f82a992c33b87adc75187b218",
    symbol: "WBTC",
    decimals: 8,
  },
  SAVAX: {
    address: "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be",
    symbol: "sAVAX",
    decimals: 18,
  },
};
