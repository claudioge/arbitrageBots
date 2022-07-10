pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
//ERC20 interface is needed to use token functions
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//The UniswapV2Router interface is used by many exchanges. It is necessary to interact with basic functionalilties of the DEX.
interface IUniswapV2Router{
    function getAmountsOut(uint256 amountIn,address[] memory path) external view returns(uint256[] memory amounts);
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns(uint256[] memory amounts);
}

// The cyclic swap contract definition, it is a ownable contract so functions can be annotated with onlyOwner and only executed by the address that deployed the contract.
contract cyclicSwap is Ownable{

    //Performs a normal swap though a given path. Only used for estimating gas fees, never use this function to execute arbitrage trades.
    function swapNormal(address[] memory path, address router, uint256 _amountIn) external onlyOwner{
        swap(router,path,_amountIn);
    }

    //Performs swaps and finally checks if portfolio increased, if not the require statement makes sure all operations are undone.
    function swapSave(address[] memory path, address router, uint256 _amountIn) external onlyOwner{
        address _tokenIn = path[0];
        uint balanceBeforeTrades = IERC20(_tokenIn).balanceOf(address(this));
        swap(router,path,_amountIn);
        uint balanceAfterTrades = IERC20(_tokenIn).balanceOf(address(this));
        require(balanceAfterTrades>balanceBeforeTrades ,"Didn't make any profit, reverting..");
    }

    //Private swap function that encapsulates the swap call to the smart contract of the DEX
    function swap(address router, address[] memory path, uint256 _amount) private {
        IERC20(path[0]).approve(router,_amount);
        uint deadline = block.timestamp + 300;
        IUniswapV2Router(router).swapExactTokensForTokens(_amount, 1,path,address(this),deadline);
    }

    //If there is a problem with token approvals on certain exchanges, with this function an exchange can be given permission to swap the tokens specified.
    function afterApprove(address token,address router, uint256 amount) external onlyOwner{
        IERC20(token).approve(router,amount);
    }

    //Returns the current balance of given token
    function getTokenBalance(address _tokenContractAddress) external view returns(uint256){
        uint balance = IERC20(_tokenContractAddress).balanceOf(address(this));
        return balance;
    }

    //Return the current balance of the native balance
    function getNativeBalance() external view returns(uint256){
        uint balance = address(this).balance;
        return balance;
    }

    //Function to recover assets from smart contract, specify the token to withdraw
    function recoverTokenBalance(address tokenAddress) external onlyOwner{
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender,token.balanceOf(address(this)));
    }

    //Makes sure the smart contract can recieve tokens
    fallback () external payable{}

    receive() external payable{}
}