import { useEffect, useRef } from "react";

function App() {
  const isListening = useRef(false);

  useEffect(() => {
    if (isListening) {
      return;
    }

    window.addEventListener("message", (e) => {
      console.log("I can intercept this:", e);
    });
  }, []);

  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold">This is a dApp</h1>
          <span>The dApp can't read a cross-origin iframe.</span>
        </div>
        <div>
          <span className="font-medium">This is my wallet in an iframe:</span>
          <iframe className="w-full border border-black" src={`${import.meta.env.VITE_WALLET_URL}/embed`}></iframe>
        </div>
      </div>
    </div>
  );
}

export default App;
