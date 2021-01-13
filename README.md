# Budget: $300-$500

# Task: Update crypto trading app to show wallet account balances for a PAXOS account holder

The app currently retrieves prices from the Paxos public APIs for the cryptocurrency prices of BTC, ETH and LTC.  
The URL is https://api.itbit.com/docs  
This works OK.  
The task now is to add functionality to show the current wallet balances for a specifc account.  

The existing public API axios calls (which work) to get the prices are in getData().  

I have written pseudo code in getMyWalletBalances() to get the account wallet balances.  
It attempt to follow the instructions at https://api.itbit.com/docs#faq-2.-how-do-i-sign-a-request?  
I found the instreuctions hard to follow so the code shows my 'best attempt". but may be wrong in several places!  
I am unable to get this working as either I get errors about the dependency array, or, if I add the dependencies suggested, I get runaway http calls which leads to my api being blocked for a few minutes due to thousandss of API calls (you probably know how to avoid this but be careful).

Your task is to get the code working so that it retrieves the wallet balances for a given API key.  The psuedo code to retrieve balances is "guessed psudo code" so you can change anything in it to get it working. Question everything.

As part of this I expect you to open a PAXOS account in order to test it with your own Paxos API key.  

You will need to add a .env file with a REACT_APP_PAXOS_KEY=123456789 (replace with your key).  

Once you have it working I will test it with my key.  If the balances are correct then it works.

The budget is $300 for the app code and $500 if the code also includes full test coverage
