import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../utils/translate.js";
import Main from "../views/Main";
import Mark from "../views/Mark";
import Footer from "../component/Footer";
import Advertisment from "../views/Advertisment";
import Step from "../views/Step";
import Roadmap from "../views/Roadmap";
import { WalletContext } from "../providers/WalletProvider.js";


function Home() {
  const { t, i18n } = useTranslation();
  // const [coinData, setCoinData] = useState(pair);
  const { coinData, getCoinData } = useContext(WalletContext);
  const stepData = [
    {
      picUrl: "/assets/img/step1.png",
      step: t("Step1"),
      subtitle: t("Get Started"),
    },
    {
      picUrl: "/assets/img/step2.png",
      step: t("Step2"),
      subtitle: t("Confirmation"),
    },
    {
      picUrl: "/assets/img/step3.png",
      step: t("Step3"),
      subtitle: t("Identify Verification"),
    },
    {
      picUrl: "/assets/img/step4.png",
      step: t("Step4"),
      subtitle: t("Buy Cryptocurrency"),
    },
    {
      picUrl: "/assets/img/step5.png",
      step: t("Step5"),
      subtitle: t("Sell Cryptocurrency"),
    },
    {
      picUrl: "/assets/img/step6.png",
      step: t("Step6"),
      subtitle: t("Send and Receive"),
    },
  ];
  const fetchData = async () => {
    try {
      await getCoinData();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Main coinData={coinData} />
      <Mark />
      <Advertisment />
      <Step />
      <Roadmap />
      <Footer />
    </div>
  );
}

export default Home;
