import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

function App() {
  const [currentBTCprice, setCurrentBTCprice] = useState({});
  const [currentETHprice, setCurrentETHprice] = useState({});
  const [currentLTCprice, setCurrentLTCprice] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [numCalls, setNumCalls] = useState(0);
  const commaForThousands = (num = '') => {
    return num.substring(0, 2) + ',' + num.substring(2, 8)
  }

  const getData = useCallback((currency) => {
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

  const getMyBalance = useCallback(() => {
    //    All the requests sent to the itBit Rest API will need to be signed. The steps to sign a request are listed below:
    //    - Generate a timestamp. The timestamp should represent the number of milliseconds since January 1st, 1970.
    const timestamp = Date.now();
    //    - Generate a nonce. The nonce should be a unique integer number.
    const nonce = String(Date.now()).slice(-5) + String(Math.random()).replace('.', '').slice(-5);
    //    - Construct an array of UTF-8 encoded strings. That array should contain, in order:
    //      - The http verb of the request being signed (e.g. “GET”)
    //      - The full url of the request
    //      - The body of the message being sent, the nonce as a string, and the timestamp as a string.
    //        If the request has no body, an empty string should be used.
    const requestURL = 'https://api.itbit.com/v1/wallets?userId=24e3e5d8-3eaa-4367-ac4d-a83625213b38'
    const utf8Strings = ['GET', requestURL, '', String(nonce), String(timestamp)];
    //    - 5. Prepend the string version of the nonce to the JSON-encoded string.
    //    - 6. Construct the SHA-256 hash of the string generated in step 5. Call this the message hash.
    const message_hash = sha256(String(nonce) + utf8Strings);
    //    - 7. Prepend the UTF-8 encoded request URL to the message hash.
    //    - 8. Generate the SHA-512 HMAC of the string generated in step 7 using your API secret as the key.
    //    - Base 64 encode the HMAC digest generated in step 8. This is the request signature.
    const signature = Base64.stringify(hmacSHA512(requestURL + message_hash, process.env.REACT_APP_PAXOS_SECRET));

    const headers = {
      'Authorization': `${process.env.REACT_APP_PAXOS_CLIENT_KEY}:${signature}`,
      'X-Auth-Timestamp': String(timestamp),
      'X-Auth-Nonce': String(nonce),
      'Content-Type': 'application/json'
    }

    axios.request(requestURL, { headers })
      .then(function (response) {
        const responseData = response.data.balances[0].availableBalance  // TODO see if correct
        // const reducedResponse = responseData.reduce((result, item, index) => {
        //   return { ...result, [index]: item, };
        // }, {});
        setWalletBalance(responseData);
      })
      .catch(function (e) {
        console.log(e);
      });
  }, []);

  const getAllBids = () => {
    getData('XBTUSD');
    getData('ETHUSD');
    getData('LTCUSD');
    setNumCalls(callTotal => { return callTotal + 1 });
  }

  const listProfile = useCallback(() => {
    const requestURL = 'https://api.paxos.com/v2/profiles/24e3e5d8-3eaa-4367-ac4d-a83625213b38/balances'
    
    const params = new URLSearchParams([['assets', ["USD", "BTC", "ETH"]]]);
    const headers = {
      'Authorization': 'Bearer rv3z_i7E7R09PMd452P-coJvM18YHLcrvhoCEvF1YgQ.WfPHqXjbMritsQCAZJedF5-rpO6997zPSWHgQL7L9dE',
      'Access-Control-Allow-Origin': '*',
      "Content-Type": "application/json"
    }

    axios.get(requestURL, { headers, params })
      .then(function (response) {
        console.log(response)
      })
      .catch(function (e) {
        console.log(e);
      });
  }, []);

const getMyWalletBalance = () => {
   getMyBalance();
   listProfile();
}

useEffect(() => {
  getAllBids();
  getMyWalletBalance();
  const interval = setInterval(() => getAllBids(), 30000);
  return () => {
    clearInterval(interval);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [getData]);

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
            <td class="price"> {currentETHprice.bid} </td>
            <td className="when"> {theTime(currentETHprice.when)} </td>
          </tr>
          <tr id="LTC">
            <td> LTC </td>
            <td class="price"> {currentLTCprice.bid} </td>
            <td className="when"> {theTime(currentLTCprice.when)} </td>
          </tr>
          <tr id="BUY-LTC">
            <td>My Wallet Balance: ${walletBalance} </td>
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
