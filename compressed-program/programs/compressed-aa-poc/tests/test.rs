// #![cfg(feature = "test-sbf")]

// use anchor_lang::{AnchorDeserialize, InstructionData, ToAccountMetas};
// use light_client::indexer::test_indexer::TestIndexer;
// use light_client::indexer::{AddressMerkleTreeAccounts, Indexer, StateMerkleTreeAccounts};
// use light_client::rpc::merkle_tree::MerkleTreeExt;
// use light_client::rpc::test_rpc::ProgramTestRpcConnection;
// use light_sdk::address::{derive_address, derive_address_seed};
// use light_sdk::compressed_account::CompressedAccountWithMerkleContext;
// use light_sdk::merkle_context::{
//     pack_address_merkle_context, pack_merkle_context, AddressMerkleContext, MerkleContext,
//     PackedAddressMerkleContext, PackedMerkleContext, RemainingAccounts,
// };
// use light_sdk::utils::get_cpi_authority_pda;
// use light_sdk::verify::find_cpi_signer;
// use light_sdk::{PROGRAM_ID_ACCOUNT_COMPRESSION, PROGRAM_ID_LIGHT_SYSTEM, PROGRAM_ID_NOOP};
// use light_test_utils::test_env::{setup_test_programs_with_accounts_v2, EnvAccounts};
// use light_test_utils::{RpcConnection, RpcError};
// use compressed_aa_poc::CounterCompressedAccount;
// use solana_sdk::instruction::Instruction;
// use solana_sdk::pubkey::Pubkey;
// use solana_sdk::signature::{Keypair, Signer};
// use solana_sdk::transaction::Transaction;

// #[tokio::test]
// async fn test() {
//     let (mut rpc, env) = setup_test_programs_with_accounts_v2(Some(vec![(
//         String::from("compressed_aa_poc"),
//         compressed_aa_poc::ID,
//     )]))
//     .await;
//     let payer = rpc.get_payer().insecure_clone();

//     let mut test_indexer: TestIndexer<ProgramTestRpcConnection> = TestIndexer::new(
//         &[StateMerkleTreeAccounts {
//             merkle_tree: env.merkle_tree_pubkey,
//             nullifier_queue: env.nullifier_queue_pubkey,
//             cpi_context: env.cpi_context_account_pubkey,
//         }],
//         &[AddressMerkleTreeAccounts {
//             merkle_tree: env.address_merkle_tree_pubkey,
//             queue: env.address_merkle_tree_queue_pubkey,
//         }],
//         true,
//         true,
//     )
//     .await;

//     let mut remaining_accounts = RemainingAccounts::default();

//     let merkle_context = MerkleContext {
//         merkle_tree_pubkey: env.merkle_tree_pubkey,
//         nullifier_queue_pubkey: env.nullifier_queue_pubkey,
//         leaf_index: 0,
//         queue_index: None,
//     };
//     let merkle_context = pack_merkle_context(merkle_context, &mut remaining_accounts);

//     let address_merkle_context = AddressMerkleContext {
//         address_merkle_tree_pubkey: env.address_merkle_tree_pubkey,
//         address_queue_pubkey: env.address_merkle_tree_queue_pubkey,
//     };

//     let address_seed = derive_address_seed(
//         &[b"counter", payer.pubkey().as_ref()],
//         &compressed_aa_poc::ID,
//         &address_merkle_context,
//     );
//     let address = derive_address(&address_seed, &address_merkle_context);

//     let address_merkle_context =
//         pack_address_merkle_context(address_merkle_context, &mut remaining_accounts);

//     create_account(
//         &mut rpc,
//         &mut test_indexer,
//         &env,
//         &mut remaining_accounts,
//         &payer,
//         &address,
//         &merkle_context,
//         &address_merkle_context,
//     )
//     .await
//     .unwrap();

//     // Check that it was created correctly.
//     let compressed_accounts = test_indexer.get_compressed_accounts_by_owner(&compressed_aa_poc::ID);
//     assert_eq!(compressed_accounts.len(), 1);
//     let compressed_account = &compressed_accounts[0];
//     let counter_account = &compressed_account
//         .compressed_account
//         .data
//         .as_ref()
//         .unwrap()
//         .data;
//     let counter_account = CounterCompressedAccount::deserialize(&mut &counter_account[..]).unwrap();
//     assert_eq!(counter_account.owner, payer.pubkey());
//     assert_eq!(counter_account.counter, 0);

//     increment(
//         &mut rpc,
//         &mut test_indexer,
//         &mut remaining_accounts,
//         &payer,
//         compressed_account,
//         &address_merkle_context,
//     )
//     .await
//     .unwrap();


