use std::mem::size_of;

use anchor_lang::prelude::*;

declare_id!("7UD7pBcVkw2yJQzdm9eNTfeSC8uo2WhM6MdUzBXK48zv");

const PDA_WALLET_SEED: &[u8; 1] = b"w";
const PDA_WALLET_GUARDIAN_SEED: &[u8; 2] = b"wg";

const CHALLENGE: &[u8] = b"Hello!";

/// PDA derivation
/// wallet: PDA_WALLET_SEED, original_guardian_pubkey
/// wallet_guardian: PDA_WALLET_GUARDIAN_SEED, wallet, guardian_pubkey(original or any other)

#[program]
pub mod aa_poc {
    use anchor_lang::solana_program::{
        instruction::Instruction,
        secp256k1_recover::{secp256k1_recover, Secp256k1Pubkey},
    };
    use tiny_keccak::{Hasher, Sha3};

    use super::*;

    pub fn test_transaction(ctx: Context<TestTransaction>) -> Result<()> {
        msg!("Test tx signer: {}", ctx.accounts.signer.key());

        msg!("Hello World!");

        Ok(())
    }

    pub fn init_wallet(ctx: Context<InitWallet>) -> Result<()> {
        ctx.accounts.wallet_guardian.wallet = ctx.accounts.wallet.key();
        ctx.accounts.wallet_guardian.guardian = ctx.accounts.assign_guardian.key();

        msg!(
            "Wallet {} has been initialized with guardian: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.assign_guardian.key()
        );

        Ok(())
    }

    pub fn register_keypair(ctx: Context<RegisterKeypair>) -> Result<()> {
        ctx.accounts.wallet_guardian.guardian = ctx.accounts.assign_guardian.key();
        ctx.accounts.wallet_guardian.wallet = ctx.accounts.wallet.key();

        msg!(
            "Wallet {} has new guardian: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.assign_guardian.key()
        );

        Ok(())
    }

    pub fn exec_instruction<'info>(
        ctx: Context<'_, '_, '_, 'info, ExecInstruction<'info>>,
        instruction_data: Vec<u8>,
        account_keys: Vec<Pubkey>,
        is_writable_flags: Vec<bool>,
        is_signer_flags: Vec<bool>,
    ) -> Result<()> {
        require!(
            ctx.accounts
                .guardian
                .key()
                .eq(&ctx.accounts.wallet_guardian.guardian.key()),
            AaError::GuardianMismatch
        );

        require!(
            ctx.accounts
                .wallet
                .key()
                .eq(&ctx.accounts.wallet_guardian.wallet.key()),
            AaError::WalletMismatch
        );

        msg!(
            "Executing ix for AA wallet {}, approved by: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.guardian.key()
        );

        let mut account_metas: Vec<AccountMeta> = vec![];

        for (i, account_key) in account_keys.iter().enumerate() {
            let is_writable = is_writable_flags.get(i).cloned().unwrap_or(false);
            let is_signer = is_signer_flags.get(i).cloned().unwrap_or(false);

            let account_meta = if is_writable {
                AccountMeta::new(*account_key, is_signer)
            } else {
                AccountMeta::new_readonly(*account_key, is_signer)
            };

            account_metas.push(account_meta);
        }

        let instruction = Instruction {
            accounts: account_metas,
            data: instruction_data,
            program_id: ctx.remaining_accounts[0].key(),
        };

        let seed_guardian_key = ctx.accounts.seed_guardian.key();

        let seeds = [
            &PDA_WALLET_SEED[..],
            seed_guardian_key.as_ref(),
            &[ctx.bumps.wallet][..],
        ];

        let signer_seeds = &[&seeds[..]];

        // The 1st account in remaining_accounts is the program ID of the IX we're calling
        // we don't need that.
        let cpi_accounts: Vec<AccountInfo<'info>> = ctx.remaining_accounts[1..].to_vec();

        anchor_lang::solana_program::program::invoke_signed(
            &instruction,
            &cpi_accounts,
            signer_seeds,
        )?;

        Ok(())
    }

    // TODO: We can use this to verify secp256k1 signatures (might need for passkeys later on)
    pub fn verify_ecdsa(
        _ctx: Context<VerifyEcdsa>,
        signature_bytes: Vec<u8>,
        recovery_param: u8,
        pubkey_bytes: Vec<u8>,
    ) -> Result<()> {
        let mut sha3 = Sha3::v256();
        let mut output = [0u8; 32];
        sha3.update(CHALLENGE);
        sha3.finalize(&mut output);

        let expected_pubkey = Secp256k1Pubkey::new(&pubkey_bytes[1..65]);

        let actual_pubkey = secp256k1_recover(&output, recovery_param, &signature_bytes)
            .map_err(|_| AaError::InvalidSignature)?;

        require!(
            expected_pubkey.eq(&actual_pubkey),
            AaError::InvalidSignature
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitWallet<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        seeds=[PDA_WALLET_SEED, assign_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[account(
        init,
        payer=payer,
        space=size_of::<WalletGuardian>() + 8,
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), assign_guardian.key().as_ref()],
        bump
    )]
    pub wallet_guardian: Account<'info, WalletGuardian>,

    #[account()]
    pub assign_guardian: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterKeypair<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[account(
        init,
        payer=payer,
        space=size_of::<WalletGuardian>() + 8,
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), assign_guardian.key().as_ref()],
        bump
    )]
    pub wallet_guardian: Account<'info, WalletGuardian>,

    /// CHECK: we merely assign a new account as a guardian, no checks required
    #[account()]
    pub assign_guardian: AccountInfo<'info>,

    #[account()]
    pub seed_guardian: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecInstruction<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        mut,
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[account(
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), guardian.key().as_ref()],
        bump
    )]
    pub wallet_guardian: Account<'info, WalletGuardian>,

    /// CHECK: we use this to determine the account we're invoking for.
    /// The actual access check happens using wallet_guardian.
    #[account()]
    pub seed_guardian: AccountInfo<'info>,

    #[account()]
    pub guardian: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct WalletGuardian {
    pub wallet: Pubkey,
    pub guardian: Pubkey,
}

#[derive(Accounts)]
pub struct TestTransaction<'info> {
    /// CHECK: Just checking bro
    #[account()]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyEcdsa {}

#[error_code]
pub enum AaError {
    #[msg("Guardian mismatch")]
    GuardianMismatch,

    #[msg("Wallet mismatch")]
    WalletMismatch,

    #[msg("Invalid token")]
    InvalidToken,

    #[msg("Invalid algorithm")]
    InvalidAlgorithm,

    #[msg("Invalid signature")]
    InvalidSignature,
}
