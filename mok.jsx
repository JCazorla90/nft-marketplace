import React, { useState } from 'react';
import { Gamepad2, Wallet, DollarSign, Clock, Shield, AlertCircle, XCircle, Calendar, CreditCard, Lock, Unlock } from 'lucide-react';

export default function BNPLNFTMarketplace() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletProvider, setWalletProvider] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showBNPLModal, setShowBNPLModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [environment, setEnvironment] = useState('devnet');
  const [userLoans, setUserLoans] = useState([]);
  const [bnplPlan, setBnplPlan] = useState({
    installments: 4,
    downPayment: 25,
    interestRate: 0
  });

  const nfts = [
    {
      id: 1,
      name: "Legendary Dragon Sword",
      game: "Fantasy Quest",
      price: 2.5,
      priceUSD: 312.50,
      image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=400&fit=crop",
      rarity: "Legendary",
      stats: { attack: 150, durability: 100 }
    },
    {
      id: 2,
      name: "Cyber Punk Armor",
      game: "Neon Warriors",
      price: 1.8,
      priceUSD: 225.00,
      image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop",
      rarity: "Epic",
      stats: { defense: 80, speed: 120 }
    },
    {
      id: 3,
      name: "Mystic Pet Dragon",
      game: "Pet Adventures",
      price: 5.0,
      priceUSD: 625.00,
      image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=400&h=400&fit=crop",
      rarity: "Mythic",
      stats: { power: 180, loyalty: 100 }
    },
    {
      id: 4,
      name: "Racing Car NFT",
      game: "Speed Legends",
      price: 2.0,
      priceUSD: 250.00,
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop",
      rarity: "Rare",
      stats: { speed: 250, handling: 90 }
    }
  ];

  const mockLoans = [
    {
      id: "loan_001",
      nftName: "Ancient Shield",
      totalAmount: 3.2,
      totalAmountUSD: 400,
      paid: 1.6,
      paidUSD: 200,
      remaining: 1.6,
      remainingUSD: 200,
      installments: 4,
      paidInstallments: 2,
      nextPayment: "2025-12-01",
      status: "active",
      locked: true,
      interestRate: 0
    }
  ];

  const connectWallet = async (provider) => {
    try {
      if (provider === 'phantom' && window.solana?.isPhantom) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
        setWalletProvider('Phantom');
        setUserLoans(mockLoans);
      } else if (provider === 'solflare' && window.solflare) {
        await window.solflare.connect();
        const address = window.solflare.publicKey.toString();
        setWalletAddress(address);
        setWalletConnected(true);
        setWalletProvider('Solflare');
        setUserLoans(mockLoans);
      } else {
        const demoAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
        setWalletAddress(demoAddress);
        setWalletConnected(true);
        setWalletProvider(provider === 'phantom' ? 'Phantom (Demo)' : 'Solflare (Demo)');
        setUserLoans(mockLoans);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      const demoAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      setWalletAddress(demoAddress);
      setWalletConnected(true);
      setWalletProvider(provider === 'phantom' ? 'Phantom (Demo)' : 'Solflare (Demo)');
      setUserLoans(mockLoans);
    }
  };

  const calculateBNPL = (nft) => {
    const downPaymentAmount = (nft.priceUSD * bnplPlan.downPayment) / 100;
    const remainingAmount = nft.priceUSD - downPaymentAmount;
    const installmentAmount = remainingAmount / bnplPlan.installments;
    
    return {
      downPaymentAmount,
      remainingAmount,
      installmentAmount,
      totalWithInterest: nft.priceUSD * (1 + bnplPlan.interestRate / 100)
    };
  };

  const handleBuyWithBNPL = (nft) => {
    setSelectedNFT(nft);
    setShowBNPLModal(true);
  };

  const confirmBNPL = async () => {
    alert('Iniciando transacción BNPL en Solana');
    
    const calculation = calculateBNPL(selectedNFT);
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
      status: "active",
      locked: true,
      interestRate: bnplPlan.interestRate
    };
    
    setUserLoans([...userLoans, newLoan]);
    setShowBNPLModal(false);
    setShowDashboard(true);
  };

  const payInstallment = (loanId) => {
    alert('Procesando pago de cuota via Smart Contract');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-black bg-opacity-50 backdrop-blur-lg border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Gamepad2 className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">GameNFT BNPL</h1>
                <p className="text-xs text-purple-300">Buy Now Pay Later - Powered by Solana</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm border border-purple-500/50"
              >
                <option value="devnet">Devnet</option>
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet</option>
              </select>

              {!walletConnected ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => connectWallet('phantom')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Phantom</span>
                  </button>
                  <button
                    onClick={() => connectWallet('solflare')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Solflare</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                  <div className="bg-white bg-opacity-10 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-300">{walletProvider}</p>
                    <p className="text-xs text-purple-300 font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDashboard(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Mis Préstamos ({userLoans.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-bold">0%</p>
              <p className="text-purple-100 text-sm">Interés en 4 cuotas</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">Desde 25%</p>
              <p className="text-purple-100 text-sm">Pago inicial</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">Inmediato</p>
              <p className="text-purple-100 text-sm">Acceso al NFT</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">Seguro</p>
              <p className="text-purple-100 text-sm">Smart Contract</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">NFTs Disponibles con BNPL</h2>
          <p className="text-purple-300">Compra ahora y paga en cuotas. El NFT se desbloquea al completar los pagos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {nfts.map(nft => (
            <div
              key={nft.id}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all hover:transform hover:scale-105"
            >
              <div className="relative">
                <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover" />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                  nft.rarity === 'Mythic' ? 'bg-red-500' :
                  nft.rarity === 'Legendary' ? 'bg-orange-500' :
                  nft.rarity === 'Epic' ? 'bg-purple-500' : 'bg-blue-500'
                } text-white`}>
                  {nft.rarity}
                </span>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-purple-300 mb-1">{nft.game}</p>
                <h3 className="text-lg font-bold text-white mb-2">{nft.name}</h3>
                
                <div className="mb-3 space-y-1">
                  {Object.entries(nft.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-400 capitalize">{key}:</span>
                      <span className="text-purple-300 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-400">Precio</p>
                  <p className="text-xl font-bold text-white">${nft.priceUSD}</p>
                  <p className="text-xs text-purple-300">{nft.price} SOL</p>
                </div>
                
                <button
                  onClick={() => handleBuyWithBNPL(nft)}
                  disabled={!walletConnected}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{walletConnected ? 'Comprar con BNPL' : 'Conecta Wallet'}</span>
                </button>

                <p className="text-center text-xs text-purple-300 mt-2">
                  Desde ${(nft.priceUSD * 0.25).toFixed(2)} inicial
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <Shield className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Smart Contracts Seguros</h3>
            <p className="text-purple-200">Programas en Rust/Anchor con bloqueo automático de activos y pagos programados.</p>
          </div>

          <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <DollarSign className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Conversión Automática</h3>
            <p className="text-purple-200">Sistema backend que convierte tokens a USD en tiempo real para pagos estables.</p>
          </div>

          <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <Gamepad2 className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">API REST para Juegos</h3>
            <p className="text-purple-200">Integración fácil para desarrolladores de juegos con documentación completa.</p>
          </div>
        </div>
      </div>

      {showBNPLModal && selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-purple-500 max-h-screen overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Plan de Pago BNPL</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-black bg-opacity-30 p-4 rounded-lg">
                <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full h-48 object-cover rounded-lg mb-3" />
                <h3 className="text-xl font-bold text-white">{selectedNFT.name}</h3>
                <p className="text-purple-300">{selectedNFT.game}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black bg-opacity-30 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Precio Total</p>
                  <p className="text-2xl font-bold text-white">${selectedNFT.priceUSD}</p>
                  <p className="text-sm text-purple-300">{selectedNFT.price} SOL</p>
                </div>
                
                <div className="bg-black bg-opacity-30 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Pago Inicial ({bnplPlan.downPayment}%)</p>
                  <p className="text-2xl font-bold text-green-400">${calculateBNPL(selectedNFT).downPaymentAmount.toFixed(2)}</p>
                </div>
                
                <div className="bg-black bg-opacity-30 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Cuotas Restantes</p>
                  <p className="text-2xl font-bold text-white">{bnplPlan.installments}x ${calculateBNPL(selectedNFT).installmentAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="text-white mb-2 block">Número de Cuotas</label>
                <select 
                  value={bnplPlan.installments}
                  onChange={(e) => setBnplPlan({...bnplPlan, installments: parseInt(e.target.value)})}
                  className="w-full bg-black bg-opacity-50 text-white p-3 rounded-lg border border-purple-500"
                >
                  <option value={2}>2 cuotas</option>
                  <option value={3}>3 cuotas</option>
                  <option value={4}>4 cuotas</option>
                  <option value={6}>6 cuotas</option>
                </select>
              </div>

              <div>
                <label className="text-white mb-2 block">Pago Inicial (%)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  value={bnplPlan.downPayment}
                  onChange={(e) => setBnplPlan({...bnplPlan, downPayment: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-purple-300 text-sm">{bnplPlan.downPayment}%</p>
              </div>
            </div>

            <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <p className="text-yellow-100 font-semibold mb-1">NFT Bloqueado durante el préstamo</p>
                  <p className="text-yellow-200 text-sm">El NFT estará disponible en tu juego pero bloqueado en el smart contract hasta completar todos los pagos.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowBNPLModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBNPL}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Confirmar BNPL
              </button>
            </div>
          </div>
        </div>
      )}

      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-6xl w-full border-2 border-purple-500 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Dashboard de Préstamos</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-white hover:text-red-400"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400">Préstamos Activos</p>
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{userLoans.filter(l => l.status === 'active').length}</p>
              </div>
              
              <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400">Total Adeudado</p>
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  ${userLoans.reduce((sum, loan) => sum + loan.remainingUSD, 0).toFixed(2)}
                </p>
              </div>
              
              <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400">Próximo Pago</p>
                  <Calendar className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-lg font-bold text-white">
                  {userLoans.length > 0 ? userLoans[0].nextPayment : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {userLoans.map(loan => (
                <div key={loan.id} className="bg-black bg-opacity-40 rounded-lg p-6 border border-purple-500/30">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{loan.nftName}</h3>
                      <p className="text-sm text-gray-400">Préstamo ID: {loan.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {loan.locked ? (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Bloqueado</span>
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                          <Unlock className="w-3 h-3" />
                          <span>Liberado</span>
                        </span>
                      )}
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm capitalize">
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total</p>
                      <p className="text-lg font-bold text-white">${loan.totalAmountUSD}</p>
                      <p className="text-xs text-purple-300">{loan.totalAmount} SOL</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Pagado</p>
                      <p className="text-lg font-bold text-green-400">${loan.paidUSD}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Restante</p>
                      <p className="text-lg font-bold text-yellow-400">${loan.remainingUSD}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Cuotas</p>
                      <p className="text-lg font-bold text-white">{loan.paidInstallments}/{loan.installments}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progreso del Préstamo</span>
                      <span>{((loan.paidInstallments / loan.installments) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                        style={{ width: `${(loan.paidInstallments / loan.installments) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <button
                      onClick={() => payInstallment(loan.id)}
                      disabled={loan.paidInstallments >= loan.installments}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Pagar Cuota (${(loan.remainingUSD / (loan.installments - loan.paidInstallments)).toFixed(2)})</span>
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold transition-all">
                      Detalles
                    </button>
                  </div>

                  <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
                    <p className="text-blue-200 text-sm flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Próximo pago automático: {loan.nextPayment}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black bg-opacity-50 backdrop-blur-lg border-t border-purple-500/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Tecnología</h3>
              <ul className="space-y-2 text-purple-300 text-sm">
                <li>✓ Solana Blockchain</li>
                <li>✓ Smart Contracts (Rust/Anchor)</li>
                <li>✓ API REST para Juegos</li>
                <li>✓ Phantom & Solflare Wallets</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Características BNPL</h3>
              <ul className="space-y-2 text-purple-300 text-sm">
                <li>✓ Pagos programados automáticos</li>
                <li>✓ Bloqueo de activos en contrato</li>
                <li>✓ Conversión tokens a USD</li>
                <li>✓ Sin intereses en 4 cuotas</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Entornos</h3>
              <ul className="space-y-2 text-purple-300 text-sm">
                <li>• Devnet (Desarrollo)</li>
                <li>• Testnet (Pruebas)</li>
                <li>• Mainnet (Producción)</li>
                <li>• Documentación API completa</li>
              </ul>
            </div>
          </div>
          <div className="text-center border-t border-purple-500/30 pt-8">
            <p className="text-gray-400">GameNFT BNPL - Sistema de financiamiento para NFTs de videojuegos</p>
            <p className="text-sm text-purple-300 mt-2">Powered by Solana • Smart Contracts en Rust/Anchor</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
