# NeoWiki

A modern, open-source wiki encyclopedia system built with Node.js, Express.js, and Markdown.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![Express](https://img.shields.io/badge/express-%5E4.18.2-orange.svg)

## Features

- **Markdown Editor** - Write articles with a rich Markdown editor supporting live preview
- **User Authentication** - Secure user registration and login system with bcrypt password hashing
- **Theme System** - 8 beautiful themes including dark, light, cyberpunk, forest, and more
- **Tag System** - Organize articles with colorful tags
- **Search Functionality** - Full-text search across all articles
- **Responsive Design** - Mobile-friendly UI with modern aesthetics
- **Image Support** - Upload and display images in articles
- **External Database** - Flexible database integration via REST API

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: Express Session, bcryptjs
- **Database**: External REST API integration
- **Markdown**: Custom MDParser library

## Project Structure

```
NeoWiki/
├── src/
│   ├── server.js          # Main Express server
│   ├── config.js          # Configuration management
│   ├── database.js        # Database API integration
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   └── routes/
│       ├── api.js         # General API routes
│       ├── articles.js    # Article CRUD operations
│       └── users.js       # User management
├── public/
│   ├── index.html         # Landing page
│   ├── home.html          # Homepage with article list
│   ├── article.html       # Article viewer
│   ├── editor.html        # Markdown editor
│   ├── search.html        # Search page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── admin.html         # Admin dashboard
│   ├── settings.html       # User settings
│   ├── user.html          # User profile
│   ├── css/
│   │   └── style.css      # Global styles
│   ├── js/
│   │   ├── api.js         # API client
│   │   ├── components.js  # Reusable UI components
│   │   ├── theme.js       # Theme management
│   │   └── wiki-settings.js # Wiki configuration
│   └── lib/
│       ├── MDParser.js    # Markdown parser
│       ├── editor-app.js  # Editor functionality
│       └── editor-styles.css # Editor styles
├── uploads/                # User uploaded files
├── package.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SoraStr/NeoWiki.git
cd NeoWiki
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database API endpoint
```

4. Start the server:
```bash
npm start
```

5. Open your browser and visit `http://localhost:3000`

### First-Time Setup

On first run, you'll be prompted to:
1. Set your wiki name and description
2. Create an admin account

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_API_URL=https://your-database-api.com
SESSION_SECRET=your-secret-key-here
```

### Wiki Settings

Customize your wiki through the admin panel:
- Wiki name and description
- Logo (emoji or image URL)
- Feature cards
- Available themes

## Available Themes

1. **Vocaloid Dark** (default) - Purple and pink gradient theme
2. **Light** - Clean white theme
3. **Sepia** - Warm paper-like theme
4. **Cyberpunk** - Neon-infused dark theme
5. **Forest** - Natural green theme
6. **Ocean** - Deep blue theme
7. **Sunset** - Warm orange gradient
8. **Hacker** - Terminal-style theme

## API Reference

### Articles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List all articles |
| GET | `/api/articles/:id` | Get article by ID |
| POST | `/api/articles` | Create new article |
| PUT | `/api/articles/:id` | Update article |
| DELETE | `/api/articles/:id` | Delete article |
| GET | `/api/articles/search?q=` | Search articles |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| GET | `/api/user` | Get current user |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/settings` | Get site settings |
| PUT | `/api/admin/settings` | Update site settings |

## Development

### Running in Development

```bash
npm run dev
```

### Code Style

The project uses vanilla JavaScript with consistent naming conventions:
- CamelCase for functions and variables
- PascalCase for component constructors

## Customization

### Adding New Themes

Edit `public/css/style.css` and add a new `[data-theme="theme-name"]` selector with your color variables.

### Extending the Markdown Parser

The custom MDParser in `public/lib/MDParser.js` can be extended to support additional Markdown syntax.

### Integrating Different Databases

Modify `src/database.js` to connect to your preferred database while maintaining the same API interface.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Express.js team for the web framework
- The open-source community for various utilities
