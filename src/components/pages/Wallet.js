import React, { useState, useEffect, useCallback, useContext } from "react";
import { Button, Row, Col, Drawer, Typography } from "antd";
import { Link, useParams } from "react-router-dom";
import {
  AiOutlineLoading3Quarters,
  AiFillCloseCircle,
  AiOutlineCheck,
  AiTwotoneEnvironment,
  AiOutlineLogout,
} from "react-icons/ai";
import ReactLoading from "react-loading";
import QRCode from "qrcode.react";
import { useTranslation } from "react-i18next";
import { PresaleContext } from "../providers/PresaleProvider";
import { WalletContext } from "../providers/WalletProvider";
import WalletNav from "../component/WalletNav";
import WalletPortfolio from "../views/WalletPortfolio";
import WalletSend from "../views/WalletSend";
import WalletActivity from "../views/WalletActivity";
import WalletManageKeys from "../views/WalletManageKeys";
import WalletProfile from "../views/WalletProfile";
import WalletBuy from "../views/Wallet/WalletBuy";
import setAuthToken from "../../utils/setAuthToken";
import WalletUtil from "../../utils/wallet";
import openNotification from "../helpers/notification";
import WalletLoadingModal from "../component/WalletComponents/WalletLoadingModal";
import { SERVER_URL, networks } from "../../constants/env";
import {
  getTokenBaseInfo,
  getTokenBalance,
  getTokenPriceInUsd,
} from "../../utils/tokenUtils";

const { Paragraph } = Typography;
const initTokenList = [{ name: "MGL", price: 0, balance: 0, address: "" }];

