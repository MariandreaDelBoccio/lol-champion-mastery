# 🏆 LoL Champion Mastery Tracker

A modern, responsive web application for tracking League of Legends champion mastery data. Built with React and powered by the official Riot Games API.

![LoL Champion Mastery](https://img.shields.io/badge/League%20of%20Legends-Champion%20Mastery-C8AA6E?style=for-the-badge&logo=riot-games)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Netlify](https://img.shields.io/badge/Netlify-Functions-00C7B7?style=for-the-badge&logo=netlify)

## ✨ Features

- 🔍 **Player Search**: Search players using the modern Riot ID system (Game Name + Tag Line)
- 📊 **Champion Mastery**: View detailed mastery data with color-coded levels
- 🎯 **Champion Details**: Complete champion information with tips and strategies
- 🎨 **Modern UI**: Beautiful gold-themed design inspired by League of Legends
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time Data**: Live data from Riot Games API
- 🛡️ **Secure**: API keys protected with serverless functions

## 🎮 Live Demo

**[View Live Application](https://your-netlify-url.netlify.app)**

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, CSS3
- **Backend**: Netlify Functions (Serverless)
- **API**: Riot Games API, Data Dragon
- **Build Tool**: Vite
- **Deployment**: Netlify
- **Version Control**: Git, GitHub

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Riot Games API Key ([Get one here](https://developer.riotgames.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MariandreaDelBoccio/lol-champion-mastery.git
   cd lol-champion-mastery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Riot API key:
   ```
   RIOT_API_KEY=RGAPI-your-api-key-here
   VITE_DDRAGON_VERSION=14.1.1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **For full API testing (with Netlify Functions)**
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

## 📖 Usage

1. **Login**: Use any username/password (demo authentication)
2. **Search**: Enter a player's Game Name and select their Tag Line
3. **Explore**: View champion mastery data with color-coded levels:
   - 🔵 **Level 7**: Teal (Master)
   - 🟣 **Level 5-6**: Purple (Advanced) 
   - 🟡 **Level 4**: Gold (Intermediate)
   - ⚪ **Level 1-3**: Gray (Beginner)
4. **Champion Details**: Click any champion for detailed information and tips

## 🏗️ Project Structure

```
lol-champion-mastery/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API clients and utilities
│   ├── context/            # React Context providers
│   └── assets/             # Static assets
├── netlify/
│   └── functions/          # Serverless API functions
├── public/                 # Public static files
└── dist/                   # Production build
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RIOT_API_KEY` | Your Riot Games API key | Yes |
| `VITE_DDRAGON_VERSION` | Data Dragon version | No (defaults to 14.1.1) |

### Supported Regions

- **EUW** - Europe West
- **EUNE** - Europe Nordic & East  
- **NA1** - North America
- **KR** - Korea
- **JP1** - Japan
- **BR1** - Brazil
- **LA1/LA2** - Latin America
- **OC1** - Oceania
- **TR1** - Turkey
- **RU** - Russia

## 🚀 Deployment

### Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add `RIOT_API_KEY` with your API key

4. **Deploy!** 🎉

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This project is not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.

## 🙏 Acknowledgments

- [Riot Games](https://developer.riotgames.com/) for the amazing API
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) for static game data
- [React](https://reactjs.org/) team for the excellent framework
- [Netlify](https://netlify.com/) for serverless functions and hosting

---

**Made with ❤️ for the League of Legends community**