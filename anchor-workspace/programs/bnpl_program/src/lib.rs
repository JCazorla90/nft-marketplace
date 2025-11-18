use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("BnplProgram1111111111111111111111111111111111");

#[program]
pub mod bnpl_program {
    use super::*;

    pub fn initialize_admin(ctx: Context<InitializeAdmin>, platform_fee_bps: u16) -> Result<()> {
        let config = &mut ctx.accounts.admin_config;
        config.admin = *ctx.accounts.admin.key;
        config.platform_fee_bps = platform_fee_bps;
        Ok(())
    }

    pub fn create_loan(ctx: Context<CreateLoan>, total_amount: u64, installments: u8, schedule: Schedule, stablecoin: Option<Pubkey>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        loan.borrower = *ctx.accounts.borrower.key;
        loan.nft_mint = ctx.accounts.nft_mint.key();
        loan.escrow = ctx.accounts.escrow.key();
        loan.total_amount = total_amount;
        loan.installments = installments;
        loan.paid_installments = 0;
        loan.next_payment_ts = Clock::get()?.unix_timestamp + schedule.to_seconds();
        loan.schedule = schedule;
        loan.stablecoin_mint = stablecoin;
        loan.status = LoanStatus::Active;
        Ok(())
    }

    pub fn pay_installment(ctx: Context<PayInstallment>, amount: u64) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        require!(loan.status == LoanStatus::Active, LoanError::InvalidLoanState);
        // Accept payments in SOL (lamports) or SPL token (stablecoin)
        if ctx.accounts.stablecoin.is_some() {
            // transfer SPL from payer to admin (or vault)
            let cpi_accounts = Transfer {
                from: ctx.accounts.payer_token_account.as_ref().unwrap().to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;
        } else {
            // For SOL payments, expect lamports transferred alongside instruction (handled off-chain/through system program wrapper)
            // Here we simply increment paid amount
        }

        loan.paid_installments = loan.paid_installments.checked_add(1).ok_or(LoanError::NumericalOverflow)?;
        if loan.paid_installments >= loan.installments {
            loan.status = LoanStatus::Repaid;
        } else {
            loan.next_payment_ts = Clock::get()?.unix_timestamp + loan.schedule.to_seconds();
        }
        Ok(())
    }

    pub fn release_collateral(ctx: Context<ReleaseCollateral>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        require!(loan.status == LoanStatus::Repaid, LoanError::InvalidLoanState);
        // Delegate to escrow program via CPI or transfer from escrow to borrower
        Ok(())
    }

    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        require!(loan.status == LoanStatus::Active, LoanError::InvalidLoanState);
        // Basic liquidation logic: mark liquidated and keep collateral
        loan.status = LoanStatus::Liquidated;
        Ok(())
    }

    pub fn admin_update_config(ctx: Context<AdminUpdateConfig>, platform_fee_bps: u16) -> Result<()> {
        let cfg = &mut ctx.accounts.admin_config;
        cfg.platform_fee_bps = platform_fee_bps;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Schedule {
    Weekly,
    BiWeekly,
    Monthly,
}

impl Schedule {
    pub fn to_seconds(&self) -> i64 {
        match self {
            Schedule::Weekly => 7 * 24 * 60 * 60,
            Schedule::BiWeekly => 14 * 24 * 60 * 60,
            Schedule::Monthly => 30 * 24 * 60 * 60,
        }
    }
}

#[account]
pub struct Loan {
    pub borrower: Pubkey,
    pub nft_mint: Pubkey,
    pub escrow: Pubkey,
    pub total_amount: u64,
    pub installments: u8,
    pub paid_installments: u8,
    pub next_payment_ts: i64,
    pub schedule: Schedule,
    pub stablecoin_mint: Option<Pubkey>,
    pub status: LoanStatus,
}

#[account]
pub struct AdminConfig {
    pub admin: Pubkey,
    pub platform_fee_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LoanStatus {
    Active,
    Repaid,
    Liquidated,
}

#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 2)]
    pub admin_config: Account<'info, AdminConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(total_amount: u64, installments: u8, schedule: Schedule, stablecoin: Option<Pubkey>)]
pub struct CreateLoan<'info> {
    #[account(init, payer = borrower, space = 8 + 32*4 + 8 + 1 + 1 + 8 + 1 + 33 + 1)]
    pub loan: Account<'info, Loan>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    /// CHECK: NFT mint account
    pub nft_mint: UncheckedAccount<'info>,
    /// CHECK: escrow PDA account (created by escrow program)
    pub escrow: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayInstallment<'info> {
    #[account(mut)]
    pub loan: Account<'info, Loan>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// Optional token account if paying with SPL stablecoin
    pub payer_token_account: Option<Account<'info, TokenAccount>>, 
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReleaseCollateral<'info> {
    #[account(mut)]
    pub loan: Account<'info, Loan>,
    #[account(mut)]
    pub borrower: Signer<'info>, 
    /// CHECK: escrow account holding NFT
    pub escrow: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut, has_one = admin)]
    pub admin_config: Account<'info, AdminConfig>,
    pub admin: Signer<'info>,
    #[account(mut)]
    pub loan: Account<'info, Loan>,
}

#[derive(Accounts)]
pub struct AdminUpdateConfig<'info> {
    #[account(mut, has_one = admin)]
    pub admin_config: Account<'info, AdminConfig>,
    pub admin: Signer<'info>,
}

#[error_code]
pub enum LoanError {
    #[msg("Loan is in invalid state for this operation")]
    InvalidLoanState,
    #[msg("Numerical overflow")]
    NumericalOverflow,
}