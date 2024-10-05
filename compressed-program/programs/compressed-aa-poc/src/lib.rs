/// 👽👽👽👽👽👽👽👽👽
/// A Y Y  L M A O    
/// 👽👽👽👽👽👽👽👽👽
/// VIVA LA ZK COMPRESSION
/// 👽👽👽👽👽👽👽👽👽
use anchor_lang::prelude::*;
use light_sdk::{
    compressed_account::LightAccount, light_account, light_accounts, light_program,
    merkle_context::PackedAddressMerkleContext,
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const PDA_WALLET_SEED: &[u8; 1] = b"w";
const PDA_WALLET_GUARDIAN_SEED: &[u8; 2] = b"wg";

#[light_program]
#[program]
pub mod compressed_aa_poc {
    use anchor_lang::solana_program::instruction::Instruction;

    use super::*;

    pub fn test_transaction<'info>(
        ctx: Context<'_, '_, '_, 'info, TestTransaction<'info>>,
    ) -> Result<()> {
        msg!("Test tx signer: {}", ctx.accounts.signer.key());

        msg!("Hello World!");

        Ok(())
    }

    pub fn init_wallet<'info>(
        ctx: LightContext<'_, '_, '_, 'info, InitWallet<'info>>,
    ) -> Result<()> {
        ctx.light_accounts.wallet_guardian.wallet = ctx.accounts.wallet.key();
        ctx.light_accounts.wallet_guardian.guardian = ctx.accounts.assign_guardian.key();

        msg!(
            "Wallet {} has been initialized with guardian: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.assign_guardian.key()
        );

        Ok(())
    }

    pub fn register_keypair<'info>(
        ctx: LightContext<'_, '_, '_, 'info, RegisterKeypair<'info>>,
    ) -> Result<()> {
        ctx.light_accounts.wallet_guardian.guardian = ctx.accounts.assign_guardian.key();
        ctx.light_accounts.wallet_guardian.wallet = ctx.accounts.wallet.key();

        msg!(
            "Wallet {} has new guardian: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.assign_guardian.key()
        );

        Ok(())
    }

    pub fn exec_instruction<'info>(
        ctx: LightContext<'_, '_, '_, 'info, ExecInstruction<'info>>,
        instruction_data: Vec<u8>,
    ) -> Result<()> {
        require!(
            ctx.accounts
                .guardian
                .key()
                .eq(&ctx.light_accounts.wallet_guardian.guardian.key()),
            AaError::GuardianMismatch
        );

        require!(
            ctx.accounts
                .wallet
                .key()
                .eq(&ctx.light_accounts.wallet_guardian.wallet.key()),
            AaError::GuardianMismatch
        );

        msg!("Executing tx for AA wallet: {}", ctx.accounts.wallet.key());
        msg!("Tx approved by: {}", ctx.accounts.guardian.key());

        let instruction = Instruction {
            accounts: ctx.accounts.wallet.to_account_metas(Some(true)).to_vec(),
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

        anchor_lang::solana_program::program::invoke_signed(
            &instruction,
            &[ctx.accounts.wallet.to_account_info()],
            signer_seeds,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct TestTransaction<'info> {
    /// CHECK: Just checking bro
    #[account()]
    pub signer: Signer<'info>,
}

#[light_account]
#[derive(Clone, Debug, Default)]
pub struct WalletGuardian {
    #[truncate]
    pub wallet: Pubkey,
    #[truncate]
    pub guardian: Pubkey,
}

#[light_accounts]
pub struct InitWallet<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        seeds=[PDA_WALLET_SEED, assign_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[light_account(
        init,
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), assign_guardian.key().as_ref()],
    )]
    pub wallet_guardian: LightAccount<WalletGuardian>,

    #[account()]
    pub assign_guardian: Signer<'info>,

    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::CompressedAaPoc>,
    /// CHECK: Checked in light-system-program.
    #[authority]
    pub cpi_signer: AccountInfo<'info>,
}

#[light_accounts]
pub struct RegisterKeypair<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        seeds=[PDA_WALLET_SEED, assign_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[light_account(
        init,
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), assign_guardian.key().as_ref()],
    )]
    pub wallet_guardian: LightAccount<WalletGuardian>,

    /// CHECK: we merely assign a new account as a guardian, no checks required
    #[account()]
    pub assign_guardian: AccountInfo<'info>,

    #[account()]
    pub seed_guardian: Signer<'info>,

    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::CompressedAaPoc>,
    /// CHECK: Checked in light-system-program.
    #[authority]
    pub cpi_signer: AccountInfo<'info>,
}

#[light_accounts]
pub struct ExecInstruction<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[light_account(
        init,
        seeds=[PDA_WALLET_GUARDIAN_SEED, wallet.key().as_ref(), guardian.key().as_ref()],
    )]
    pub wallet_guardian: LightAccount<WalletGuardian>,

    /// CHECK: we use this to determine the account we're invoking for.
    /// The actual access check happens using wallet_guardian.
    #[account()]
    pub seed_guardian: AccountInfo<'info>,

    #[account()]
    pub guardian: Signer<'info>,

    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::CompressedAaPoc>,
    /// CHECK: Checked in light-system-program.
    #[authority]
    pub cpi_signer: AccountInfo<'info>,
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
