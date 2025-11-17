# 🎮 BNPL NFT Marketplace - Estructura del Proyecto

## 📁 Estructura de Carpetas

```
bnpl-nft-marketplace/
│
├── 📂 programs/                    # Smart Contracts Solana (Rust/Anchor)
│   └── bnpl-contract/
│       ├── src/
│       │   ├── lib.rs             # Punto de entrada del programa
│       │   ├── state.rs           # Estructuras de datos
│       │   ├── instructions/      # Instrucciones del contrato
│       │   │   ├── mod.rs
│       │   │   ├── initialize_loan.rs
│       │   │   ├── make_payment.rs
│       │   │   ├── lock_nft.rs
│       │   │   └── unlock_nft.rs
│       │   ├── error.rs           # Errores personalizados
│       │   └── utils.rs           # Utilidades
│       ├── Cargo.toml
│       └── Xargo.toml
│
├── 📂 backend/                     # API REST (Node.js/Express)
│   ├── src/
│   │   ├── index.ts               # Punto de entrada
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── solana.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── loanController.ts
│   │   │   ├── nftController.ts
│   │   │   ├── paymentController.ts
│   │   │   └── userController.ts
│   │   ├── services/
│   │   │   ├── solanaService.ts   # Interacción con blockchain
│   │   │   ├── paymentScheduler.ts # Pagos automáticos
│   │   │   ├── priceConverter.ts  # Conversión SOL/USD
│   │   │   └── nftEscrow.ts       # Gestión de NFTs bloqueados
│   │   ├── models/
│   │   │   ├── Loan.ts
│   │   │   ├── Payment.ts
│   │   │   ├── User.ts
│   │   │   └── NFT.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── loans.ts
│   │   │   ├── payments.ts
│   │   │   └── nfts.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── helpers.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── 📂 frontend/                    # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Marketplace/
│   │   │   │   ├── NFTCard.tsx
│   │   │   │   ├── NFTGrid.tsx
│   │   │   │   └── Filters.tsx
│   │   │   ├── BNPL/
│   │   │   │   ├── BNPLModal.tsx
│   │   │   │   ├── PaymentPlan.tsx
│   │   │   │   └── Calculator.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── LoanCard.tsx
│   │   │   │   ├── PaymentHistory.tsx
│   │   │   │   └── Statistics.tsx
│   │   │   ├── Wallet/
│   │   │   │   ├── WalletConnect.tsx
│   │   │   │   └── WalletButton.tsx
│   │   │   └── Layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Footer.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── hooks/
│   │   │   ├── useWallet.ts
│   │   │   ├── useLoan.ts
│   │   │   ├── useNFT.ts
│   │   │   └── usePayment.ts
│   │   ├── services/
│   │   │   ├── api.ts             # Cliente API
│   │   │   └── solana.ts          # Interacción con wallet
│   │   ├── contexts/
│   │   │   ├── WalletContext.tsx
│   │   │   └── AppContext.tsx
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── 📂 tests/                       # Tests del proyecto
│   ├── programs/                   # Tests de smart contracts
│   │   └── bnpl-contract.ts
│   ├── backend/                    # Tests de API
│   │   ├── unit/
│   │   └── integration/
│   └── e2e/                        # Tests end-to-end
│
├── 📂 scripts/                     # Scripts útiles
│   ├── deploy-devnet.sh
│   ├── deploy-mainnet.sh
│   ├── setup-db.sh
│   └── test-integration.sh
│
├── 📂 docs/                        # Documentación
│   ├── API.md                      # Documentación de API
│   ├── SMART_CONTRACTS.md          # Docs de contratos
│   ├── DEPLOYMENT.md               # Guía de despliegue
│   ├── INTEGRATION.md              # Guía para juegos
│   └── ARCHITECTURE.md             # Arquitectura del sistema
│
├── 📂 .github/                     # GitHub Actions
│   └── workflows/
│       ├── test.yml                # CI/CD para tests
│       ├── deploy-devnet.yml       # Deploy automático devnet
│       └── deploy-mainnet.yml      # Deploy producción
│
├── 📄 Anchor.toml                  # Configuración Anchor
├── 📄 Cargo.toml                   # Workspace Rust
├── 📄 package.json                 # Root package.json
├── 📄 .gitignore
├── 📄 .env.example
├── 📄 README.md                    # README principal
├── 📄 LICENSE
└── 📄 CONTRIBUTING.md

```

## 🔧 Tecnologías Utilizadas

### Smart Contracts
- **Rust** - Lenguaje principal
- **Anchor Framework** - Framework para Solana
- **Solana SDK** - Herramientas de desarrollo

### Backend
- **Node.js** - Runtime
- **TypeScript** - Tipado estático
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **Prisma** - ORM
- **node-cron** - Tareas programadas
- **@solana/web3.js** - SDK Solana para Node

### Frontend
- **React 18** - UI Library
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **@solana/wallet-adapter** - Integración wallets
- **lucide-react** - Iconos
- **axios** - Cliente HTTP

### DevOps
- **Docker** - Contenedores
- **GitHub Actions** - CI/CD
- **Vercel** - Deploy frontend
- **Railway** - Deploy backend

## 📦 Archivos de Configuración Importantes

### `.gitignore`
```
# Dependencies
node_modules/
target/
dist/
build/

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Anchor
.anchor/
test-ledger/

# Build
*.so
*.wasm
```

### `README.md` (Principal)
Debe incluir:
- Banner del proyecto
- Badges (build status, coverage, license)
- Descripción del proyecto
- Features principales
- Quick start
- Links a documentación
- Contribución
- Licencia

## 🚀 Orden de Desarrollo

1. **Inicializar repositorio** → Crear estructura
2. **Smart Contracts** → Core del sistema
3. **Backend API** → Conectar blockchain con frontend
4. **Frontend** → Interfaz de usuario
5. **Tests** → Asegurar calidad
6. **CI/CD** → Automatizar despliegues
7. **Documentación** → Guías completas

## 📝 Comandos Principales

```bash
# Root
npm run setup           # Setup completo del proyecto
npm run dev            # Levantar todo en desarrollo
npm run test           # Ejecutar todos los tests
npm run deploy:devnet  # Deploy a devnet
npm run deploy:mainnet # Deploy a mainnet

# Smart Contracts
cd programs/bnpl-contract
anchor build           # Compilar programa
anchor test           # Ejecutar tests
anchor deploy         # Desplegar

# Backend
cd backend
npm run dev           # Desarrollo con hot-reload
npm run build         # Compilar TypeScript
npm run start         # Producción
npm run test          # Tests

# Frontend
cd frontend
npm run dev           # Desarrollo
npm run build         # Build producción
npm run preview       # Preview build
```

## 🎯 Próximos Pasos

1. Crear repositorio en GitHub
2. Inicializar estructura de carpetas
3. Configurar Anchor para smart contracts
4. Desarrollar programa BNPL en Rust
5. Crear API REST con Node.js
6. Desarrollar frontend React
7. Integrar todo el sistema
8. Escribir tests
9. Documentar
10. Desplegar en devnet

---

**Nota**: Esta estructura es modular y escalable. Cada componente puede desarrollarse y testearse independientemente.
