pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";


interface IERC20{
    function totalSupply() external view returns(uint);
    function balanceOf(address account) external view returns(uint);
    function transfer(address recipient, uint amount) external returns(bool);
    function allowance(address owner, address spender) external view returns(uint);
    function approve(address spender, uint amount) external returns(bool);
    function transferFrom(address sender, address recipient, uint amount) external returns(bool);
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

interface IUniswapV2Router{
    function getAmountsOut(uint256 amountIn,address[] memory path) external view returns(uint256[] memory amounts);
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns(uint256[] memory amounts);
}


contract cyclicSwap is Ownable{

    function swapNormal(address[] memory path, address router, uint256 _amountIn) external onlyOwner{
        swap(router,path,_amountIn);
    }

    function swapSave(address[] memory path, address router, uint256 _amountIn) external onlyOwner{
        address _tokenIn = path[0];
        uint balanceBeforeTrades = IERC20(_tokenIn).balanceOf(address(this));
        swap(router,path,_amountIn);
        uint balanceAfterTrades = IERC20(_tokenIn).balanceOf(address(this));
        require(balanceAfterTrades>balanceBeforeTrades ,"Didn't make any profit, reverting..");
    }

    function swap(address router, address[] memory path, uint256 _amount) private {
        IERC20(path[0]).approve(router,_amount);
        uint deadline = block.timestamp + 300;
        IUniswapV2Router(router).swapExactTokensForTokens(_amount, 1,path,address(this),deadline);
    }

    function afterApprove(address token,address router, uint256 amount) external onlyOwner{
        IERC20(token).approve(router,amount);
    }

    function getTokenBalance(address _tokenContractAddress) external view returns(uint256){
        uint balance = IERC20(_tokenContractAddress).balanceOf(address(this));
        return balance;
    }

    function getNativeBalance() external view returns(uint256){
        uint balance = address(this).balance;
        return balance;
    }

    function recoverTokenBalance(address tokenAddress) external onlyOwner{
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender,token.balanceOf(address(this)));
    }

    fallback () external payable{}

    receive() external payable{}
}