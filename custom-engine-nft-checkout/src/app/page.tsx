"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractMetadata,
  MediaRenderer,
  ThirdwebProvider,
} from "@thirdweb-dev/react";

import { ThirdwebSDK } from "@thirdweb-dev/sdk";

import Image from 'next/image';
import fs from "fs"
import video from './image1.gif';

import './globals.css';
import basedBumsImage from './based-bums-pack-art 2 (1).png';

import React, { useEffect, useState, useRef } from "react";
const {
  WEBHOOK_SECRET_KEY,
  ENGINE_URL,
  ENGINE_ACCESS_TOKEN,
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
  BACKEND_WALLET_ADDRESS,
  THIRDWEB_SECRET_KEY,
  SDK_PRIVATE_KEY
} = process.env;



export default function Home() {
  return (
    <ThirdwebProvider
      activeChain="base"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >

      <PurchasePage />
      {/* <PurchasePage1 />
      <PurchasePage2 />
      <PurchasePage3 /> */}

    </ThirdwebProvider>
  );
}

interface ImageType {
  src: string;
}

interface CreditCardFormProps {
  onPaymentSuccess: () => Promise<void>;
}



function PurchasePage() {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    "edition"
  );
  const { data: contractMetadata } = useContractMetadata(contract);
  const [clientSecret, setClientSecret] = useState("");

  const onClick = async () => {
    const resp = await fetch("/api/stripe-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerWalletAddress: address,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
    // setShowGif(true);
    // // Assuming the GIF runs for 5 seconds (5000 ms)
    // setTimeout(handleGifEnd, 5000);
  };

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }
  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  const [showVideo, setShowVideo] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showGif, setShowGif] = useState(false);

  const handleMintingProcess = async () => {
    setShowGif(true);
    // Assuming the GIF runs for 5 seconds (5000 ms)
    await new Promise(resolve => setTimeout(resolve, 5000));

    setShowGif(false);
    setLoading(true);

    try {
      // Fetch random tokens
      const resp = await fetch("https://servergupta.sheikhstudios.live/api/random-tokens");
      if (!resp.ok) {
        console.error("Failed to fetch random tokens");
        throw new Error('Failed to fetch random tokens');
      }

      const json = await resp.json();
      setImages(json.images);

      // Collect all tokenIds in an array
      const tokenIds = json.images.map((img:any, index:any) => index); // Modify this logic based on how you want to generate tokenIds

      // Ensure we are sending an array of exactly three tokenIds
      if (tokenIds.length !== 3) {
        throw new Error('Invalid tokenIds format. Expected an array of three token IDs.');
      }

      // Claim NFTs
      const res = await fetch('http://sheikhstudios.live/api/generate', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json" // Set content type to application/json
        },
        body: JSON.stringify({
          address: address,
          tokenIds: tokenIds
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`Failed to claim NFTs: ${errorBody.message}`);
      }

      const responseBody = await res.json();
      console.log(`Claimed NFTs with tokenIds ${tokenIds.join(', ')}: `, responseBody);

      // Show success alert
      alert(`Successfully claimed NFTs with tokenIds ${tokenIds.join(', ')}`);
      alert('NFT MINTED');
    } catch (error) {
      console.error("Error during minting process: ", error);

      // Check if error is an instance of Error and use its message, otherwise default to a generic message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert("Error during minting process: " + errorMessage); // Show error alert
    } finally {
      setLoading(false);
    }
  };






  return (
    <div className="App">
      <ConnectWallet className={!address ? "cbtn" : "cbtn cbtn1"} />


      <div className="container">
        <div className="card-pack">
          <div className="image-column">
            <Image
              src={basedBumsImage} // Use the imported image
              alt="Based Bums Summer Collection"
              className="card-image"
              layout="responsive" // Example of optimizing the image
            />
            {loading && <p>Loading...</p>}
          </div>
          <div className="details-column">
            <h2>Summer Collection Pack (3 Cards)</h2>
            <p>
              Celebrate Onchain Summer by collecting the inaugural set of Based
              Bums Onchain Trading Cards! <br></br>
              Each pack contains 3 cards (2 Based
              and 1 Super Based card). Collecting the full set (20 cards) <br></br>unlocks
              a free set of IRL cards (+S/H).
            </p>
            <div className="purchase-options">
              <div className="quantity-selector">
                <label htmlFor="quantity">Pack/s</label>
                <input type="number" id="quantity" name="quantity" min="1" defaultValue="1" />
              </div>
              {!clientSecret ? (
                <button
                  className="pay-button"
                  onClick={onClick}
                  disabled={!address}
                >
                  Buy with credit card
                </button>
              ) : (
                <Elements
                  options={{
                    clientSecret,
                    appearance: { theme: "night" },
                  }}
                  stripe={stripe}
                >
                 <CreditCardForm onPaymentSuccess={handleMintingProcess} />
                </Elements>
              )}
              {/* <button className="crypto-button" onClick={onClickCrypto}>Pay with Crypto</button> */}

            </div>
          </div>
        </div>
        <div className="horizontal-center">
          {showGif ? (
            <Image
              src={video}
              alt="Loading GIF"
              width={640}
              height={360}
            />
          ):""}
          {loading && <p>Loading...</p>}
          {!loading && images.map((imgSrc, index) => (
            <Image key={index} src={imgSrc} alt={`NFT ${index}`} width={200} height={200} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PurchasePage1() {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    "edition"
  );
  const { data: contractMetadata } = useContractMetadata(contract);
  const [clientSecret, setClientSecret] = useState("");

  const onClick = async () => {
    const resp = await fetch("/api/stripe-intent1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerWalletAddress: address,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
  };

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }
  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="flex flex-col gap-y-8 items-center p-12 mt-6">

      {contractMetadata && (
        <div className="flex flex-col gap-8 border border-gray-700 rounded-xl p-12">
          <MediaRenderer
            className="rounded-lg"
            src={"https://ildattero.com/wp-content/uploads/2024/01/Dimond.mp4"}
          />

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold">Asso Di Quadri</h2>
            <p className="text-gray-500">
              12% annual returns in USDT
            </p>
            <br />
            <h2>2500 Euro</h2>
          </div>

          {!clientSecret ? (
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={onClick}
              disabled={!address}
            >
              Buy with credit card
            </button>
          ) : (
            <Elements
              options={{
                clientSecret,
                appearance: { theme: "night" },
              }}
              stripe={stripe}
            >
              <CreditCardForm1 />
            </Elements>
          )}
        </div>
      )}
    </main>
  );

}

function PurchasePage2() {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    "edition"
  );
  const { data: contractMetadata } = useContractMetadata(contract);
  const [clientSecret, setClientSecret] = useState("");

  const onClick = async () => {
    const resp = await fetch("/api/stripe-intent2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerWalletAddress: address,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
  };

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }
  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="flex flex-col gap-y-8 items-center p-12 mt-6">
      {contractMetadata && (
        <div className="flex flex-col gap-8 border border-gray-700 rounded-xl p-12">
          <MediaRenderer
            className="rounded-lg"
            src={"https://ildattero.com/wp-content/uploads/2024/01/Spade.mp4"}
          />

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold">Asso Di Picche </h2>
            <p className="text-gray-500">
              12% annual returns in USDT
            </p>
            <br />
            <h2>500 Euro</h2>
          </div>

          {!clientSecret ? (
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={onClick}
              disabled={!address}
            >
              Buy with credit card
            </button>
          ) : (
            <Elements
              options={{
                clientSecret,
                appearance: { theme: "night" },
              }}
              stripe={stripe}
            >
              <CreditCardForm2 />
            </Elements>
          )}
        </div>
      )}
    </main>
  );
}

