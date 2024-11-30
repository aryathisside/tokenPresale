import React, { useState, useEffect } from "react";
import WertWidget from "@wert-io/widget-initializer";
import type { Options } from "@wert-io/widget-initializer/types";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { v4 as uuidv4 } from "uuid";
import Web3 from "web3";
import { Buffer } from "buffer";
import * as dotenv from 'dotenv';

dotenv.config();
// Set Buffer globally for browser compatibility
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

interface WertWidgetButtonProps {
  partnerId: string;
//   privateKey: string;
  amount: string;
}

const NETWORK = 'arbitrum_sepolia' as const;
const COMMODITY = 'ETH' as const;
const privateKey =
'0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3';

const NewNftWertWidgetButton: React.FC<WertWidgetButtonProps> = ({
  partnerId,
  amount,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [scInputData, setScInputData] = useState<string>("");

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setUserAddress(accounts[0]);
          setWeb3(web3Instance);

          // Generate sc_input_data once we have the user address
          const inputData = web3Instance.eth.abi.encodeFunctionCall(
            {
              inputs: [
                {
                  internalType: "enum NodeType",
                  name: "nodeType",
                  type: "uint8",
                },
              ],
              name: "mintNodeLicenseWithNative",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            [0]
          );
          setScInputData(inputData);
        } catch (err) {
          // setError("Failed to connect to MetaMask");
          console.error(err);
        }
      } else {
        setError("MetaMask is not installed");
      }
    };
    initializeWeb3();
  }, []);

  const handleClick = async () => {
    if (!web3 || !userAddress || !scInputData) {
      setError("Web3 not initialized");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const signedData = signSmartContractData(
        {
          address: userAddress,
          commodity: COMMODITY,
          commodity_amount: Number(amount),
          network: NETWORK,
          sc_address: "0xE91FFBDD609531Bcef75EcB5c21c294aAc514904",
          sc_input_data: scInputData
        },
        privateKey
      );

    //   const nftOptions: Options["extra"] = {
    //     item_info: {
    //       author: "Wert",
    //       image_url: "http://localhost:8765/sample_nft.png",
    //       name: "Wert Sample NFT",
    //       seller: "Wert",
    //       header: "Wert Sample header",
    //     },
    //   };

      const otherWidgetOptions: Options = {
        partner_id: partnerId,
        click_id: uuidv4(),
        origin: "https://sandbox.wert.io",
        theme:"dark",
        // extra: nftOptions,
      };

      const wertWidget = new WertWidget({
        ...signedData,
        ...otherWidgetOptions,
      });

      wertWidget.open();
    } catch (err) {
      setError("An error occurred during the signing process.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full flex justify-center">
        <button
          // onClick={handleClick}
          disabled={loading}
          className="w-full bg-[#5538CE] text-white rounded-[48px] px-4 py-2 flex justify-center items-center leading-[48px] group relative"
        >
          {/* Button Text */}
          <span className="group-hover:hidden">
            {loading ? 'Processing...' : 'Buy NFT Now'}
          </span>

          {/* Hover/Clicked Text */}
          {loading || <span className="hidden group-hover:inline">Coming Soon</span>}
        </button>

        {/* Error Message */}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    </div>
  );
};

export default NewNftWertWidgetButton;
