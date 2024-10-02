# Verve

## Program

The base program logic is implemented inside the `program` directory.

## ZK Compression

The ZK compressed program lies within the `compressed-program` directory.

Thanks to ZK compression, we can reduce costs of creating accounts and assigning new guardians down to 0.01 cents (0.0001 USD).

The ZK compressed program will be used as the main implementation in Verve wallet.

The base program exists merely as a simpler way to test new features, before merging them into the ZK program.

Swen, give us a `#[light_instruction]` macro pls bro.

## How to run this

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
   cd app-one
   yarn #install dependencies if not present
   yarn dev
   ```

6. Now, navigate to `http://localhost:3001` and have fun.