function PurchasePage3() {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    "edition"
  );
  const { data: contractMetadata } = useContractMetadata(contract);
  const [clientSecret, setClientSecret] = useState("");

  const onClick = async () => {
    const resp = await fetch("/api/stripe-intent3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerWalletAddress: address,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
  };

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }
  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="flex flex-col gap-y-8 items-center p-12 mt-6">
      {contractMetadata && (
        <div className="flex flex-col gap-8 border border-gray-700 rounded-xl p-12">
          <MediaRenderer
            className="rounded-lg"
            src={"https://ildattero.com/wp-content/uploads/2024/01/Club.mp4"}
          />

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold">Asso Di Fiori </h2>
            <p className="text-gray-500">
              12% annual returns in USDT
            </p>
            <br />
            <h2>1000 Euro</h2>
          </div>

          {!clientSecret ? (
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={onClick}
              disabled={!address}
            >
              Buy with credit card
            </button>
          ) : (
            <Elements
              options={{
                clientSecret,
                appearance: { theme: "night" },
              }}
              stripe={stripe}
            >
              <CreditCardForm3 />
            </Elements>
          )}
        </div>
      )}
    </main>
  );
}


const CreditCardForm: React.FC<CreditCardFormProps> = ({ onPaymentSuccess }) => {
  const address = useAddress();
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://alpha-check-out.vercel.app/",
        },
        redirect: "if_required",
      });

      if (error) {
        throw error.message;
      }

      if (paymentIntent.status === "succeeded") {
        console.log(address);
        await onPaymentSuccess(); // Call the function passed from parent component
        setIsCompleted(true);
      } else {
        console.log("Payment failed. Please try again.");
        alert("Payment failed. Please try again.");
      }
    } catch (e) {
      console.log(`There was an error with the payment. ${e}`);
      alert(`There was an error with the payment. ${e}`);
    }

    setIsLoading(false);
  };

  return (
    <>
      <PaymentElement />
      <button
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full"
        onClick={onClick}
        disabled={isLoading || isCompleted || !stripe || !elements}
      >
        {isCompleted ? "Payment received" : isLoading ? "Please wait..." : "Pay now"}
      </button>
    </>
  );
};

