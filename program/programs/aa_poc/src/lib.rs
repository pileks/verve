use std::mem::size_of;

use anchor_lang::prelude::*;

declare_id!("7UD7pBcVkw2yJQzdm9eNTfeSC8uo2WhM6MdUzBXK48zv");

const PDA_WALLET_SEED: &[u8; 6] = b"wallet";

const CHALLENGE: &[u8] = b"Hello!";
#[program]
pub mod aa_poc {
    use anchor_lang::solana_program::{
        instruction::Instruction, secp256k1_recover::{secp256k1_recover, Secp256k1Pubkey},
    };
    use tiny_keccak::{Hasher, Sha3};

    use super::*;

    pub fn test_transaction(_ctx: Context<TestTransaction>) -> Result<()> {
        msg!("Hello World!");

        Ok(())
    }

    pub fn init_wallet(_ctx: Context<InitWallet>) -> Result<()> {
        Ok(())
    }

    pub fn register_keypair(ctx: Context<RegisterKeypair>) -> Result<()> {
        ctx.accounts.wallet.controller = ctx.accounts.signer.key();

        Ok(())
    }

    pub fn verify_ecdsa(
        _ctx: Context<JwtTest>,
        signature_bytes: Vec<u8>,
        recovery_param: u8,
        pubkey_bytes: Vec<u8>
    ) -> Result<()> {
        let mut sha3 = Sha3::v256();
        let mut output = [0u8; 32];
        sha3.update(CHALLENGE);
        sha3.finalize(&mut output);

        let expected_pubkey = Secp256k1Pubkey::new(&pubkey_bytes[1..65]);

        let actual_pubkey = secp256k1_recover(&output, recovery_param, &signature_bytes)
            .map_err(|_| AaError::InvalidSignature)?;

        require!(expected_pubkey.eq(&actual_pubkey), AaError::InvalidSignature);

        Ok(())
    }

    pub fn exec_instruction(
        ctx: Context<ExecInstruction>,
        instruction_data: Vec<u8>,
    ) -> Result<()> {
        // msg!("LEN {}", instruction_data.len());
        // msg!("PAYER {}", ctx.accounts.payer.key());
        // msg!("SIGNER {}", ctx.accounts.signer.key());

        require!(
            ctx.accounts
                .signer
                .key()
                .eq(&ctx.accounts.wallet.controller.key()),
            AaError::ControllerMismatch
        );

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
pub struct ExecuteTransaction<'info> {
    #[account()]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct TestTransaction {}

#[derive(Accounts)]
pub struct JwtTest {}

#[derive(Accounts)]
pub struct RegisterKeypair<'info> {
    #[account(
        mut,
        seeds=[PDA_WALLET_SEED],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecInstruction<'info> {
    #[account(
        mut,
        seeds=[PDA_WALLET_SEED],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

    #[account()]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    // pub system_program: Program<'info, System>,

    // CHECK: Just the program we're targetting, surely there's a better way
    // #[account(executable)]
    // pub target_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct InitWallet<'info> {
    #[account(
        init,
        payer=payer,
        space=size_of::<Wallet>() + 8,
        seeds=[PDA_WALLET_SEED],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Wallet {
    pub controller: Pubkey,
}

#[error_code]
pub enum AaError {
    #[msg("Controller mismatch")]
    ControllerMismatch,
    #[msg("Invalid token")]
    InvalidToken,
    #[msg("Invalid algorithm")]
    InvalidAlgorithm,
    #[msg("Invalid signature")]
    InvalidSignature,
}
