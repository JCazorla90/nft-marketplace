import React, { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Gamepad2,
  Lock,
  Shield,
  Unlock,
  Wallet,
  XCircle,
} from 'lucide-react'

const NFTS = [
  {
    id: 1,
    name: 'Legendary Dragon Sword',
    game: 'Fantasy Quest',
    price: 2.5,
    priceUSD: 312.5,
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=400&fit=crop',
    rarity: 'Legendary',
    stats: { attack: 150, durability: 100 },
  },
  {
    id: 2,
    name: 'Cyber Punk Armor',
    game: 'Neon Warriors',
    price: 1.8,
    priceUSD: 225,
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop',
    rarity: 'Epic',
    stats: { defense: 80, speed: 120 },
  },
  {
    id: 3,
    name: 'Mystic Pet Dragon',
    game: 'Pet Adventures',
    price: 5,
    priceUSD: 625,
    image: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=400&h=400&fit=crop',
    rarity: 'Mythic',
    stats: { power: 180, loyalty: 100 },
  },
  {
    id: 4,
    name: 'Racing Car NFT',
    game: 'Speed Legends',
    price: 2,
    priceUSD: 250,
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop',
    rarity: 'Rare',
    stats: { speed: 250, handling: 90 },
  },
]

const mockLoans = [
  {
    id: 'loan_001',
    nftName: 'Ancient Shield',
    totalAmount: 3.2,
    totalAmountUSD: 400,
    paid: 1.6,
    paidUSD: 200,
    remaining: 1.6,
    remainingUSD: 200,
    installments: 4,
    paidInstallments: 2,
    nextPayment: '2025-12-01',
    status: 'active',
    locked: true,
    interestRate: 0,
  },
]

const formatCurrency = (value) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })

function StatChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

