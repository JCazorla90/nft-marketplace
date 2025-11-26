# 🎮 BNPL NFT Marketplace

![Solana](https://img.shields.io/badge/Solana-14F195?style=for-the-badge&logo=solana&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

> Sistema de **Buy Now, Pay Later (BNPL)** para NFTs de videojuegos en Solana. Compra activos digitales ahora y paga en cuotas sin intereses.

## 🌟 Features

- ✅ **Smart Contracts en Solana** - Programas seguros en Rust/Anchor
- ✅ **Pagos programados** - Sistema automático de cobros
- ✅ **Bloqueo de NFTs** - Escrow seguro hasta completar pagos
- ✅ **Multi-wallet** - Soporte para Phantom, Solflare y WalletConnect
- ✅ **Conversión automática** - SOL ↔ USD en tiempo real
- ✅ **API REST** - Fácil integración para desarrolladores de juegos
- ✅ **Multi-entorno** - Devnet, Testnet y Mainnet
- ✅ **Dashboard completo** - Seguimiento de préstamos y pagos

## 🚨 Estado del repositorio y gaps actuales

- El README describe un monorepo con **backend**, **frontend** y documentación en `docs/`, pero en esta versión del código solo existen el programa Anchor en `programs/bnpl-contract/` y el componente de UI `BNPLNFTMarketplace.jsx`. Los comandos de instalación y la estructura listada no funcionarán hasta que se añadan esos directorios.
- El workflow `.github/workflows/matrixl.yml` asume carpetas `backend/` y `frontend/` con sus respectivos `package.json`; hoy la tubería fallará al no encontrarlos.
- El contrato en `programs/bnpl-contract/` tiene un `Cargo.toml` vacío: antes de compilar o desplegar debes completarlo con el `package.name`, dependencias Anchor y versión de Rust.
- No existe configuración de entorno (`.env.example`) ni migraciones de base de datos; las referencias en la sección de instalación son placeholders.
- No hay frontend/backend productivo todavía, pero ahora existe `demo-ui/`, una SPA de React/Tailwind que funciona en local y se puede publicar en GitHub Pages como demo.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estado del repositorio y gaps actuales](#-estado-del-repositorio-y-gaps-actuales)
- [Instalación](#instalación)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Deployment](#deployment)
- [Documentación](#documentación)
- [Cómo probar la UI incluida (demo)](#-cómo-probar-la-ui-incluida-demo)
- [Deployment rápido a GitHub Pages (solo la demo de UI)](#-deployment-rápido-a-github-pages-solo-la-demo-de-ui)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## 🏗️ Arquitectura

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │ ───> │  Backend    │ ───> │   Solana     │
│   (React)   │ <─── │  (Node.js)  │ <─── │  Blockchain  │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ↓
                     ┌─────────────┐
                     │  Database   │
                     │ (PostgreSQL)│
                     └─────────────┘
```

### Componentes Principales

1. **Smart Contracts (Rust/Anchor)**
   - Gestión de préstamos BNPL
   - Bloqueo/desbloqueo de NFTs
   - Procesamiento de pagos
   - Cálculo de intereses

2. **Backend API (Node.js/TypeScript)**
   - API REST para integración
   - Scheduler de pagos automáticos
   - Conversión de precios SOL/USD
   - Gestión de usuarios y préstamos

3. **Frontend (React/TypeScript)**
   - Marketplace de NFTs
   - Dashboard de préstamos
   - Integración con wallets
   - Simulador de cuotas

## 🛠️ Tecnologías

### Blockchain & Smart Contracts
- **Solana** - Blockchain de alta velocidad
- **Anchor** - Framework para Solana
- **Rust** - Lenguaje de programación
- **@solana/web3.js** - SDK de Solana

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipado estático
- **Express** - Framework web
- **Prisma** - ORM para base de datos
- **node-cron** - Tareas programadas

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **@solana/wallet-adapter** - Integración wallets
- **Axios** - Cliente HTTP

## 📦 Instalación

### Requisitos Previos

```bash
Node.js >= 18.x
Rust >= 1.70
Solana CLI >= 1.16
Anchor CLI >= 0.28
PostgreSQL >= 14
```

### Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/bnpl-nft-marketplace.git
cd bnpl-nft-marketplace
```

### Instalar Dependencias

```bash
# Instalar dependencias de todo el proyecto
npm install

# Smart Contracts
cd programs/bnpl-contract
cargo build-bpf

# Backend
cd ../../backend
npm install

# Frontend
cd ../frontend
npm install
```

### Configurar Variables de Entorno

```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Editar con tus valores:
# - DATABASE_URL
# - RPC_URL
# - PROGRAM_ID
# - JWT_SECRET
```

### Inicializar Base de Datos

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

## 🚀 Uso

### Modo Desarrollo

```bash
# Terminal 1: Smart Contracts (Devnet)
anchor test

# Terminal 2: Backend API
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

Abre tu navegador en `http://localhost:5173`

### Conectar Wallet

1. Instala [Phantom](https://phantom.app/) o [Solflare](https://solflare.com/)
2. Configura tu wallet en **Devnet**
3. Obtén SOL de prueba: `solana airdrop 2`
4. Conecta en la aplicación

### Crear un Préstamo BNPL

1. Navega al Marketplace
2. Selecciona un NFT
3. Click en "Comprar con BNPL"
4. Configura tus cuotas (2-6)
5. Ajusta el pago inicial (10-50%)
6. Confirma la transacción

## 💻 Desarrollo

### Estructura del Proyecto

```
bnpl-nft-marketplace/
├── programs/           # Smart contracts
├── backend/            # API REST
├── frontend/           # React app
├── tests/              # Tests
├── scripts/            # Scripts útiles
└── docs/               # Documentación
```

### Comandos Útiles

```bash
# Compilar smart contracts
anchor build

# Ejecutar tests
anchor test
npm run test

# Lint
npm run lint

# Format code
npm run format

# Deploy a devnet
npm run deploy:devnet
```

### Flujo de Desarrollo

1. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar y hacer commits
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request en GitHub
5. Esperar review y merge

## 🌐 Deployment

### Devnet (Desarrollo)

```bash
# Configurar Solana CLI para devnet
solana config set --url devnet

# Deploy smart contracts
anchor deploy

# Deploy backend (Railway)
railway up

# Deploy frontend (Vercel)
vercel --prod
```

### Mainnet (Producción)

```bash
# Configurar para mainnet
solana config set --url mainnet-beta

# Deploy con precaución
anchor deploy --provider.cluster mainnet

# Actualizar env variables en producción
# Backend: Railway dashboard
# Frontend: Vercel dashboard
```

## 📚 Documentación

- [📖 Documentación Completa](./docs/README.md)
- [🔧 API Reference](./docs/API.md)
- [📝 Smart Contracts](./docs/SMART_CONTRACTS.md)
- [🎮 Guía de Integración para Juegos](./docs/INTEGRATION.md)
- [🚀 Guía de Deployment](./docs/DEPLOYMENT.md)
- [🏗️ Arquitectura](./docs/ARCHITECTURE.md)

## 🧪 Cómo probar la UI incluida (demo)

`demo-ui/` ya contiene un frontend funcional con Vite + Tailwind basado en el componente `BNPLNFTMarketplace`. Solo necesitas Node 18+:

```bash
cd demo-ui
npm install
npm run dev -- --host
```

Abrir en `http://localhost:5173`.

Características de la demo:
- Simula conexión con Phantom/Solflare (usa modo demo si no detecta la extensión).
- Calcula cuotas BNPL (down payment, cuotas, interés demo) y las refleja en el dashboard.
- No envía transacciones en cadena; todo se mantiene en memoria del navegador.

## 🌐 Deployment rápido a GitHub Pages (solo la demo de UI)

1) Prepara el build con la ruta base de tu repo (necesaria para Pages). Si tu repositorio se llama `bnpl-nft-marketplace`, ejecuta:
```bash
cd demo-ui
VITE_BASE_PATH=/bnpl-nft-marketplace/ npm run deploy
```

2) El script genera `/demo-ui/dist` y publica automáticamente en la rama `gh-pages` usando `gh-pages`. Si prefieres subir manualmente, ejecuta solo `npm run build` y publica `demo-ui/dist/`.

3) En GitHub → Settings → Pages selecciona la rama `gh-pages`. La demo quedará disponible en `https://<tu-usuario>.github.io/<tu-repo>/`.

## 🎯 Roadmap

### Fase 1: MVP ✅
- [x] Smart contract básico BNPL
- [x] API REST funcional
- [x] Frontend marketplace
- [x] Integración con wallets

### Fase 2: En Desarrollo 🚧
- [ ] Tests completos (>80% coverage)
- [ ] Documentación API
- [ ] Dashboard admin
- [ ] Notificaciones email/SMS

### Fase 3: Futuro 🔮
- [ ] Multi-chain (Ethereum, Polygon)
- [ ] Staking de governance token
- [ ] Liquidación de préstamos morosos
- [ ] Integración con más juegos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y proceso de pull requests.

### Pasos para Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👥 Equipo

- **Backend & Smart Contracts** - Desarrollo de programas Solana
- **Frontend** - UI/UX y React
- **DevOps** - Infraestructura y CI/CD

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Solana Foundation](https://solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Metaplex](https://www.metaplex.com/)
- Comunidad de Solana

## 📞 Contacto

- Website: [Pendiente](·)
- Twitter: [@JCazorla90](https://x.com/JCazorla90)
- Discord: [Join our community](https://discord.gg/GPdUMtHNX)
- Email: bnplnft@gmail.com

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**

Made with ❤️ by the BNPL NFT Team
