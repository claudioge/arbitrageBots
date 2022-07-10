pragma solidity ^0.8.4;

//ERC20 interface is needed to use token functions
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//The UniswapV2Router interface is used by many exchanges. It is necessary to interact with basic functionalilties of the DEX.
interface IUniswapV2Router{
    function getAmountsOut(uint256 amountIn,address[] memory path) external view returns(uint256[] memory amounts);
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns(uint256[] memory amounts);
}

// The spatial swap contract definition, it is a ownable contract so functions can be annotated with onlyOwner and only executed by the address that deployed the contract.
contract spatialSwap is Ownable{

    //Performs a normal swap on two given exchanges between two given tokens. Only used for estimating gas fees, never use this function to execute arbitrage trades.
     function swapNormal(address _tokenIn, address _tokenOut, address ex1, address ex2, uint256 _amountIn) external onlyOwner{
        uint256 balance2BeforeTransfer = IERC20(_tokenOut).balanceOf(address(this));


        swap(ex1,_tokenIn,_tokenOut,_amountIn);

        uint256 tradableAmount = IERC20(_tokenOut).balanceOf(address(this)) - balance2BeforeTransfer;

        swap(ex2,_tokenOut,_tokenIn,tradableAmount);
    }

    //Performs swaps on two given exchanges between two given tokens and finally checks if portfolio increased, if not the require statement makes sure all operations are undone.
    function swapSave(address _tokenIn, address _tokenOut, address ex1, address ex2, uint256 _amountIn) external onlyOwner{
        
        uint256 balance1BeforeTransfer = IERC20(_tokenIn).balanceOf(address(this));
        uint256 balance2BeforeTransfer = IERC20(_tokenOut).balanceOf(address(this));


        swap(ex1,_tokenIn,_tokenOut,_amountIn);

        uint256 tradableAmount = IERC20(_tokenOut).balanceOf(address(this)) - balance2BeforeTransfer;

        swap(ex2,_tokenOut,_tokenIn,tradableAmount);
        uint endBalance = IERC20(_tokenIn).balanceOf(address(this));

        require(endBalance>balance1BeforeTransfer,"No Profit Made, Reverting Trade");
    }

    //Private swap function that encapsulates the swap call to the smart contract of the DEX
    function swap(address router, address _tokenIn, address _tokenOut, uint256 _amount) private{
        IERC20(_tokenIn).approve(router, _amount);
		address[] memory path;
		path = new address[](2);
		path[0] = _tokenIn;
		path[1] = _tokenOut;
		uint deadline = block.timestamp + 300;
		IUniswapV2Router(router).swapExactTokensForTokens(_amount, 1, path, address(this), deadline);
    }

    //Returns the current balance of given token
    function getBalance(address _tokenContractAddress) external view returns(uint256){
        uint balance = IERC20(_tokenContractAddress).balanceOf(address(this));
        return balance;
    }

    //If there is a problem with token approvals on certain exchanges, with this function an exchange can be given permission to swap the tokens specified.
    function afterApprove(address token,address router, uint256 amount) external onlyOwner{
        IERC20(token).approve(router,amount);
    }

    //Function to recover assets from smart contract, specify the token to withdraw
    function recoverBalance(address tokenAddress) external onlyOwner{
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender,token.balanceOf(address(this)));
    }

    //Makes sure the smart contract can recieve tokens
    fallback () external payable{}

    receive() external payable{}
}