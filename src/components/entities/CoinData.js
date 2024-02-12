class CoinData {
  constructor ({ symbol, price, percent }) {
    this._symbol = symbol;
    this._price = price;
    this.percent = percent;
  }

  get symbol () {
    return this._symbol;
  }

  get price () {
    return this._price;
  }

  get dailyPercent () {
    return this.percent;
  }

  static fromRawData ({ symbol, price, daily_percent }) {
    return new CoinData({
      symbol,
      price,
      percent: daily_percent,
    });
  }
}

export default CoinData;