const CreditCardForm1 = () => {

  const address = useAddress();
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://alpha-check-out.vercel.app/",
        },
        redirect: "if_required",
      });

      if (error) {
        // alert(error)
        throw error.message;
      }

      if (paymentIntent.status === "succeeded") {

        const res = await fetch('https://alpha.riposoconcept.com/api/generate', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json" // Set content type to text/plain
          },
          body: JSON.stringify({
            address: address,
            tokenId: 1
          }),
        });
        if (res.ok) {
          alert("nft minted")
        }

        setIsCompleted(true);

      } else {
        console.log("Payment failed. Please try again.");
        alert(error)
      }
    } catch (e) {
      console.log(`There was an error with the payment. ${e}`);
      alert(`There was an error with the payment. ${e}`)
    }


    setIsLoading(false);
  };

  return (
    <>
      <PaymentElement />

      <button
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full"
        onClick={onClick}
        disabled={isLoading || isCompleted || !stripe || !elements}
      >
        {isCompleted
          ? "Payment received"
          : isLoading
            ? "Please wait..."
            : "Pay now"}
      </button>
    </>
  );
};

const CreditCardForm2 = () => {

  const address = useAddress();
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://alpha-check-out.vercel.app/",
        },
        redirect: "if_required",
      });

      if (error) {
        // alert(error)
        throw error.message;
      }

      if (paymentIntent.status === "succeeded") {

        const res = await fetch('https://alpha.riposoconcept.com/api/generate', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json" // Set content type to text/plain
          },
          body: JSON.stringify({
            address: address,
            tokenId: 2
          }),
        });
        console.log("res is ", res)
        // alert(res)

        if (res.ok) {
          alert("nft minted")
        }

        setIsCompleted(true);

      } else {
        console.log("Payment failed. Please try again.");
        alert(error)
      }
    } catch (e) {
      console.log(`There was an error with the payment. ${e}`);
      alert(`There was an error with the payment. ${e}`)
    }


    setIsLoading(false);
  };

  return (
    <>
      <PaymentElement />

      <button
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full"
        onClick={onClick}
        disabled={isLoading || isCompleted || !stripe || !elements}
      >
        {isCompleted
          ? "Payment received"
          : isLoading
            ? "Please wait..."
            : "Pay now"}
      </button>
    </>
  );
};

const CreditCardForm3 = () => {

  const address = useAddress();
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://alpha-check-out.vercel.app/",
        },
        redirect: "if_required",
      });

      if (error) {
        // alert(error)
        throw error.message;
      }

      if (paymentIntent.status === "succeeded") {
        console.log("juieduiegewgfewgufyfywefytwefdt")

        const res = await fetch('https://alpha.riposoconcept.com/api/generate', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json" // Set content type to text/plain
          },
          body: JSON.stringify({
            address: address,
            tokenId: 3
          }),
        });
        if (res.ok) {
          alert("nft minted")
        }

        setIsCompleted(true);

      } else {
        console.log("Payment failed. Please try again.");
        alert(error)
      }
    } catch (e) {
      console.log(`There was an error with the payment. ${e}`);
      alert(`There was an error with the payment. ${e}`)
    }


    setIsLoading(false);
  };

  return (
    <>
      <PaymentElement />

      <button
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full"
        onClick={onClick}
        disabled={isLoading || isCompleted || !stripe || !elements}
      >
        {isCompleted
          ? "Payment received"
          : isLoading
            ? "Please wait..."
            : "Pay now"}
      </button>
    </>
  );
};