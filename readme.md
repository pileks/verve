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