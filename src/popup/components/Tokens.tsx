import React, {
    Fragment,
    FunctionComponent,
    useContext,
    useEffect,
    useState,
} from "react";
import { Box, Divider } from "@mui/material";
import TOKENS from "pointsdk/constants/tokens";
import { BlockchainContext } from "pointsdk/popup/context/blockchain";
import ERC20Abi from "pointsdk/abi/ERC20.json";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

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
            if (TOKENS[chainId]) {
                void getBalances();
            } else {
                setBalances([]);
            }
        }
    }, [chainId, userData, window.ethereum]);

    return (
        <Box>
            <Typography variant="h5" m={1}>
                ERC20 tokens ({chainId})
            </Typography>
            {loading ? (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ margin: "20px 0" }}
                >
                    <CircularProgress size={24} />
                </Box>
            ) : error ? (
                <p>error</p>
            ) : (
                (TOKENS[chainId as "rinkeby"] ?? []).map((token, index) => (
                    <Fragment key={index}>
                        {index === 0 && <Divider />}
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Typography variant="h6" ml={1}>
                                {token.name}
                            </Typography>
                            <Typography mr={1}>{balances[index]}</Typography>
                        </Box>
                        <Divider />
                    </Fragment>
                ))
            )}
        </Box>
    );
};

export default Tokens;