function Wallet() {
  const [t, i18n] = useTranslation();
  const [idx, setIdx] = useState(0);
  const [stopMode, setStopMode] = useState(true);
  const [visible, setVisible] = useState(false);
  const [transations, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id, presaleToken, chainId } = useParams();
  const presaleData = useContext(PresaleContext);
  const {
    connection,
    tokensInfo,
    totalPrice,
    network,
    tokenList,
    coinData,
    publicKey,
    getCoinData,
    getTransaction,
    getTokenList,
    setNetwork,
  } = useContext(WalletContext);

  let frequent;

  useEffect(() => {
    if (id) {
      setIdx(parseInt(id));
    }

    if (publicKey === undefined) {
      return;
    }

    if (publicKey === false) {
      openNotification(
        "Wallet Access failed.",
        "You are not allowed!",
        false,
        () => (window.location.href = "/walletMain")
      );
      return;
    }

    getAssets();
    getTransaction();
    frequent = setInterval(getAssets, 1000 * 60);

    return () => {
      clearInterval(frequent);
    };
  }, [publicKey]);

  useEffect(async () => {
    if (id && presaleToken && chainId) {
      let findNetwork = networks.filter((item) => item.chainId === chainId);
      let info = await getTokenBaseInfo(presaleToken, findNetwork[0].url);
      // let price = await getTokenPriceInUsd(findNetwork[0], presaleToken);
      let price = 0.018;
      presaleData.setPresaleData({
        ...info,
        id: id,
        toToken: presaleToken,
        network: findNetwork[0],
        price: price.toFixed(3),
      });
    }
  }, [id, presaleToken, chainId]);

  useEffect(() => {
    if (tokenList.length > 0) setStopMode(false);
  }, [tokenList]);

  const initFunction = async () => {};

  function findTokenName(tokenAddress) {
    return network.tokenList[tokenAddress].symbol;
  }

  const getAssets = async () => {
    setLoading(true);

    await getTokenList();
    await getCoinData();
    setAuthToken(localStorage.jwtToken);

    setLoading(false);
  };

  const reload = () => {
    getTransaction();
    
    getAssets();
  };

  const logout = () => {
    window.location.href = "/";
  };
  const changeNetwork = (chain) => {
    setNetwork(chain);
    setVisible(false);
  };

  useEffect(() => {
    if (network) getTransaction();
    getAssets();
  }, [network]);

  useEffect(() => {
    console.log("tokensInfo", tokensInfo);
    if (tokensInfo.length > 0) setStopMode(false);
  }, [tokensInfo]);

  return (
    <>
      {publicKey ? (
        <Row className="bg-gray-200 h-screen">
          <Col span={4} className="text-gray-400 bg-white">
            <WalletNav setIdx={setIdx} idx={idx} />
          </Col>
          <Col span={20} className="">
            <Row className="h-full">
              <Col
                xs={{ span: 24 }}
                md={{ span: 18 }}
                className="flex flex-col"
              >
                <Row className="w-full">
                  <Col
                    xs={{ span: 24 }}
                    md={{ span: 10 }}
                    className="bg-white border-l-8 border-gray-200 p-4"
                  >
                    <div className="text-xl myColor1 p-0">
                      <a onClick={reload}>
                        {loading ? (
                          <ReactLoading
                            className="inline-block mr-2"
                            type="spinningBubbles"
                            color="#000"
                            height={20}
                            width={20}
                          />
                        ) : (
                          <AiOutlineCheck
                            className="inline-block mr-2"
                            size={20}
                          />
                        )}
                      </a>
                      {t("Balance")}
                    </div>
                    <p className="text-3xl font-bold myColor1 mt-2">
                      {t("Total Price")}
                    </p>
                    <p className="text-xl font-bold myColor1">
                      ${parseFloat(totalPrice).toFixed(3)} USD{" "}
                    </p>
                  </Col>

                  <Col
                    xs={{ span: 24 }}
                    md={{ span: 14 }}
                    className="bg-white border-l-8 border-gray-200 p-4 "
                  >
                    <Row className="text-xl myColor1 text-center">
                      <Col span={10}>{t("QR Code")}</Col>
                      <Col span={14}>{t("Wallet Address")}</Col>
                    </Row>
                    <Row className="mt-2  text-center">
                      <Col span={10} className="text-overflow">
                        <QRCode
                          size={100}
                          value={publicKey}
                          className="inline mr-2"
                        />
                      </Col>
                      <Col span={14}>
                        <Paragraph copyable className="myColor1 font-bold ">
                          {publicKey}
                        </Paragraph>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row className="bg-white border-l-8 border-gray-200 border-t-8 flex-grow ">
                  {idx === 0 ? (
                    <WalletPortfolio
                      tokensInfo={tokensInfo}
                      coinList={coinData}
                      network={network.url}
                      getAssets={reload}
                    />
                  ) : idx === 1 ? (
                    <WalletSend
                      network={network}
                      tokensInfo={tokensInfo}
                      getAssets={reload}
                      transactions={transations}
                      setTransactions={setTransactions}
                      setIdx={setIdx}
                      setStopMode={setStopMode}
                    />
                  ) : idx === 2 ? (
                    <WalletBuy />
                  ) : idx === 3 ? (
                    <WalletActivity />
                  ) : idx === 4 ? (
                    <WalletManageKeys network={network} />
                  ) : idx === 5 ? (
                    <WalletProfile />
                  ) : null}
                </Row>
              </Col>
              <Col
                xs={{ span: 24 }}
                md={{ span: 6 }}
                className="bg-white border-l-8 border-gray-200 myColor1"
              >
                <Row className="border-b-8 border-gray-200 p-4 text-center">
                  <Col span={12} className="flex flex-col items-center">
                    {connection ? (
                      <AiTwotoneEnvironment
                        size={20}
                        className="text-green-500 inline mb-1 mr-1"
                      />
                    ) : (
                      <AiTwotoneEnvironment
                        size={20}
                        className="text-red-500 inline mb-1 mr-1"
                      />
                    )}
                    <div className=" text-overflow w-full">
                      <a onClick={() => setVisible(true)}>
                        {network.name.split(" ").map((item, idx) => (
                          <p key={idx} className="text-lg ">
                            {item}
                          </p>
                        ))}
                      </a>
                    </div>
                  </Col>
                  <Col span={12} className="flex flex-col items-center">
                    <AiOutlineLogout
                      size={20}
                      className="myColor1 inline mb-1 mr-1"
                    />
                    <div className=" text-overflow w-full">
                      <a onClick={logout}>
                        <p className="text-lg text-overflow">{t("Back")}</p>
                        <p className="text-lg text-overflow">
                          {t("to Exchange")}
                        </p>
                      </a>
                    </div>
                  </Col>
                </Row>
                <Row className="p-4 ">
                  <Col span={24} className="text-overflow">
                    <p className="text-2xl my-4">{t("Transactions")}</p>
                  </Col>
                  {transations.map((item, idx) => (
                    <Col span={24} className="text-overflow">
                      <a
                        target="_blank"
                        href={`${network.explorer}tx/${item}`}
                        className="my-2 myColor1"
                      >
                        {item}
                      </a>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : null}

      <WalletLoadingModal show={stopMode} />

      <Drawer
        className="myColor1 text-lg font-bold"
        headerStyle={{ color: "red" }}
        title="Change Network"
        placement="right"
        onClose={() => setVisible(false)}
        visible={visible}
        closeIcon={<AiFillCloseCircle size={20} />}
      >
        <a
          onClick={() => {
            changeNetwork(networks[0]);
          }}
        >
          <p className="mt-4 border-b-2 border-gray-200">Mainnet(Polygon)</p>
        </a>
        {/*<a onClick={()=>{changeNetwork(networks[1])}}><p className="mt-4 border-b-2 border-gray-200">Testnet(Polygon)</p></a>*/}
        {/*<p className="text-gray-400 mt-4 border-b-2 border-gray-200">Testnet(Polygon)</p>*/}
        <a
          onClick={() => {
            changeNetwork(networks[2]);
          }}
        >
          <p className="mt-4 border-b-2 border-gray-200">Mainnet(BSC)</p>
        </a>
        {/* <a onClick={()=>{changeNetwork(networks[3])}}><p className="mt-4 border-b-2 border-gray-200">Testnet(BSC)</p></a> */}
      </Drawer>
    </>
  );
}

export default Wallet;
