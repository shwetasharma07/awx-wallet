# 💰 Digital Wallet with Airwallex Integration

A modern, web-based digital wallet application with comprehensive Airwallex API integration for seamless money management.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shwetasharma07/awx-wallet)

## 🚀 Features

- **Send Money** - Transfer funds to email recipients with real-time validation
- **Request Money** - Send payment requests with status tracking
- **Add Money** - Fund wallet from credit cards or bank accounts
- **Cash Out** - Withdraw funds to bank accounts
- **Transaction History** - Complete audit trail with timestamps
- **Real-time Balance Updates** - Live balance synchronization
- **Professional UI** - Responsive design with loading states and animations

## 🎯 Live Demo

**Demo URL**: https://wallets-eyls84jqb-shwetasharma07s-projects.vercel.app

**Demo Credentials**:
- Email: `demo@wallet.com`
- Password: `demo123`

## 🏗️ Architecture

This is a pure web application built with:
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript
- **API Integration**: Mock Airwallex API wrapper for demo purposes
- **Storage**: localStorage for client-side persistence
- **Deployment**: Optimized for Vercel static hosting

## 📁 Project Structure

```
.
├── dist/                   # Production-ready web files
│   ├── index.html         # Main application
│   ├── app.js            # Application logic & UI controllers
│   └── js/
│       └── airwallex-api.js  # Airwallex API integration
├── .github/
│   └── workflows/
│       └── deploy.yml     # Auto-deployment to Vercel
├── vercel.json           # Vercel deployment configuration
└── package.json          # Project metadata
```

## 🛠️ Development

### Local Development
```bash
npm run dev
# Opens local server at http://localhost:8080
```

### Deployment
```bash
npm run deploy
# Deploys to Vercel production
```

## 🔧 Auto-Deployment

This repository includes GitHub Actions for automatic deployment to Vercel:
- **Push to main** → Automatic production deployment
- **Pull requests** → Preview deployments
- **Manual trigger** → Available from GitHub Actions tab

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript
- **API Integration**: Airwallex-compatible wrapper
- **Storage**: localStorage for persistence
- **Deployment**: Vercel with GitHub Actions
- **Architecture**: Static web application

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Shweta Sharma**
- GitHub: [@shwetasharma07](https://github.com/shwetasharma07)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/shwetasharma07/awx-wallet/issues).

---

Built with ❤️ using Expo and React Native