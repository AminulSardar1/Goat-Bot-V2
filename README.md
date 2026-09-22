# 🐐 Goat-Bot-V2 BY AMINUL SARDAR

**Goat Bot-V2** is a powerful Facebook Messenger chatbot that runs using your **Facebook account's appstate (cookies)**. This bot listens to your messages in Messenger and handles 250+ useful commands with an easily customizable structure for developers.

[![GitHub stars](https://img.shields.io/github/stars/AminulSardar1/Goat-Bot-V2)](https://github.com/AminulSardar1/Goat-Bot-V2/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AminulSardar1/Goat-Bot-V2)](https://github.com/AminulSardar1/Goat-Bot-V2/network)
[![GitHub issues](https://img.shields.io/github/issues/AminulSardar1/Goat-Bot-V2)](https://github.com/AminulSardar1/Goat-Bot-V2/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

- 🤖 **Facebook Messenger Integration** - Direct chatbot functionality
- 🔐 **Secure Login** - Uses Facebook `appstate.json` (cookies) for authentication
- ⚡ **250+ Built-in Commands** - Extensive command library
- 🛠️ **Developer Friendly** - Easily customizable structure
- 🔄 **Auto-restart** - Automatic bot recovery and restart functionality
- 📊 **Dashboard** - Web-based control panel
- 🌐 **Multi-language Support** - Support for multiple languages
- 💾 **Database Integration** - SQLite and MongoDB support

## 🧰 Requirements

- **Node.js** version 18 or higher (18+)
- **Facebook account** with valid cookies
- **Internet connection** for Facebook API access

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AminulSardar1/Goat-Bot-V2.git
cd Goat-Bot-V2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Facebook Authentication

Create an `account.txt` file in the root directory and add your Facebook account cookies in one of these formats:

#### Option A: JSON Array Format (Recommended)
```json
[
  {
    "key": "c_user",
    "value": "your_c_user_value",
    "domain": "facebook.com",
    "path": "/",
    "hostOnly": false,
    "creation": "2024-01-01T00:00:00.000Z",
    "lastAccessed": "2024-01-01T00:00:00.000Z"
  },
  {
    "key": "xs",
    "value": "your_xs_value",
    "domain": "facebook.com",
    "path": "/",
    "hostOnly": false,
    "creation": "2024-01-01T00:00:00.000Z",
    "lastAccessed": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Option B: Cookie String Format
```
c_user=your_value; xs=your_value; datr=your_value; fr=your_value
```

#### Option C: Email/Password Format
```
your_email@example.com
your_password
your_2fa_code_or_secret
```

### 4. Configure the Bot

Edit `config.json` to customize your bot settings:

```json
{
  "prefix": "!",
  "adminBot": ["your_facebook_id"],
  "language": "en",
  "nickNameBot": "Goat Bot"
}
```

### 5. Run the Bot

```bash
npm start
```

## 🚀 Usage

Once the bot is running:

- The bot will automatically login to your Facebook account
- It listens to Messenger chats in the background
- Use commands with your configured prefix (default: `!`)

### Available Commands

```bash
!help          # Show all available commands
!uptime        # Check bot uptime
!ping          # Test bot response
!admin         # Admin panel access
!user          # User information
!balance       # Check your balance
!daily         # Daily rewards
```

## 📁 Project Structure

```
Goat-Bot-V2/
├── bot/                    # Core bot files
│   ├── handler/           # Event and action handlers
│   ├── login/             # Login and authentication
│   └── custom.js          # Custom bot functions
├── scripts/               # Bot commands and events
│   ├── cmds/             # Command files
│   └── events/           # Event handlers
├── database/             # Database models and controllers
├── languages/            # Language files
├── config.json           # Bot configuration
├── account.txt           # Facebook authentication
└── package.json          # Dependencies
```

## 🔧 Configuration

### Main Configuration (`config.json`)

Key configuration options:

- `prefix`: Command prefix (default: "!")
- `adminBot`: Array of admin Facebook IDs
- `language`: Bot language ("en", "vi", etc.)
- `autoRestart`: Auto-restart settings
- `dashBoard`: Dashboard configuration

### Command Configuration (`configCommands.json`)

Configure individual commands:

- Enable/disable commands
- Set command permissions
- Configure command-specific settings

## 🌐 FCA (Facebook Chat API) Types

The bot supports multiple FCA implementations:

```bash
# Primary (Recommended)
aminul-new-fca

# Alternative
fca-unofficial
```

## 🔒 Security & Privacy

- ⚠️ **Never share your `account.txt` file**
- 🔐 Use strong passwords and enable 2FA
- 🛡️ Keep your bot updated to the latest version
- 📝 Review permissions before adding new commands

## 🐛 Troubleshooting

### Common Issues

1. **Login Failed**
   - Update your cookies in `account.txt`
   - Check if your Facebook account is locked
   - Verify 2FA settings

2. **Commands Not Working**
   - Check the prefix in `config.json`
   - Verify command permissions
   - Check bot admin status

3. **Database Errors**
   - Ensure proper file permissions
   - Check SQLite database integrity
   - Verify database configuration

### Getting Help

- 📋 Check the [Issues](https://github.com/AminulSardar1/Goat-Bot-V2/issues) page
- 💬 Join our community discussions
- 📧 Contact support for critical issues

## 🚀 Deployment

### Deploy on Replit

1. Import your repository to Replit
2. Set up your `account.txt` file
3. Configure environment variables
4. Run the bot using the Run button

### Environment Variables

Set these in your deployment environment:

- `NODE_ENV`: Production environment
- `PORT`: Server port (default: 5000)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex functions
- Test your changes thoroughly
- Update documentation as needed

## 📋 Changelog

### Version 1.5.35 (Latest)
- Enhanced login system with aminul-new-fca
- Improved error handling
- Added new commands
- Bug fixes and performance improvements

### Previous Versions
See [CHANGELOG.md](CHANGELOG.md) for complete version history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author & Credits

**Developed with ❤️ by [MD. AMINUL SARDAR](https://github.com/AminulSardar1)**

- 🌐 **GitHub**: [MDAMINULSARDAR](https://github.com/AminulSardar1)
- 📘 **Facebook**: [facebook.com/100071880593545](https://facebook.com/100071880593545)
- 📧 **Contact**: [Create an Issue](https://github.com/AminulSardar1/Goat-Bot-V2/issues)

### Special Thanks

- Original GoatBot framework by NTKhang
- Facebook Chat API community
- All contributors and supporters

## ⚠️ Disclaimer

- This bot is for educational and personal use only
- Users are responsible for compliance with Facebook's Terms of Service
- The author is not responsible for any misuse of this software
- Use at your own risk

## 🌟 Support the Project

If you find this project helpful:

- ⭐ **Star** this repository
- 🍴 **Fork** and contribute
- 🐛 **Report** bugs and issues
- 💡 **Suggest** new features
- 📢 **Share** with others

---

<div align="center">

**[⬆ Back to Top](#-goat-bot-v2)**

Made with ❤️ by [Aminul Sardar](https://github.com/AminulSardar1)

</div>
