use std::mem::size_of;

use anchor_lang::prelude::*;

declare_id!("7UD7pBcVkw2yJQzdm9eNTfeSC8uo2WhM6MdUzBXK48zv");

const PDA_WALLET_SEED: &[u8; 1] = b"w";
const PDA_WALLET_GUARDIAN_SEED: &[u8; 2] = b"wg";

const CHALLENGE: &[u8] = b"Hello!";

/// PDA derivation
/// wallet: PDA_WALLET_SEED, guardian(original)
/// wallet_guardian: PDA_WALLET_GUARDIAN_SEED, wallet, guardian(original or new, depending on situation)

#[program]
pub mod aa_poc {
    use anchor_lang::solana_program::{
        instruction::Instruction,
        secp256k1_recover::{secp256k1_recover, Secp256k1Pubkey},
    };
    use tiny_keccak::{Hasher, Sha3};

    use super::*;

    pub fn test_transaction(_ctx: Context<TestTransaction>) -> Result<()> {
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

    pub fn exec_instruction(
        ctx: Context<ExecInstruction>,
        instruction_data: Vec<u8>,
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
            AaError::GuardianMismatch
        );

        msg!("Executing tx for AA wallet: {}", ctx.accounts.wallet.key());
        msg!("Tx approved by: {}", ctx.accounts.guardian.key());

        let instruction = Instruction {
            accounts: [].to_vec(),
            data: instruction_data,
            program_id: ctx.remaining_accounts[0].key(),
        };
        let seeds = [&PDA_WALLET_SEED[..], &[ctx.bumps.wallet][..]];
        let signer_seeds = &[&seeds[..]];

        // let cpi_accounts = anchor_lang::context::CpiContext::new(
        //     ctx.accounts.target_program.to_account_info(),
        //     ctx.accounts.target_program.to_account_info(),
        // );

        // anchor_lang::solana_program::program::invoke(&instruction, ctx.remaining_accounts)?;

        anchor_lang::solana_program::program::invoke_signed(
            &instruction,
            ctx.remaining_accounts,
            signer_seeds,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct TestTransaction {}

#[derive(Accounts)]
pub struct VerifyEcdsa {}

#[derive(Accounts)]
pub struct InitWallet<'info> {
    #[account(
        init,
        payer=payer,
        space=size_of::<Wallet>() + 8,
        seeds=[PDA_WALLET_SEED, assign_guardian.key().as_ref()],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

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
    #[account(
        mut,
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

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
    #[account(
        mut,
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

    #[account(
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), guardian.key().as_ref()],
        bump
    )]
    pub wallet_guardian: Account<'info, WalletGuardian>,

    /// CHECK: we merely assign a new account as a guardian, no checks required
    #[account()]
    pub seed_guardian: AccountInfo<'info>,

    #[account()]
    pub guardian: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Wallet {}

#[account]
pub struct WalletGuardian {
    pub wallet: Pubkey,
    pub guardian: Pubkey,
}

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