//     // Check that it was updated correctly.
//     let compressed_accounts = test_indexer.get_compressed_accounts_by_owner(&compressed_aa_poc::ID);
//     assert_eq!(compressed_accounts.len(), 1);
//     let compressed_account = &compressed_accounts[0];
//     let counter_account = &compressed_account
//         .compressed_account
//         .data
//         .as_ref()
//         .unwrap()
//         .data;
//     let counter_account = CounterCompressedAccount::deserialize(&mut &counter_account[..]).unwrap();
//     assert_eq!(counter_account.owner, payer.pubkey());
//     assert_eq!(counter_account.counter, 1);

//     delete_account(
//         &mut rpc,
//         &mut test_indexer,
//         &mut remaining_accounts,
//         &payer,
//         compressed_account,
//         &address_merkle_context,
//     )
//     .await
//     .unwrap();
// }

// async fn create_account<R>(
//     rpc: &mut R,
//     test_indexer: &mut TestIndexer<R>,
//     env: &EnvAccounts,
//     remaining_accounts: &mut RemainingAccounts,
//     payer: &Keypair,
//     address: &[u8; 32],
//     merkle_context: &PackedMerkleContext,
//     address_merkle_context: &PackedAddressMerkleContext,
// ) -> Result<(), RpcError>
// where
//     R: RpcConnection + MerkleTreeExt,
// {
//     let account_compression_authority = get_cpi_authority_pda(&PROGRAM_ID_LIGHT_SYSTEM);
//     let registered_program_pda = Pubkey::find_program_address(
//         &[PROGRAM_ID_LIGHT_SYSTEM.to_bytes().as_slice()],
//         &PROGRAM_ID_ACCOUNT_COMPRESSION,
//     )
//     .0;
//     let rpc_result = test_indexer
//         .create_proof_for_compressed_accounts(
//             None,
//             None,
//             Some(&[*address]),
//             Some(vec![env.address_merkle_tree_pubkey]),
//             rpc,
//         )
//         .await;

//     let instruction_data = compressed_aa_poc::instruction::Create {
//         inputs: Vec::new(),
//         proof: rpc_result.proof,
//         merkle_context: *merkle_context,
//         merkle_tree_root_index: 0,
//         address_merkle_context: *address_merkle_context,
//         address_merkle_tree_root_index: rpc_result.address_root_indices[0],
//     };

//     let cpi_signer = find_cpi_signer(&compressed_aa_poc::ID);

//     let accounts = compressed_aa_poc::accounts::Create {
//         signer: payer.pubkey(),
//         light_system_program: PROGRAM_ID_LIGHT_SYSTEM,
//         account_compression_program: PROGRAM_ID_ACCOUNT_COMPRESSION,
//         account_compression_authority,
//         registered_program_pda,
//         noop_program: PROGRAM_ID_NOOP,
//         self_program: compressed_aa_poc::ID,
//         cpi_signer,
//         system_program: solana_sdk::system_program::id(),
//     };

//     let remaining_accounts = remaining_accounts.to_account_metas();

//     let instruction = Instruction {
//         program_id: compressed_aa_poc::ID,
//         accounts: [accounts.to_account_metas(Some(true)), remaining_accounts].concat(),
//         data: instruction_data.data(),
//     };

//     let event = rpc
//         .create_and_send_transaction_with_event(&[instruction], &payer.pubkey(), &[payer], None)
//         .await?;
//     test_indexer.add_compressed_accounts_with_token_data(&event.unwrap().0);
//     Ok(())
// }

// async fn increment<R>(
//     rpc: &mut R,
//     test_indexer: &mut TestIndexer<R>,
//     remaining_accounts: &mut RemainingAccounts,
//     payer: &Keypair,
//     compressed_account: &CompressedAccountWithMerkleContext,
//     address_merkle_context: &PackedAddressMerkleContext,
// ) -> Result<(), RpcError>
// where
//     R: RpcConnection + MerkleTreeExt,
// {
//     let account_compression_authority = get_cpi_authority_pda(&PROGRAM_ID_LIGHT_SYSTEM);
//     let registered_program_pda = Pubkey::find_program_address(
//         &[PROGRAM_ID_LIGHT_SYSTEM.to_bytes().as_slice()],
//         &PROGRAM_ID_ACCOUNT_COMPRESSION,
//     )
//     .0;
//     let hash = compressed_account.hash().unwrap();
//     let merkle_tree_pubkey = compressed_account.merkle_context.merkle_tree_pubkey;

//     let rpc_result = test_indexer
//         .create_proof_for_compressed_accounts(
//             Some(&[hash]),
//             Some(&[merkle_tree_pubkey]),
//             None,
//             None,
//             rpc,
//         )
//         .await;

