import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useState,
} from "react";
import { Box } from "@mui/material";
import TOKENS from "pointsdk/constants/tokens";
import { BlockchainContext } from "pointsdk/popup/context/blockchain";
import ERC20Abi from "pointsdk/abi/ERC20.json";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";

const Tokens: FunctionComponent = () => {
    const [balances, setBalances] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { chainId, userData } = useContext(BlockchainContext);

    const getBalances = async () => {
        setError(false);
        setLoading(true);
        try {
            const responses = await Promise.all(
                TOKENS[chainId as "rinkeby"].map(async (token) => {
                    const contract = new Contract(
                        token.address,
                        ERC20Abi,
                        new Web3Provider(window.ethereum, "any"),
                    );
                    const decimals = await contract.decimals();
                    const balance = await contract.balanceOf(userData.address);
                    return formatUnits(balance.toString(), decimals);
                }),
            );
            setBalances(responses);
        } catch (e) {
            console.error(e);
            setError(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (window.ethereum && chainId && userData.address) {
            void getBalances();
        }
    }, [chainId, userData, window.ethereum]);

    return (
        <Box p={1} mb={1}>
            {loading ? (
                <p>loading...</p>
            ) : error ? (
                <p>error</p>
            ) : (
                (TOKENS[chainId as "rinkeby"] ?? []).map((token, index) => (
                    <div key={index}>
                        <p>{token.name}</p>
                        <p>{balances[index]}</p>
                    </div>
                ))
            )}
        </Box>
    );
};

export default Tokens;
