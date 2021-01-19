import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [currentBTCprice, setCurrentBTCprice] = useState({});
  const [currentETHprice, setCurrentETHprice] = useState({});
  const [currentLTCprice, setCurrentLTCprice] = useState({});
  const [walletBalance, setWalletBalance] = useState({});
  const [numCalls, setNumCalls] = useState(0);
  const commaForThousands = (num = '') => {
    return num.substring(0, 2) + ',' + num.substring(2, 8)
  }

  const getPrice = useCallback((currency) => {
    const itBitHost = 'https://api.itbit.com/v1/';
    axios.get(itBitHost + `markets/${currency}/ticker`)
      .then(function (response) {
        const bid = Number(response.data.bid).toFixed(2);
        const displayBid = !isNaN(bid) ? bid : '';
        const when = response.data.serverTimeUTC;
        if (currency === 'XBTUSD') setCurrentBTCprice({ 'bid': displayBid, 'when': when });
        if (currency === 'ETHUSD') setCurrentETHprice({ 'bid': displayBid, 'when': when });
        if (currency === 'LTCUSD') setCurrentLTCprice({ 'bid': displayBid, 'when': when });
      })
      .catch(function (e) {
        console.log(e);
      });
  }, []);

  const getCurrentPrices = () => {
    getPrice('XBTUSD');
    getPrice('ETHUSD');
    getPrice('LTCUSD');
    setNumCalls(callTotal => { return callTotal + 1 });
  }

  const getProfileBalances = useCallback(() => {
    // TODO Question every line here.  Treat this as pseudo code and remove or change any of it. Trust none of it.
    const requestURL1 = `https://api.paxos.com/v2/profiles/`; // Use this first to get the profle IDs perhaps ?
    // TODO make axios call to get profileID
    const profile1 = ''; // Replace this with profile ID(s) from above requestURL1 response
    const requestURL = `https://api.paxos.com/v2/profiles/${profile1}/balances`; // Not sure if URI is correct
    const params = new URLSearchParams([['assets', ["USD", "BTC", "ETH"]]]);
    const headers = {
      'Authorization': 'Bearer S9O1dsOYi1mLQw0jt5FgyBAX3YIqm66_g7JbxEmFNNA.RT7DNEBn63dX3ECn-zBk7vc32PsvbRLwBt2P-oxxV-M',
      'Access-Control-Allow-Origin': '*',
      'Vary': 'origin',
      "Content-Type": "application/json"
    } // TODO The above Bearer token is mine.  You will need a new one for your clientID/Secret

    axios.get(requestURL, { headers, params })
      .then(function (response) {
        console.log(response)
        setWalletBalance({'USD': 0, 'XBT': 0, 'ETH': 0, 'LTC': 0}) // TODO Use actual wallet balances from response.
      })
      .catch(function (e) {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    getCurrentPrices();
    getProfileBalances();
    const interval = setInterval(() => getCurrentPrices(), 30000);
    return () => {
      clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPrice]);

  const theTime = (date) => {
    const hours = theHours(date)
    const mins = theMinutes(date)
    const twoDigitMins = mins < 10 ? `0${mins}` : mins;
    const twoDigitHours = hours < 10 ? `0${hours}` : hours;
    return `${twoDigitHours}:${twoDigitMins}`;
  }
  const theHours = (date) => {
    const newDate = new Date(Date.parse(date));
    return (newDate.getHours());
  }
  const theMinutes = (date) => {
    const newDate = new Date(Date.parse(date));
    return (newDate.getMinutes());
  }
  return (
    <div className="App">
      <h1>PAXOS ATS</h1>
      <h2>
        <table align="center">
          <tbody>
            <tr id="XSD">
              <td> BTC </td>
              <td className="price"> {commaForThousands(currentBTCprice.bid)} </td>
              <td className="when"> {theTime(currentETHprice.when)} </td>
            </tr>
            <tr id="ETH">
              <td> ETH </td>
              <td className="price"> {currentETHprice.bid} </td>
              <td className="when"> {theTime(currentETHprice.when)} </td>
            </tr>
            <tr id="LTC">
              <td> LTC </td>
              <td className="price"> {currentLTCprice.bid} </td>
              <td className="when"> {theTime(currentLTCprice.when)} </td>
            </tr>
            <tr id="balances">
              <td>Balances</td>
              <td>USD ${walletBalance.USD} </td>
              <td>XTC ${walletBalance.BTC} </td>
              <td>ETH ${walletBalance.ETH} </td>
              <td>LTC ${walletBalance.LTC} </td>
            </tr>
          </tbody>
        </table>
      </h2 >
      <div id="call-counter">
        API calls: {numCalls}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {Date(Date.now()).substring(16, 24)}
        {theHours}
      </div>
    </div >
  );
}
export default App;