//     let merkle_context = pack_merkle_context(compressed_account.merkle_context, remaining_accounts);

//     let inputs = vec![
//         compressed_account
//             .compressed_account
//             .data
//             .clone()
//             .unwrap()
//             .data,
//     ];

//     let instruction_data = compressed_aa_poc::instruction::Increment {
//         inputs,
//         proof: rpc_result.proof,
//         merkle_context,
//         merkle_tree_root_index: rpc_result.root_indices[0],
//         address_merkle_context: *address_merkle_context,
//         address_merkle_tree_root_index: 0,
//     };

//     let cpi_signer = find_cpi_signer(&compressed_aa_poc::ID);

//     let accounts = compressed_aa_poc::accounts::Increment {
//         signer: payer.pubkey(),
//         light_system_program: PROGRAM_ID_LIGHT_SYSTEM,
//         account_compression_program: PROGRAM_ID_ACCOUNT_COMPRESSION,
//         account_compression_authority,
//         registered_program_pda,
//         noop_program: PROGRAM_ID_NOOP,
//         self_program: compressed_aa_poc::ID,
//         cpi_signer,
//         system_program: solana_sdk::system_program::id(),
//     };

//     let remaining_accounts = remaining_accounts.to_account_metas();

//     let instruction = Instruction {
//         program_id: compressed_aa_poc::ID,
//         accounts: [accounts.to_account_metas(Some(true)), remaining_accounts].concat(),
//         data: instruction_data.data(),
//     };

//     let event = rpc
//         .create_and_send_transaction_with_event(&[instruction], &payer.pubkey(), &[payer], None)
//         .await?;
//     test_indexer.add_compressed_accounts_with_token_data(&event.unwrap().0);
//     Ok(())
// }

// async fn delete_account<R>(
//     rpc: &mut R,
//     test_indexer: &mut TestIndexer<R>,
//     remaining_accounts: &mut RemainingAccounts,
//     payer: &Keypair,
//     compressed_account: &CompressedAccountWithMerkleContext,
//     address_merkle_context: &PackedAddressMerkleContext,
// ) -> Result<(), RpcError>
// where
//     R: RpcConnection + MerkleTreeExt,
// {
//     let account_compression_authority = get_cpi_authority_pda(&PROGRAM_ID_LIGHT_SYSTEM);
//     let registered_program_pda = Pubkey::find_program_address(
//         &[PROGRAM_ID_LIGHT_SYSTEM.to_bytes().as_slice()],
//         &PROGRAM_ID_ACCOUNT_COMPRESSION,
//     )
//     .0;
//     let hash = compressed_account.hash().unwrap();
//     let merkle_tree_pubkey = compressed_account.merkle_context.merkle_tree_pubkey;

//     let rpc_result = test_indexer
//         .create_proof_for_compressed_accounts(
//             Some(&[hash]),
//             Some(&[merkle_tree_pubkey]),
//             None,
//             None,
//             rpc,
//         )
//         .await;

//     let merkle_context = pack_merkle_context(compressed_account.merkle_context, remaining_accounts);

//     let inputs = vec![
//         compressed_account
//             .compressed_account
//             .data
//             .clone()
//             .unwrap()
//             .data,
//     ];

//     let instruction_data = compressed_aa_poc::instruction::Delete {
//         inputs,
//         proof: rpc_result.proof,
//         merkle_context,
//         merkle_tree_root_index: rpc_result.root_indices[0],
//         address_merkle_context: *address_merkle_context,
//         address_merkle_tree_root_index: 0,
//     };

//     let cpi_signer = find_cpi_signer(&compressed_aa_poc::ID);

//     let accounts = compressed_aa_poc::accounts::Delete {
//         signer: payer.pubkey(),
//         light_system_program: PROGRAM_ID_LIGHT_SYSTEM,
//         account_compression_program: PROGRAM_ID_ACCOUNT_COMPRESSION,
//         account_compression_authority,
//         registered_program_pda,
//         noop_program: PROGRAM_ID_NOOP,
//         self_program: compressed_aa_poc::ID,
//         cpi_signer,
//         system_program: solana_sdk::system_program::id(),
//     };

//     let remaining_accounts = remaining_accounts.to_account_metas();

//     let instruction = Instruction {
//         program_id: compressed_aa_poc::ID,
//         accounts: [accounts.to_account_metas(Some(true)), remaining_accounts].concat(),
//         data: instruction_data.data(),
//     };

//     let transaction = Transaction::new_signed_with_payer(
//         &[instruction],
//         Some(&payer.pubkey()),
//         &[&payer],
//         rpc.get_latest_blockhash().await.unwrap(),
//     );
//     rpc.process_transaction(transaction).await?;
//     Ok(())
// }
