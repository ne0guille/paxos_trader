import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';
import { sha256 } from 'sha256';
// import { sha512 } from 'sha512';

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
    const requestURL = 'https://api.itbit.com/v1/wallets?userId=e9c856db-c726-46b2-ace0-a806671105fb';
    const utf8Strings = ['GET', requestURL, timestamp];
    //    - Convert that array to JSON, encoded as UTF-8. 
    //      The resulting JSON should contain no spaces or other whitespace characters. 
    //      For example, a valid JSON-encoded array might look like:
    //      '["GET","https://api.itbit.com/v1/wallets/7e037345-1288-4c39-12fe-d0f99a475a98","","5","1405385860202"]'
    //      Note above was for a 'known' wallet ID which I am not doing ytet, just getting 'all' wallets with my first call
    const JSONutf8Strings = JSON.stringify(utf8Strings);
    //    - 5. Prepend the string version of the nonce to the JSON-encoded string.
    const NoncePlusJSON = nonce + JSONutf8Strings;
    //    - 6. Construct the SHA-256 hash of the string generated in step 5. Call this the message hash.
    //    const SHA256hash = sha256(NoncePlusJSON); 
    //    - 7. Prepend the UTF-8 encoded request URL to the message hash.
    //    const finalURL = requestURL + SHA256hash;
    //    - 8. Generate the SHA-512 HMAC of the string generated in step 7 using your API secret as the key.
    const myAPIkey = process.env.REACT_APP_PAXOS_KEY;
    //    const SHA512HMAC = sha512(finalURL);
    //    - Base 64 encode the HMAC digest generated in step 8. This is the request signature.
    //  const signature = btoa(SHA512HMAC);
    //    
    //    3. HOW DO I MAKE A REQUEST?  ¶
    //    - Generate the request information (URL, HTTP verb, and, if required, the request body).
    //    - Sign the request using the steps above. Note the signature, timestamp, and nonce.
    //    - Generate the authorization header by concatenating the client key with a colon separator (’:’) and the signature. 
    //      The resulting string should look like “clientkey:signature”.
    //    - Set the following headers on the request:
    //      Authorization: The authorization header created in step 3
    //        X-Auth-Timestamp: The timestamp
    //        X-Auth-Nonce: The nonce
    //        Content-Type: "application/json"
    //      The request can now be made using the URL, HTTP verb, request body (if required), and the headers.
    const theHeader = () => {
      return {
        url: requestURL,
        method: 'GET',
        body: ''
      }
    };

    axios.request(requestURL)
      .then(function (response) {
        const responseData = response.data.balances[0].availableBalance  // TODO see if correct
        // const reducedResponse = responseData.reduce((result, item, index) => {
        //   return { ...result, [index]: item, };
        // }, {});
        setWalletBalance( responseData );
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

  const getMyWalletBalance = () => {
    getMyBalance();
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
