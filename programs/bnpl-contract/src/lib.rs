use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("BNPLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod bnpl_contract {
    use super::*;

    /// Inicializa un nuevo préstamo BNPL
    pub fn initialize_loan(
        ctx: Context<InitializeLoan>,
        nft_mint: Pubkey,
        total_amount: u64,
        down_payment: u64,
        installments: u8,
        interest_rate: u16, // En basis points (100 = 1%)
    ) -> Result<()> {
        require!(installments > 0 && installments <= 12, BNPLError::InvalidInstallments);
        require!(down_payment < total_amount, BNPLError::InvalidDownPayment);
        require!(total_amount > 0, BNPLError::InvalidAmount);

        let loan = &mut ctx.accounts.loan;
        let clock = Clock::get()?;

        loan.borrower = ctx.accounts.borrower.key();
        loan.nft_mint = nft_mint;
        loan.total_amount = total_amount;
        loan.paid_amount = down_payment;
        loan.remaining_amount = total_amount - down_payment;
        loan.installments = installments;
        loan.paid_installments = 0;
        loan.interest_rate = interest_rate;
        loan.nft_locked = true;
        loan.status = LoanStatus::Active;
        loan.created_at = clock.unix_timestamp;
        loan.next_payment_due = clock.unix_timestamp + 30 * 24 * 60 * 60; // 30 días
        loan.bump = *ctx.bumps.get("loan").unwrap();

        msg!("Préstamo inicializado: {} SOL", total_amount);
        msg!("Pago inicial: {} SOL", down_payment);
        msg!("Cuotas: {}", installments);

        Ok(())
    }

    /// Bloquea el NFT en el contrato (escrow)
    pub fn lock_nft(ctx: Context<LockNFT>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        
        require!(loan.borrower == ctx.accounts.borrower.key(), BNPLError::Unauthorized);
        require!(!loan.nft_locked, BNPLError::NFTAlreadyLocked);

        // Transferir NFT al escrow del programa
        let cpi_accounts = Transfer {
            from: ctx.accounts.borrower_nft_account.to_account_info(),
            to: ctx.accounts.escrow_nft_account.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, 1)?; // NFTs son cantidad = 1

        loan.nft_locked = true;
        msg!("NFT bloqueado en escrow");

        Ok(())
    }

    /// Procesa un pago de cuota
    pub fn make_payment(ctx: Context<MakePayment>, amount: u64) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let clock = Clock::get()?;

        require!(loan.borrower == ctx.accounts.borrower.key(), BNPLError::Unauthorized);
        require!(loan.status == LoanStatus::Active, BNPLError::LoanNotActive);
        require!(loan.paid_installments < loan.installments, BNPLError::LoanAlreadyPaid);

        // Calcular cuota con interés
        let remaining_installments = loan.installments - loan.paid_installments;
        let installment_amount = loan.remaining_amount / remaining_installments as u64;
        let interest = (installment_amount * loan.interest_rate as u64) / 10000;
        let total_installment = installment_amount + interest;

        require!(amount >= total_installment, BNPLError::InsufficientPayment);

        // Transferir pago al tesoro del programa
        let cpi_accounts = Transfer {
            from: ctx.accounts.borrower_token_account.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;

        // Actualizar estado del préstamo
        loan.paid_amount += amount;
        loan.remaining_amount -= installment_amount;
        loan.paid_installments += 1;
        loan.last_payment_at = clock.unix_timestamp;
        loan.next_payment_due = clock.unix_timestamp + 30 * 24 * 60 * 60;

        // Si completó todos los pagos, cambiar estado
        if loan.paid_installments >= loan.installments {
            loan.status = LoanStatus::Completed;
            loan.remaining_amount = 0;
            msg!("¡Préstamo completado!");
        }

        msg!("Pago procesado: {} SOL", amount);
        msg!("Cuotas pagadas: {}/{}", loan.paid_installments, loan.installments);
        msg!("Restante: {} SOL", loan.remaining_amount);

        Ok(())
    }

    /// Desbloquea el NFT cuando se completa el préstamo
    pub fn unlock_nft(ctx: Context<UnlockNFT>) -> Result<()> {
        let loan = &ctx.accounts.loan;

        require!(loan.borrower == ctx.accounts.borrower.key(), BNPLError::Unauthorized);
        require!(loan.status == LoanStatus::Completed, BNPLError::LoanNotCompleted);
        require!(loan.nft_locked, BNPLError::NFTNotLocked);

        let seeds = &[
            b"loan",
            loan.borrower.as_ref(),
            loan.nft_mint.as_ref(),
            &[loan.bump],
        ];
        let signer = &[&seeds[..]];

        // Transferir NFT de vuelta al borrower
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_nft_account.to_account_info(),
            to: ctx.accounts.borrower_nft_account.to_account_info(),
            authority: ctx.accounts.loan.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, 1)?;

        msg!("NFT desbloqueado y devuelto al propietario");

        Ok(())
    }

    /// Cancela un préstamo (solo si no hay pagos realizados)
    pub fn cancel_loan(ctx: Context<CancelLoan>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;

        require!(loan.borrower == ctx.accounts.borrower.key(), BNPLError::Unauthorized);
        require!(loan.paid_installments == 0, BNPLError::CannotCancelWithPayments);

        loan.status = LoanStatus::Cancelled;
        
        msg!("Préstamo cancelado");

        Ok(())
    }
}

