import { useNetwork, useAccount, erc20ABI, useProvider, useSigner } from 'wagmi';
import { useEffect, useState } from 'react';
import { useAlert, positions } from 'react-alert';
import qs from 'qs';
import { ethers, utils } from "ethers";
import zerocoreabi from "../abis/zerocoreabi.json";

function Swap() {

    const alert = useAlert()

    const { chain, chains } = useNetwork();
    const { isConnected, address } = useAccount();
    const [toChain, setToChain] = useState("Select");
    const [toChainId, setToChainId] = useState(0);
    const [toChainSelect, toggleToChainSelect] = useState(false);
    const [swapTo, setSwapTo] = useState(0);
    const [swapFrom, setSwapFrom] = useState(0);
    const [toPayLoading, toggleToPayLoading] = useState(false);
    const [tokenFrom, setTokenFrom] = useState({
        token: "Select"
    });
    const [tokenTo, setTokenTo] = useState({
        token: "-"
    });
    const [showFromTokenList, setShowFromTokenList] = useState(false);
    const [showToTokenList, setShowToTokenList] = useState(false);
    const [protocolFee, setProtocolFee] = useState(0);
    const [gasFee, setGasFee] = useState(0);
    const [priceImpact, setPriceImpact] = useState(0);
    const { data: signer } = useSigner()

    const chainObj = {
        5: {
            chainId: 5,
            chianName: "Goerli",
            explorer: "https://goerli.etherscan.io/tx/",
            rpc: "https://goerli.infura.io/v3/",
            zeroX: "https://goerli.api.0x.org/",
            receiverContract: "0x4D4aA79d221a14D97445220299c20CFcaB678Fad",
            hashiPoolContract: "0xD92Cc54C5A7125BDd6806c3f09f9E16EbEb8A1d1",
            domain: 10121,
            tokens: [
                {
                    token: "USDT",
                    address: "0x69c9e542c9234a535b25df10e5a0f8542670d44a",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x89a543c56f8fc6249186a608bf91d23310557382",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x0e3b53f09f0e9b3830f7f4a3abd4be7a70713a31",
                    decimals: 18
                }
            ]
        },
        80_001: {
            chainId: 80_001,
            chianName: "Mumbai",
            explorer: "https://mumbai.polygonscan.com/tx/",
            rpc: "https://matic-mumbai.chainstacklabs.com",
            zeroX: "https://mumbai.api.0x.org/",
            receiverContract: "0x802a3f3cedfdb0005c38e279c7e7a2c17d12e11f",
            hashiPoolContract: "0xe11d993c1bddf2d4b123b07939f98f91011b7937",
            domain: 10109,
            tokens: [
                {
                    token: "USDT",
                    address: "0x4810f2280054f527788908f8d646dc70649b1cd0",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x93c3f8f780ade43b98467177fade0d38ebd03787",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x52b5b8ff61cfae415b77c0f92cd78bbd19170da1",
                    decimals: 18
                }
            ]
        },
        1_287: {
            chainId: 1_287,
            chianName: "Moonbase Alpha",
            explorer: "https://moonbase-blockscout.testnet.moonbeam.network/tx/",
            rpc: "https://rpc.api.moonbase.moonbeam.network",
            zeroX: "https://mumbai.api.0x.org/",
            receiverContract: "0xe7cc7695cc84fedee86a4414f171adff29a419b3",
            hashiPoolContract: "0xbc05da27f250d451eebb97de330a231e0ff83cbc",
            domain: 10126,
            tokens: [
                {
                    token: "USDT",
                    address: "0xc33e07ccefec0fb1dc023bf830d019094ce7a2e2",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x99f3f14095fd96060c8cb24d3f307c1b07480fb4",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x060f1356ac55f5f03ead596c6776bffd9c936b32",
                    decimals: 18
                }
            ]
        },
        1_442: {
            chainId: 1_442,
            chianName: "Polygon ZKevm",
            explorer: "https://testnet-zkevm.polygonscan.com/tx/",
            rpc: "https://rpc.public.zkevm-test.net",
            zeroX: "https://mumbai.api.0x.org/",
            receiverContract: "0x17e695ca08daba6f9b351008a2dd9d65cb8f679b",
            hashiPoolContract: "0xd4441ecbc073970c86a6c121c47f371d1d109cea",
            domain: 10158,
            tokens: [
                {
                    token: "USDT",
                    address: "0x955b4c00e2085e00dbfc78e7ffe2c588c570bbda",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x1367082758bcaaee041992d56b53cbadeb477079",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x77325bf80225b7fdc1d7adf3451db5a04a0973bb",
                    decimals: 18
                }
            ]
        }
    }

    console.log(chainObj[chain.id])

    useEffect(() => {
        
    },[chain?.id])  

    const sendTransaction = async () => {
        if(swapFrom > 0 && swapTo > 0 && toChainId > 0) {
            console.log(toChainId);
            const tokenTodd = {}
            chainObj[toChainId].tokens.filter(token => token.token === tokenTo.token).map(tokenObj => Object.assign(tokenTodd,tokenObj));
            console.log(tokenTodd);
            setTokenTo(tokenTodd);
            
            const contract = new ethers.Contract(tokenFrom.address, erc20ABI, signer);
            const allowed = await contract.allowance(address, chainObj[chain.id].receiverContract);
            let  amount = String(swapFrom * 10 ** tokenFrom.decimals);
            let txn;
            if(parseInt(allowed.toString(),18) < parseInt(amount,18)) {
                try {
                    txn = await contract.approve(chainObj[chain.id].receiverContract, amount);
                    alert.success(
                        <div>
                            <div>Transaction Sent</div>
                            <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 0,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(ex) {
                    console.log(ex);
                    alert.error(<div>Operation failed</div>, {
                        timeout: 3000,
                        position: positions.TOP_RIGHT
                    });
                }
            } else {
                const hashiPoolContract = new ethers.Contract(chainObj[chain.id].receiverContract, zerocoreabi, signer);
                try{
                    txn = await hashiPoolContract.initiateBridge(chainObj[toChainId].domain, chainObj[toChainId].receiverContract, tokenTodd.address, tokenFrom.address, amount, { value: ethers.utils.parseUnits("200000000", "gwei") });
                    console.log(txn);
                    alert.success(
                        <div>
                            <div>Transaction Sent</div>
                            <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 0,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(ex) {
                    console.log(ex);
                    alert.error(<div>Operation failed</div>, {
                        timeout: 3000,
                        position: positions.TOP_RIGHT
                    });
                }
            }
        } else {
            alert.error(<div>Invalid input</div>, {
                timeout: 3000,
                position: positions.TOP_RIGHT
            });
        }
    }

    const getPrice = async (targetValue) => {
        if(targetValue > 0) {
            toggleToPayLoading(true);
            console.log(targetValue);
            setSwapFrom(targetValue);
            setSwapTo(targetValue);
            toggleToPayLoading(false);
        }   
    }


    return (
        <div className="flex flex-1 items-center justify-center h-5/6">
        {
            isConnected && 
            <div className="flex flex-col justify-between rounded-lg font-semibold w-4/12 h-4/6 bg-white">
                <div className="text-2xl mx-4 mt-4">Bridge</div>
                <div className="rounded-lg border-2 border-rounded h-[130px] mx-6 p-2">
                    <div>
                        <div>From</div>
                        <div className="flex flex-row items-center h-[75px]">
                            <div className="flex items-center justify-center px-2 py-2 mx-2 border-2 rounded-lg">
                                <div>
                                    {chain?.name}
                                </div>
                            </div>
                            <div className="flex-1 flex items-center px-2 py-1 mx-2 border-2 rounded-lg">
                                <input onChange={(e) => {getPrice(e.target.value)}} className="placeholder:text-slate-400 block bg-white w-full py-2 pl-2 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" placeholder="" type="number" name="toAmount"/>       
                            </div>
                            <div className="flex items-center px-2 py-2 mx-2 border-2 rounded-lg">
                                {showFromTokenList && 
                                    <div className="absolute rounded-lg border bg-white mt-40 p-2 px-4">
                                        {
                                            (chainObj[chain.id].tokens.filter(token => token.address !== tokenTo.address).map(token => <div onClick={() => {setShowFromTokenList(!showFromTokenList); setTokenFrom(token); setTokenTo(token)}} className="hover:cursor-pointer" >{token.token}</div>))
                                        }
                                    </div>
                                }
                                <div onClick={() => setShowFromTokenList(!showFromTokenList)} className="hover:cursor-pointer">
                                    {tokenFrom.token} v
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border-2 border-rounded h-[130px] mx-6 p-2">
                    <div>
                        <div>To</div>
                        { toChainSelect && 
                            <div className="absolute rounded-lg bg-white border-2 mt-16 mx-2 w-content">
                                { 
                                    chains.filter((chainss) => chainss.id !== chain.id).map((chain) => <div onClick={() => {setToChain(chain.name); setToChainId(chain?.id); toggleToChainSelect(!toChainSelect)}} className="flex justify-center py-2 px-2 hover:bg-gray-100 hover:cursor-pointer">{chain.name}</div>)
                                }
                            </div>
                        }
                        
                        <div className="flex flex-row items-center justify-center h-[75px] hover:cursor-pointer">
                            <div onClick={() => toggleToChainSelect(!toChainSelect)} className="flex items-center justify-center px-2 py-2 mx-2 border-2 rounded-lg">
                                <div>
                                    {toChain} v
                                </div>
                            </div>
                            <div className="flex-1 flex items-center px-2 py-2 mx-2 border-2 rounded-lg">
                                {swapTo}
                            </div>
                            <div className="flex items-center px-2 py-2 mx-2 border-2 rounded-lg">
                                {/* {showToTokenList && 
                                    <div className="absolute rounded-lg border bg-white mt-40 p-2 px-4">
                                        {
                                            (chainObj[toChainId].tokens.filter(token => token.address !== tokenFrom.address).map(token => <div onClick={() => {setShowToTokenList(!showToTokenList); setTokenTo(token)}} className="hover:cursor-pointer" >{token.token}</div>))
                                        }
                                    </div>
                                } */}
                                <div>
                                    {tokenTo.token}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="rounded-lg border border-rounded h-[120px] mx-6 p-2">
                    <div>
                        <div>You Pay</div>
                        <div className="animate-pulse p-1 flex flex-row items-center justify-center h-[75px]">
                            { toPayLoading && <div class="rounded-lg w-full h-full bg-slate-300"></div> }
                        </div>
                    </div>
                </div> */}
                <button onClick={() => sendTransaction()} className="w-full text-xl rounded-b-lg text-white py-4 bg-black">Initiate</button>
            </div>
        }
        </div>
    )
}
export default Swap;