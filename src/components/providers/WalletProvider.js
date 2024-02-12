import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import setAuthToken from "../../utils/setAuthToken";
import { SERVER_URL, networks } from "../../constants/env";
import openNotification from "../helpers/notification";
import { UserContext } from "./UserProvider";
import {
  getTokenBaseInfo,
  getTokenBalance,
  getTokenPriceInUsd,
} from "../../utils/tokenUtils";
import HighWallet from "../../utils/HighWallet";
import CoinData from "../entities/CoinData";

const WalletContextTemplate = {
  connection: Boolean,
  setConnection: (val) => {},
  myWallet: Object,
  publicKey: String,
  loading: Boolean,
  setLoading: (val) => {},
  tokenList: Array,
  totalPrice: Number,
  network: networks[2],
  coinData: [
    { name: "BTC", percent: 3.19763724, price: 57832.47921786725 },
    { name: "BTC", percent: 3.19763724, price: 57832.47921786725 },
    { name: "BTC", percent: 3.19763724, price: 57832.47921786725 },
    { name: "BTC", percent: 3.19763724, price: 57832.47921786725 },
    { name: "BTC", percent: 3.19763724, price: 57832.47921786725 },
    { name: "BTC", percent: 3.19763724, price: 57832.47921786725 },
  ],
  setNetwork: (val) => {},
  tokensInfo: [],
  getTokenList: () => {},
  getTransaction: () => {},
  getCoinData: () => {},
};
const WalletContext = React.createContext(WalletContextTemplate);
const WalletProviderDOM = WalletContext.Provider;

function WalletProvider(props) {
  const userData = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const [connection, setConnection] = useState(true);
  const [myWallet, setWallet] = useState();
  const [publicKey, setPublicKey] = useState();
  const [loading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [network, setNetwork] = useState(networks[2]);
  const [tokensInfo, setTokensInfo] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [coinData, setCoinData] = useState([]);


  const getTokenList = () => {
    if (!publicKey) return;

    setConnection(true);
    setLoading(true);
    setAuthToken(localStorage.jwtToken);

    axios
      .post(SERVER_URL + "wallets/getassets", {
        network: network.url,
        publicKey: publicKey,
      })
      .then((response) => {
        if (response.data.response) {
          setTokenList(response.data.data);
        }
      })
      .catch((err) => {
        setConnection(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getTokenInfo = async () => {
    setConnection(true);

    try {
      let oldTokensInfo = [];
      let oldtotalPrice = 0;
      for (var i = 0; i < tokenList.length; i++) {
        let init = { name: "", price: -1, balance: -1, address: "" };
        let { decimal, symbol } = await getTokenBaseInfo(
          tokenList[i],
          network.url
        );
        init.name = symbol;
        init.address = tokenList[i];
        init.price = await getTokenPriceInUsd(network, tokenList[i]);
        init.balance = await getTokenBalance(
          tokenList[i],
          decimal,
          network.url,
          myWallet.publicKey
        );
        ////console.log("deciaml",init.balance);
        oldTokensInfo.push(init);
        oldtotalPrice += init.balance * init.price;
      }
      setTokensInfo(oldTokensInfo);
      setTotalPrice(oldtotalPrice);
    } catch (error) {
      setConnection(false);
    }
    console.log("end of loading");
    setLoading(false);
  };

  const getTransaction = () => {
    if (!publicKey) return;

    setConnection(true);
    setAuthToken(localStorage.jwtToken);
    axios
      .post(SERVER_URL + "wallets/gettransaction", {
        network: network.url,
        publicKey: publicKey,
      })
      .then((response) => {
        if (response.data.response) {
          let oldtransaction = [];
          response.data.data.map((item) => oldtransaction.push(item.hash));
          setTransactions(oldtransaction);
        }
      })
      .catch((err) => {
        setConnection(false);
      });
  };

  const getCoinData = () => {
    axios.get(SERVER_URL + "wallets/gettoptokens").then((response) => {
      if (response.data.response && response.data.data.length > 0) {
        const data = response.data.data;
        console.log(data);
        const initCoinData = [];

        for (let i = 0; i < 6; i++) {
          initCoinData.push(CoinData.fromRawData(data[i]));
        }

        setCoinData(initCoinData);
      } else {
      }
    });
  };

  useEffect(() => {
    const publicKey = localStorage.getItem("publicKey");
    const privateKey = localStorage.getItem("privateKey");

    if (publicKey) {
      setPublicKey(publicKey);
    }

    if (publicKey && privateKey) {
      const newWallet = new HighWallet("bsc-mainnet", privateKey, publicKey);
      setWallet(newWallet);
    }

    setWallet(false);
  }, []);

  useEffect(() => {
    if (myWallet) {
      myWallet.setNetwork(network.url);
      getTokenList();
      getTransaction();
    }
  }, [network]);

  useEffect(() => {
    if (tokenList.length > 0) getTokenInfo();
  }, [tokenList]);

  return (
    <WalletProviderDOM
      value={{
        connection,
        setConnection,
        myWallet,
        publicKey,
        loading,
        setLoading,
        tokenList,
        totalPrice,
        network,
        coinData,
        setNetwork,
        tokensInfo,
        getTokenList,
        getTransaction,
        getCoinData,
      }}
    >
      {props.children}
    </WalletProviderDOM>
  );
}

export { WalletContext };
export default WalletProvider;