export default function BNPLNFTMarketplace() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletProvider, setWalletProvider] = useState('')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [showBNPLModal, setShowBNPLModal] = useState(false)
  const [environment, setEnvironment] = useState('devnet')
  const [userLoans, setUserLoans] = useState([])
  const [bnplPlan, setBnplPlan] = useState({ installments: 4, downPayment: 25, interestRate: 0 })

  const connectWallet = async (provider) => {
    try {
      if (provider === 'phantom' && window?.solana?.isPhantom) {
        const response = await window.solana.connect()
        setWalletAddress(response.publicKey.toString())
        setWalletConnected(true)
        setWalletProvider('Phantom')
        setUserLoans(mockLoans)
        return
      }

      if (provider === 'solflare' && window?.solflare) {
        await window.solflare.connect()
        const address = window.solflare.publicKey.toString()
        setWalletAddress(address)
        setWalletConnected(true)
        setWalletProvider('Solflare')
        setUserLoans(mockLoans)
        return
      }

      const demoAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'
      setWalletAddress(demoAddress)
      setWalletConnected(true)
      setWalletProvider(provider === 'phantom' ? 'Phantom (Demo)' : 'Solflare (Demo)')
      setUserLoans(mockLoans)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      const demoAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'
      setWalletAddress(demoAddress)
      setWalletConnected(true)
      setWalletProvider(provider === 'phantom' ? 'Phantom (Demo)' : 'Solflare (Demo)')
      setUserLoans(mockLoans)
    }
  }

  const calculation = useMemo(() => {
    if (!selectedNFT) return null
    const downPaymentAmount = (selectedNFT.priceUSD * bnplPlan.downPayment) / 100
    const remainingAmount = selectedNFT.priceUSD - downPaymentAmount
    const installmentAmount = remainingAmount / bnplPlan.installments

    return {
      downPaymentAmount,
      remainingAmount,
      installmentAmount,
      totalWithInterest: selectedNFT.priceUSD * (1 + bnplPlan.interestRate / 100),
    }
  }, [bnplPlan.downPayment, bnplPlan.installments, bnplPlan.interestRate, selectedNFT])

  const handleBuyWithBNPL = (nft) => {
    setSelectedNFT(nft)
    setShowBNPLModal(true)
  }

  const confirmBNPL = () => {
    if (!selectedNFT || !calculation) return

    const newLoan = {
      id: `loan_${Date.now()}`,
      nftName: selectedNFT.name,
      totalAmount: selectedNFT.price,
      totalAmountUSD: selectedNFT.priceUSD,
      paid: (selectedNFT.price * bnplPlan.downPayment) / 100,
      paidUSD: calculation.downPaymentAmount,
      remaining: selectedNFT.price - (selectedNFT.price * bnplPlan.downPayment) / 100,
      remainingUSD: calculation.remainingAmount,
      installments: bnplPlan.installments,
      paidInstallments: 0,
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      locked: true,
      interestRate: bnplPlan.interestRate,
    }

    setUserLoans([...userLoans, newLoan])
    setShowBNPLModal(false)
  }

  const payInstallment = (loanId) => {
    const loan = userLoans.find((l) => l.id === loanId)
    if (!loan) return

    const updatedLoans = userLoans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            paid: l.paid + l.totalAmount / l.installments,
            paidUSD: l.paidUSD + l.totalAmountUSD / l.installments,
            paidInstallments: l.paidInstallments + 1,
            remaining: Math.max(0, l.remaining - l.totalAmount / l.installments),
            remainingUSD: Math.max(0, l.remainingUSD - l.totalAmountUSD / l.installments),
            status: l.paidInstallments + 1 >= l.installments ? 'completed' : l.status,
            locked: l.paidInstallments + 1 >= l.installments ? false : l.locked,
          }
        : l,
    )

    setUserLoans(updatedLoans)
  }

  return (
    <div className="gradient-bg min-h-screen">
      <header className="border-b border-white/5 bg-black/30">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-10 w-10 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">GameNFT BNPL</h1>
              <p className="text-xs text-purple-200">Buy Now, Pay Later sobre Solana</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="devnet">Devnet</option>
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>

            {!walletConnected ? (
              <div className="flex gap-2">
                <button
                  onClick={() => connectWallet('phantom')}
                  className="cta-button flex items-center gap-2 px-4 py-2"
                >
                  <Wallet className="h-4 w-4" />
                  Phantom
                </button>
                <button
                  onClick={() => connectWallet('solflare')}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 flex items-center gap-2 px-4 py-2 text-white rounded-xl"
                >
                  <Wallet className="h-4 w-4" />
                  Solflare
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white">
                <Shield className="h-4 w-4 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="font-semibold">{walletProvider}</span>
                  <span className="text-[10px] text-slate-300">{walletAddress}</span>
                  <span className="text-[10px] text-slate-400">{environment}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto grid gap-8 px-4 pb-16 pt-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 shadow-2xl shadow-purple-500/10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">NFTs destacados</p>
                <h2 className="text-2xl font-bold text-white">Marketplace Gamificado</h2>
              </div>
              <div className="flex gap-2 text-xs text-slate-300">
                <StatChip icon={Lock} label="Escrow" />
                <StatChip icon={Clock} label="Pagos programados" />
                <StatChip icon={DollarSign} label="0% demo" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {NFTS.map((nft) => (
                <article key={nft.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg">
                  <div className="overflow-hidden">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{nft.name}</h3>
                        <p className="text-sm text-slate-300">{nft.game}</p>
                      </div>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                        {nft.rarity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-emerald-300">{nft.price} SOL</p>
                        <p className="text-slate-400">{formatCurrency(nft.priceUSD)}</p>
                      </div>
                      <div className="flex gap-2 text-xs text-slate-300">
                        <StatChip icon={CreditCard} label="BNPL" />
                        <StatChip icon={Shield} label="Custodia" />
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs text-slate-300">
                      <StatChip icon={DollarSign} label={`${bnplPlan.installments} cuotas`} />
                      <StatChip icon={Clock} label={`Down ${bnplPlan.downPayment}%`} />
                      <StatChip icon={Calendar} label={`${bnplPlan.interestRate}% interés demo`} />
                    </div>

                    <button
                      onClick={() => handleBuyWithBNPL(nft)}
                      className="cta-button flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
                    >
                      <CreditCard className="h-4 w-4" /> Comprar con BNPL
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 shadow-2xl shadow-purple-500/10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Cómo funciona</p>
                <h2 className="text-2xl font-bold text-white">Escrow + pagos programados</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  {step === 1 && (
                    <>
                      <p className="text-purple-200">1) Bloqueo de NFT</p>
                      <p className="text-slate-300">El NFT queda en escrow seguro hasta completar los pagos.</p>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <p className="text-purple-200">2) Cron expresivo</p>
                      <p className="text-slate-300">Pagos automáticos en Anchor programados contra tu wallet.</p>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <p className="text-purple-200">3) Desbloqueo</p>
                      <p className="text-slate-300">Tras la última cuota el NFT se libera y pasa a tu wallet.</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass rounded-2xl p-6 shadow-2xl shadow-purple-500/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Plan BNPL</p>
                <h2 className="text-xl font-bold text-white">Configura tu plan</h2>
              </div>
              <Clock className="h-6 w-6 text-purple-300" />
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <label className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Cuotas</span>
                  <span>{bnplPlan.installments} pagos</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={bnplPlan.installments}
                  onChange={(e) => setBnplPlan({ ...bnplPlan, installments: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </label>

              <label className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Pago inicial (%)</span>
                  <span>{bnplPlan.downPayment}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={bnplPlan.downPayment}
                  onChange={(e) => setBnplPlan({ ...bnplPlan, downPayment: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </label>

              <label className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Interés demo (%)</span>
                  <span>{bnplPlan.interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={bnplPlan.interestRate}
                  onChange={(e) => setBnplPlan({ ...bnplPlan, interestRate: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </label>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
                <div className="flex items-center gap-2 text-purple-200">
                  <Shield className="h-4 w-4" />
                  Simulación local (no se envían transacciones)
                </div>
                <p className="mt-2 text-slate-400">
                  Conecta una wallet real o usa el modo demo para probar el flujo completo en GitHub Pages.
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 shadow-2xl shadow-purple-500/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Dashboard</p>
                <h2 className="text-xl font-bold text-white">Tus préstamos</h2>
              </div>
              <DollarSign className="h-6 w-6 text-emerald-300" />
            </div>

            {!walletConnected && (
              <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-100">
                <AlertCircle className="h-4 w-4" />
                <p>Conecta o usa el modo demo para ver préstamos simulados.</p>
              </div>
            )}

            {walletConnected && userLoans.length === 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                <XCircle className="h-4 w-4 text-slate-400" />
                <p>Aún no tienes préstamos. Compra un NFT con BNPL para simular el flujo.</p>
              </div>
            )}

            <div className="space-y-3">
              {userLoans.map((loan) => (
                <div key={loan.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-white">{loan.nftName}</p>
                      <p className="text-slate-400">{loan.installments} cuotas · {loan.interestRate}% interés demo</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide ${
                        loan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-purple-500/20 text-purple-200'
                      }`}
                    >
                      {loan.status === 'completed' ? 'Pagado' : 'Activo'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                    <div>
                      <p className="text-slate-400">Pagado</p>
                      <p className="text-emerald-200">{loan.paid.toFixed(2)} SOL · {formatCurrency(loan.paidUSD)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Restante</p>
                      <p className="text-orange-200">{loan.remaining.toFixed(2)} SOL · {formatCurrency(loan.remainingUSD)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Próximo pago</p>
                      <p className="text-white">{loan.nextPayment}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Custodia</p>
                      <p className="flex items-center gap-1 text-white">
                        {loan.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />} Escrow
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-300">
                    <div className="h-1.5 flex-1 rounded-full bg-white/5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-emerald-400"
                        style={{ width: `${(loan.paidInstallments / loan.installments) * 100}%` }}
                      />
                    </div>
                    <span>
                      {loan.paidInstallments}/{loan.installments}
                    </span>
                  </div>

                  {loan.status !== 'completed' && (
                    <button
                      onClick={() => payInstallment(loan.id)}
                      className="secondary-button mt-3 w-full py-2 text-xs"
                    >
                      Pagar siguiente cuota
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {showBNPLModal && selectedNFT && calculation && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
          <div className="glass w-full max-w-xl rounded-2xl p-6 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-purple-300">Confirmar BNPL</p>
                <h3 className="text-xl font-bold">{selectedNFT.name}</h3>
                <p className="text-slate-300">{selectedNFT.game}</p>
              </div>
              <button onClick={() => setShowBNPLModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="text-slate-400">Detalle del plan</p>
                <div className="flex items-center justify-between">
                  <span>Pago inicial</span>
                  <span className="text-emerald-200">{formatCurrency(calculation.downPaymentAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monto restante</span>
                  <span className="text-orange-200">{formatCurrency(calculation.remainingAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cuota estimada</span>
                  <span className="text-purple-200">{formatCurrency(calculation.installmentAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total con interés demo</span>
                  <span>{formatCurrency(calculation.totalWithInterest)}</span>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
                <div className="flex items-center gap-2 text-yellow-100">
                  <AlertCircle className="h-4 w-4" />
                  Demo sin transacciones en cadena
                </div>
                <p className="text-slate-300">
                  En GitHub Pages este flujo es 100% front-end. Puedes conectar Phantom/Solflare o usar el modo demo para probar el dashboard.
                </p>
                <ul className="list-disc space-y-1 pl-4 text-slate-300">
                  <li>Bloqueo lógico de NFT en escrow hasta terminar las cuotas.</li>
                  <li>Pagos programados simulados con cron en backend (no incluido en demo).</li>
                  <li>Todos los datos se mantienen en memoria del navegador.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={confirmBNPL} className="cta-button flex-1 py-3 text-sm">
                Confirmar plan BNPL
              </button>
              <button onClick={() => setShowBNPLModal(false)} className="secondary-button px-4 py-3 text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
