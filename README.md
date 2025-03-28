# Lightning Network Web Application

A cutting-edge Lightning Network web application built with React, TypeScript, and WebLN, featuring a sleek UI powered by Tailwind CSS and integration with Alby APIs.

## Features

- **WebLN Integration**: Connect to Lightning wallets through the WebLN standard
- **Send Payments**: Send payments using BOLT11 invoices or Lightning addresses
- **Keysend Payments**: Direct node-to-node payments with custom TLV records
- **Scroll-triggered Micropayments**: Innovative payments triggered by scrolling
- **Wallet Dashboard**: View wallet balance and node information
- **Invoice Generation**: Create and share Lightning invoices with QR codes
- **Fiat Conversion**: Real-time conversion between sats and fiat currencies
- **Dark Mode**: Seamless theme switching with system preference detection

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Lightning Network**: WebLN, Alby Wallet API

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- A WebLN-compatible wallet (Alby, Joule, etc.)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/lightning-app.git
   cd lightning-app
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Connect Wallet**: Click the "Connect WebLN" button in the header to connect your Lightning wallet
2. **View Wallet Info**: See your balance and node information in the Wallet Dashboard
3. **Send Payments**: Paste a BOLT11 invoice or enter a Lightning address to send payments
4. **Generate Invoices**: Create invoices with custom amounts and memos
5. **Keysend Payments**: Send direct payments to nodes using their public key
6. **Scroll Payments**: Configure automatic payments triggered by scrolling

## Development

### Project Structure 