pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



interface IUniswapV2Router{
    function getAmountsOut(uint256 amountIn,address[] memory path) external view returns(uint256[] memory amounts);
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns(uint256[] memory amounts);
}

contract spatialSwap is Ownable{

     function swapNormal(address _tokenIn, address _tokenOut, address ex1, address ex2, uint256 _amountIn) external onlyOwner{
        uint256 balance2BeforeTransfer = IERC20(_tokenOut).balanceOf(address(this));


        swap(ex1,_tokenIn,_tokenOut,_amountIn);

        uint256 tradableAmount = IERC20(_tokenOut).balanceOf(address(this)) - balance2BeforeTransfer;

        swap(ex2,_tokenOut,_tokenIn,tradableAmount);
    }

    function swapSave(address _tokenIn, address _tokenOut, address ex1, address ex2, uint256 _amountIn) external onlyOwner{
        
        uint256 balance1BeforeTransfer = IERC20(_tokenIn).balanceOf(address(this));
        uint256 balance2BeforeTransfer = IERC20(_tokenOut).balanceOf(address(this));


        swap(ex1,_tokenIn,_tokenOut,_amountIn);

        uint256 tradableAmount = IERC20(_tokenOut).balanceOf(address(this)) - balance2BeforeTransfer;

        swap(ex2,_tokenOut,_tokenIn,tradableAmount);
        uint endBalance = IERC20(_tokenIn).balanceOf(address(this));

        require(endBalance>balance1BeforeTransfer,"No Profit Made, Reverting Trade");
    }

    function swap(address router, address _tokenIn, address _tokenOut, uint256 _amount) private{
        IERC20(_tokenIn).approve(router, _amount);
		address[] memory path;
		path = new address[](2);
		path[0] = _tokenIn;
		path[1] = _tokenOut;
		uint deadline = block.timestamp + 300;
		IUniswapV2Router(router).swapExactTokensForTokens(_amount, 1, path, address(this), deadline);
    }

    function getBalance(address _tokenContractAddress) external view returns(uint256){
        uint balance = IERC20(_tokenContractAddress).balanceOf(address(this));
        return balance;
    }

    function afterApprove(address token,address router, uint256 amount) external onlyOwner{
        IERC20(token).approve(router,amount);
    }

    function recoverBalance(address tokenAddress) external onlyOwner{
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender,token.balanceOf(address(this)));
    }

    fallback () external payable{}

    receive() external payable{}
}