// ============================================================================
// ACCOUNTS STRUCTURES
// ============================================================================

#[derive(Accounts)]
#[instruction(nft_mint: Pubkey)]
pub struct InitializeLoan<'info> {
    #[account(
        init,
        payer = borrower,
        space = 8 + Loan::LEN,
        seeds = [b"loan", borrower.key().as_ref(), nft_mint.as_ref()],
        bump
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockNFT<'info> {
    #[account(
        mut,
        seeds = [b"loan", borrower.key().as_ref(), loan.nft_mint.as_ref()],
        bump = loan.bump
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut)]
    pub borrower_nft_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_nft_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MakePayment<'info> {
    #[account(
        mut,
        seeds = [b"loan", borrower.key().as_ref(), loan.nft_mint.as_ref()],
        bump = loan.bump
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut)]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnlockNFT<'info> {
    #[account(
        seeds = [b"loan", borrower.key().as_ref(), loan.nft_mint.as_ref()],
        bump = loan.bump
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut)]
    pub borrower_nft_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_nft_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelLoan<'info> {
    #[account(
        mut,
        seeds = [b"loan", borrower.key().as_ref(), loan.nft_mint.as_ref()],
        bump = loan.bump
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(mut)]
    pub borrower: Signer<'info>,
}

// ============================================================================
// STATE
// ============================================================================

#[account]
pub struct Loan {
    pub borrower: Pubkey,           // 32
    pub nft_mint: Pubkey,           // 32
    pub total_amount: u64,          // 8
    pub paid_amount: u64,           // 8
    pub remaining_amount: u64,      // 8
    pub installments: u8,           // 1
    pub paid_installments: u8,      // 1
    pub interest_rate: u16,         // 2 (basis points)
    pub nft_locked: bool,           // 1
    pub status: LoanStatus,         // 1
    pub created_at: i64,            // 8
    pub last_payment_at: i64,       // 8
    pub next_payment_due: i64,      // 8
    pub bump: u8,                   // 1
}

impl Loan {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 1 + 1 + 2 + 1 + 1 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LoanStatus {
    Active,
    Completed,
    Defaulted,
    Cancelled,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum BNPLError {
    #[msg("Número de cuotas inválido (1-12)")]
    InvalidInstallments,
    
    #[msg("Pago inicial debe ser menor que el monto total")]
    InvalidDownPayment,
    
    #[msg("Monto inválido")]
    InvalidAmount,
    
    #[msg("No autorizado")]
    Unauthorized,
    
    #[msg("NFT ya está bloqueado")]
    NFTAlreadyLocked,
    
    #[msg("NFT no está bloqueado")]
    NFTNotLocked,
    
    #[msg("Préstamo no está activo")]
    LoanNotActive,
    
    #[msg("Préstamo ya fue pagado completamente")]
    LoanAlreadyPaid,
    
    #[msg("Pago insuficiente")]
    InsufficientPayment,
    
    #[msg("Préstamo no completado")]
    LoanNotCompleted,
    
    #[msg("No se puede cancelar préstamo con pagos realizados")]
    CannotCancelWithPayments,
}
