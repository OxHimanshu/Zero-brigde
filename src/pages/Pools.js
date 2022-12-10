import { useNetwork, useAccount, erc20ABI, useProvider, useSigner } from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers, utils } from "ethers";
import { useAlert, positions } from 'react-alert'
import hashipoolabi from "../abis/hashipoolabi.json";

function Pools() {

    const alert = useAlert()

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

    const provider = useProvider()
    const { data: signer } = useSigner()
    const { chain, chains } = useNetwork();
    const { isConnected, address } = useAccount();
    const [viewPool, setViewPool] = useState(false);
    const [selectPool, setSelectPool] = useState({});
    const [totalStaked, setTotalStaked] = useState(0);
    const [myStake, setMyStake] = useState(0);
    const [depositAmount, setDepositAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);

    async function checkTotalUserStaked(token) {
        setMyStake(0);
        const hashiPoolContract = new ethers.Contract(chainObj[chain.id].hashiPoolContract, hashipoolabi, signer);
        let amount = await hashiPoolContract.stableStorage(address, token.address);
        let stakedAmount = ethers.utils.formatUnits(amount.toString(), token.decimals);
        setMyStake(stakedAmount);

        setTotalStaked(0);
        const contract = new ethers.Contract(token.address, erc20ABI, signer);
        amount = await contract.balanceOf(chainObj[chain.id].hashiPoolContract);
        console.log(amount.toString());
        stakedAmount = ethers.utils.formatUnits(amount.toString(), token.decimals);
        setTotalStaked(stakedAmount);
    }

    const triggerDeposit = async () => {
        if(depositAmount > 0) {
            const contract = new ethers.Contract(selectPool.address, erc20ABI, signer);
            const allowed = await contract.allowance(address, chainObj[chain.id].hashiPoolContract);
            let  amount = String(depositAmount * 10 ** selectPool.decimals);
            let txn;
            if(parseInt(allowed.toString(),18) < parseInt(amount,18)) {
                try {
                    txn = await contract.approve(chainObj[chain.id].hashiPoolContract, amount);
                    alert.success(
                        <div>
                            <div>Transaction Sent</div>
                            <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 0,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(ex) {
                    alert.error(<div>Operation failed</div>, {
                        timeout: 3000,
                        position: positions.TOP_RIGHT
                    });
                }
            } else {
                const hashiPoolContract = new ethers.Contract(chainObj[chain.id].hashiPoolContract, hashipoolabi, signer);
                try{
                    txn = await hashiPoolContract.depositInPool(amount, selectPool.address);
                    alert.success(
                        <div>
                            <div>Transaction Sent</div>
                            <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 0,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(ex) {
                    alert.error(<div>Operation failed</div>, {
                        timeout: 3000,
                        position: positions.TOP_RIGHT
                    });
                }
            }
        }
    }

    const triggerWithdraw = async () => {
        if(withdrawAmount > 0) {
            const contract = new ethers.Contract(selectPool.address, erc20ABI, signer);
            const allowed = await contract.allowance(address, chainObj[chain.id].hashiPoolContract);
            let  amount = String(withdrawAmount * 10 ** selectPool.decimals);
            const hashiPoolContract = new ethers.Contract(chainObj[chain.id].hashiPoolContract, hashipoolabi, signer);
            try {
                const txn = await hashiPoolContract.widthdrawFromPool(amount, selectPool.address);
                alert.success(
                    <div>
                        <div>Transaction Sent</div>
                        <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                    </div>, {
                    timeout: 0,
                    position: positions.BOTTOM_RIGHT
                });
            } catch(ex) {
                alert.error(<div>Operation failed</div>, {
                    timeout: 3000,
                    position: positions.TOP_RIGHT
                });
            }
        }
    }   

    return (
        <div className="flex flex-1 items-center justify-center h-5/6">
        {
            viewPool && 
            <div className="absolute flex justify-between flex-col rounded-lg w-4/12 h-content bg-white px-6 py-4 space-y-8">
                <div className="flex w-full items-center justify-center text-2xl mt-2 pb-2 border-b-2">Liquidity</div>
                <div className="flex flex-row space-x-4">
                    <input onChange = {(e) => setDepositAmount(e.target.value)} className="placeholder:text-slate-400 block bg-white w-full py-2 pl-2 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" placeholder="Enter Amount to deposit" type="number" name="toAmount"/>       
                    <button onClick={() => triggerDeposit()} className="rounded-lg px-6 py-4 bg-black text-white">Deposit</button>
                </div>
                <div className="flex flex-row space-x-4">
                    <input onChange = {(e) => setWithdrawAmount(e.target.value)} className="placeholder:text-slate-400 block bg-white w-full py-2 pl-2 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" placeholder="Enter Amount to withdraw" type="number" name="toAmount"/>       
                    <button onClick={() => triggerWithdraw()} className="rounded-lg px-6 py-4 bg-black text-white">Withdraw</button>
                </div>
                <div className="flex justify-between h-[100px] font-semibold text-lg items-center border-1 bg-gray-200 rounded-lg px-10">
                    <div>Total Staked: {totalStaked}</div>
                    <div>My Stake: {myStake}</div>
                </div>
                <div onClick={() => setViewPool(!viewPool)} className="rounded-lg flex w-full items-center justify-center text-xl mt-2 py-4 bg-black text-white hover:cursor-pointer">Close</div>
            </div>
        }
        {
            isConnected && 
            <div className="rounded-lg w-4/12 h-content bg-white">
                {/* <button className='bg-white' onClick={() => { alert.success(<div><div>Transaction Sent</div><button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + "0x36fafaa15e8470a68dcc270816d6ab440195139f9b886c56fe940566a74e6ce6", "_blank")}>View on explorer</button></div>) }}> Show Alert </button> */}
                {chainObj[chain.id].tokens.map(token => <div className="rounded-lg my-1 bg-gray-100 flex items-center text-xl w-full h-[100px] px-4 py-2 hover:bg-gray-200">
                    <div className="flex flex-row items-center justify-between w-full"> 
                        <div> 
                            <div>{token.token}</div>
                        </div>
                        <div className="flex flex-row space-x-6"> 
                            <button onClick={() => {setViewPool(!viewPool); setSelectPool(token); checkTotalUserStaked(token);}} className="rounded-lg bg-black text-white p-4">Deposit</button>
                            <button onClick={() => {setViewPool(!viewPool); setSelectPool(token); checkTotalUserStaked(token);}} className="rounded-lg bg-black text-white p-4">Withdraw</button>
                        </div>
                    </div>
                </div>)}
            </div>
        }
        </div>
    )
}
export default Pools;