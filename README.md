# Verve

Embedded smart wallets using AA + ZK Compression

[X/Twitter](https://x.com/verve_wallet)

## Program

The base program logic is implemented inside the `program` directory.

We have a proof-of-concept that shows smart account creation and token transfer between two smart accounts.

### Run Program examples

```
cd program
yarn
yarn test
```

## ZK Compression

The ZK compressed program lies within the `compressed-program` directory.

Thanks to ZK compression, we can reduce costs of creating accounts and assigning new guardians down to the cost of transaction fees.

The ZK compressed program will be used as the main implementation in Verve wallet.

The base program exists merely as a way to test new features, before moving them into the ZK program.

### Run ZK Compression examples

You need to have `@lightprotocol/zk-compression-cli`, version `0.19.0` installed globally.

```
cd compressed-program
yarn
yarn test
```

## Web projects

The `frontend`, `example`, and `backend` projects show a simplified example of how Verve can work using cross-origin iframes and the postMessage API.

All parts are in active development, and may not always work until we merge in changes from our core programs.

### Running these

1. In one terminal, start a **fresh** local Solana validator:
   ```sh
   solana-test-validator --reset
   ```

2. In another terminal, deploy the program by using `anchor test` (it runs some additional scripts):
   ```sh
   cd program
   yarn #install dependencies if not present
   anchor test
   ```

3. In another terminal, start the backend signer service:
   ```sh
   cd backend
   yarn #install dependencies if not present
   yarn dev
   ```

4. In another terminal, start the wallet frontend:
   ```sh
   cd frontend
   yarn #install dependencies if not present
   yarn dev
   ```

5. Finally, in yet another terminal, start the sample dApp:
   ```sh
   cd example
   yarn #install dependencies if not present
   yarn dev
   ```

6. Now, navigate to `http://localhost:3001` and have fun.