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

declare_id!("Y3Fdm2T4ipYdaFBKxQb8M4QE8EgpxWAMa7c3q72vQhn");

const PDA_WALLET_SEED: &[u8; 1] = b"w";
const PDA_WALLET_GUARDIAN_SEED: &[u8; 2] = b"wg";

#[light_program]
#[program]
pub mod compressed_aa_poc {
    use super::*;
    use anchor_lang::solana_program::{instruction::Instruction, program::invoke_signed};

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
        account_keys: Vec<Pubkey>,
        is_writable_flags: Vec<bool>,
        is_signer_flags: Vec<bool>,
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
            AaError::WalletMismatch
        );

        msg!(
            "Executing tx for AA wallet {}, approved by: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.guardian.key()
        );

        let mut account_metas: Vec<AccountMeta> = vec![];

        for (i, account_key) in account_keys.iter().enumerate() {
            let is_writable: bool = is_writable_flags.get(i).cloned().unwrap_or(false);
            let is_signer: bool = is_signer_flags.get(i).cloned().unwrap_or(false);

            let account_meta: AccountMeta = if is_writable {
                AccountMeta::new(*account_key, is_signer)
            } else {
                AccountMeta::new_readonly(*account_key, is_signer)
            };

            account_metas.push(account_meta);
        }

        let instruction = Instruction {
            accounts: account_metas,
            data: instruction_data,
            program_id: ctx.remaining_accounts[4].key(),
        };

        let seed_guardian_key: Pubkey = ctx.accounts.seed_guardian.key();

        let seeds: [&[u8]; 3] = [
            &PDA_WALLET_SEED[..],
            seed_guardian_key.as_ref(),
            &[ctx.bumps.wallet][..],
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        let cpi_accounts: Vec<AccountInfo<'info>> = ctx.remaining_accounts[5..].to_vec();

        invoke_signed(&instruction, &cpi_accounts, signer_seeds)?;

        Ok(())
    }

    pub fn exec_instruction_alt<'info>(
        ctx: LightContext<'_, '_, '_, 'info, ExecInstructionAlt<'info>>,
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
            AaError::WalletMismatch
        );

        msg!(
            "Executing tx for AA wallet {}, approved by: {}",
            ctx.accounts.wallet.key(),
            ctx.accounts.guardian.key()
        );

        let verve_instruction: VerveInstruction =
            VerveInstruction::try_from_slice(&instruction_data)?;

        let mut account_metas: Vec<AccountMeta> = vec![];

        for (i, account_index) in verve_instruction.account_indices.iter().enumerate() {
            let account_key: Pubkey = ctx.remaining_accounts[*account_index as usize].key();
            let is_writable: bool = verve_instruction.writable_accounts[i];
            let is_signer: bool = verve_instruction.signer_accounts[i];

            let account_meta: AccountMeta = if is_writable {
                AccountMeta::new(account_key, is_signer)
            } else {
                AccountMeta::new_readonly(account_key, is_signer)
            };

            account_metas.push(account_meta);
        }

        let program_account_index: &u8 = &verve_instruction.program_account_index;

        let instruction: Instruction = Instruction {
            accounts: account_metas,
            data: verve_instruction.data,
            program_id: ctx.remaining_accounts[*program_account_index as usize].key(),
        };

        let seed_guardian_key: Pubkey = ctx.accounts.seed_guardian.key();

        let seeds: [&[u8]; 3] = [
            &PDA_WALLET_SEED[..],
            seed_guardian_key.as_ref(),
            &[ctx.bumps.wallet][..],
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        let cpi_accounts: Vec<AccountInfo<'info>> =
            ctx.remaining_accounts[*program_account_index as usize + 1..].to_vec();

        invoke_signed(&instruction, &cpi_accounts, signer_seeds)?;

        Ok(())
    }

    pub fn generate_idl_types_noop(_ctx: Context<GenerateIdls>, _types: Types) -> Result<()> {
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
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
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
        mut,
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

#[light_accounts]
pub struct ExecInstructionAlt<'info> {
    /// CHECK: No need to have this account initialized lol
    #[account(
        seeds=[PDA_WALLET_SEED, seed_guardian.key().as_ref()],
        bump
    )]
    pub wallet: AccountInfo<'info>,

    #[light_account(
        mut,
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

#[derive(Accounts)]
pub struct GenerateIdls {}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct Types {
    wallet_guardian: WalletGuardian,
    verve_instruction: VerveInstruction,
}

#[error_code]
pub enum AaError {
    #[msg("Guardian mismatch")]
    GuardianMismatch,

    #[msg("Wallet mismatch")]
    WalletMismatch,

    #[msg("Invalid guardian signature")]
    InvalidGuardianSignature,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct VerveInstruction {
    pub data: Vec<u8>,
    pub account_indices: Vec<u8>,
    pub writable_accounts: Vec<bool>,
    pub signer_accounts: Vec<bool>,
    pub program_account_index: u8,
}

mod shared {
    use crate::AaError;
    use anchor_lang::prelude::*;
    use anchor_lang::solana_program::{
        ed25519_program, instruction::Instruction, program::invoke, sysvar::recent_blockhashes,
    };
    use ed25519_dalek::{Signature, Verifier, VerifyingKey};

    pub fn _verify_ix_signature(
        pubkey: &Pubkey,
        message: &[u8],
        signature: &[u8; 64],
    ) -> Result<()> {
        let dalek_pubkey: VerifyingKey = VerifyingKey::from_bytes(&pubkey.to_bytes())
            .map_err(|_| ProgramError::InvalidArgument)?;

        let dalek_signature: Signature = Signature::from_bytes(signature);

        match dalek_pubkey.verify(message, &dalek_signature) {
            Ok(_) => Ok(()),
            Err(_) => Err(error!(AaError::InvalidGuardianSignature)),
        }
    }

    pub fn _verify_ix_signature_cpi(
        pubkey: &Pubkey,
        message: &[u8],
        signature: &[u8; 64],
        recent_blockhashes_account: &AccountInfo,
    ) -> Result<()> {
        let message_len: u32 = message.len() as u32;

        // signature + pubkey + message length in le + length of the message itself
        let mut instruction_data: Vec<u8> = Vec::with_capacity(64 + 32 + 4 + message.len());

        instruction_data.extend_from_slice(signature);
        instruction_data.extend_from_slice(&pubkey.to_bytes());
        instruction_data.extend_from_slice(&message_len.to_le_bytes());
        instruction_data.extend_from_slice(message);

        let instruction: Instruction = Instruction {
            program_id: ed25519_program::ID,
            accounts: vec![AccountMeta::new_readonly(recent_blockhashes::ID, false)],
            data: instruction_data,
        };

        match invoke(&instruction, &[recent_blockhashes_account.clone()]) {
            Ok(_) => Ok(()),
            Err(_) => Err(error!(AaError::InvalidGuardianSignature)),
        }
    }
}
