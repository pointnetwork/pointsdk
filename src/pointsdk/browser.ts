import getSdk from "pointsdk/pointsdk/sdk";
import getEthProvider from "pointsdk/pointsdk/ethProvider";
import getSolanaProvider from "pointsdk/pointsdk/solanaProvider";
import NETWORKS from "pointsdk/constants/networks";
import swal from "sweetalert2";

// eslint-disable-next-line prettier/prettier
window.point = getSdk(window.location.origin, String(process.env.PACKAGE_VERSION), swal);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
window.point.networks = NETWORKS;
window.ethereum = getEthProvider();
window.solana = getSolanaProvider();
