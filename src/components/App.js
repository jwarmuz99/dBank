import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json' // import the abi for bank
import React, { Component } from 'react';
import Token from '../abis/Token.json' // import the abi for token
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    //check if MetaMask exists
    if(typeof window.ethereum!=='undefined'){
        // create a new connection
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        console.log(netId)
        // below works for now but maybe we should use a newer version
        const enabledWeb3 = await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts()
        if(typeof accounts[0] !=='undefined'){
            const balance = await web3.eth.getBalance(accounts[0])
            this.setState({ account: accounts[0], balance: balance, web3: web3 })
        } else {
        window.alert('Please login with MetaMask')
        }

        // load contracts
        try {
            // create new smart contract object for token
            const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
            const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
            const dBankAddress = dBank.networks[netId].address
            // console.log(dBankAddress)
            const tokenBalance = await token.methods.balanceOf(this.state.account).call()
            tokenBalance = web3.utils.fromWei(tokenBalance)
            // console.log('Your DBC balance:', tokenBalance)
            this.setState({ token: token, dbank: dbank, dBankAddress: dBankAddress, tokenBalance: tokenBalance})
            } catch (e) {
                console.log('Error', e)
                window.alert('Contracts not deployed to the current network')
            }

            // tokenBalance = web3.utils.fromWei(tokenBalance)
            // console.log("DBC:", tokenBalance)
            // create new smart contract object for dbank
    } else {
        window.alert('Please install MetaMask')
    }
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
        //in try block call dBank deposit();
        try{
            await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
        } catch (e) {
            console.log('Error, deposit: ', e)
        }
    }
  }

  async withdraw(e) {
    // prevent button from default click
    e.preventDefault()
    // check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
        // in try block call dBank withdraw();
        try{
            await this.state.dbank.methods.withdraw().send({from: this.state.account})
        } catch (e) {
            console.log('Error, withdraw: ', e)
        }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      tokenBalance: 0
    }
  }

  render() {
      return (
        <div className='text-monospace'>
          <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <a
              className="navbar-brand col-sm-3 col-md-2 mr-0"
              href="http://www.dappuniversity.com/bootcamp"
              target="_blank"
              rel="noopener noreferrer"
            >
          <img src={dbank} className="App-logo" alt="logo" height="32"/>
            <b>d₿ank</b>
          </a>
          </nav>
          <div className="container-fluid mt-5 text-center">
          <br></br>
            <h1>Welcome to d₿ank</h1>
            <h2>{this.state.account}</h2>
            <br></br>
            <div className="row">
              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                    <br></br>
                      How much do you want to deposit?
                      <br></br>
                      (min. amount is 0.01 ETH)
                      <br></br>
                      (1 deposit is possible at the time)
                      <br></br>
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        let amount = this.depositAmount.value
                        amount = amount * 10**18 //convert to wei
                        this.deposit(amount)
                      }}>
                        <div className='form-group mr-sm-2'>
                        <br></br>
                          <input
                            id='depositAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.depositAmount = input }}
                            className="form-control form-control-md"
                            placeholder='amount...'
                            required />
                        </div>
                        <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                      </form>

                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <br></br>
                      Do you want to withdraw + take interest?
                      <br></br>
                      <br></br>
                    <div>
                      <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                    </div>
                  </Tab>
                  <Tab eventKey="interest" title="Interest">
                    <br></br>
                      The interest accrued so far:
                      <br></br>
                      <br></br>
                      {this.state.tokenBalance} DCB
                  </Tab>
                </Tabs>
                </div>
              </main>
            </div>
          </div>
        </div>
      );
    }
  }

export default App;