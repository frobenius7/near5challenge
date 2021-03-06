import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')
const IMAGE_LINK = 'https://bafybeidp3cx75pfks44cfudka5l4ydgasj76zrsgmyhyy3tu22qy3c25ea.ipfs.dweb.link/'
export default function App() {
  // use React Hooks to store greeting in component state
  // const [greeting, set_greeting] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        // window.contract.get_greeting({ account_id: window.accountId })
        //   .then(greetingFromContract => {
        //     set_greeting(greetingFromContract)
        //   })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>NEARvember challenge 5 - NFT minting frontent!</h1>
        <p>
          Please sign in.
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <img className="nft" src={IMAGE_LINK} />
          <div className="before">
            Hi
              {' '/* React trims whitespace around tags; insert literal space character when needed */}
              {window.accountId}!
            <p>Mint exclusive NearMan NFT from Vetal =)</p>

            <form onSubmit={async event => {
              event.preventDefault()

              // get elements from the form using their id attribute
              // const { fieldset, greeting } = event.target.elements

              // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
              // const newGreeting = greeting.value

              // disable the form while the value gets updated on-chain
              fieldset.disabled = true

              try {
                await window.contract.nft_mint(
                  {
                    receiver_id: window.accountId,
                    token_id: `${Date.now()}${window.accountId}${Math.floor(Math.random() * 10)}`,
                    metadata: {
                      title: 'Exclusive NearMan',
                      media: IMAGE_LINK,
                      copies: 1
                    }
                  }, '100000000000000', '10000000000000000000000')
              } catch (e) {
                alert(
                  'Something went wrong! ' +
                  'Maybe you need to sign out and back in? ' +
                  'Check your browser console for more info.'
                )
                throw e
              } finally {
                // re-enable the form, whether the call succeeded or failed
                fieldset.disabled = false
              }
              // show Notification
              setShowNotification(true)

              // remove Notification again after css animation completes
              // this allows it to be shown again next time the form is submitted
              setTimeout(() => {
                setShowNotification(false)
              }, 11000)
            }}>
              <fieldset id="fieldset">
                  <button
                    disabled={buttonDisabled}
                  >
                    Mint
                  </button>
              </fieldset>
            </form>
          </div>
          <div className="after">
            <p>Please find your new NFT in your <a target="_blank" rel="noreferrer" href="https://wallet.testnet.near.org/?tab=collectibles">wallet</a></p>
          </div>
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'nft_mint' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>??? Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
