# tronswan

A React application that integrates with WordPress to display recipes, featuring:
- Modern React components with responsive design
- WordPress API integration for recipe content
- Weather data display
- FizzBuzz implementation
- Automated CI/CD pipeline with GitHub Actions
- Deployed to DigitalOcean App Platform at [https://tronswan.com](https://tronswan.com)

## Features

- **Recipe Display**: Browse and search recipes from WordPress
- **Weather Integration**: Real-time weather data display
- **Interactive Features**: FizzBuzz implementation and other interactive components
- **Responsive Design**: Mobile-friendly interface
- **Automated Testing**: Playwright tests for quality assurance

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/swantron/tronswan.git
cd tronswan
```

2. Install dependencies:
```bash
yarn install
```

## Available Scripts

### `yarn start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
- Hot reloading enabled
- Linting errors displayed in console
- Development environment configuration

### `yarn test`

Launches the interactive test runner in watch mode.
- Jest test runner
- Interactive test interface
- Automatic test watching

### `yarn build`

Builds the app for production to the `build` folder.
- Optimized for best performance
- Minified files
- Ready for deployment to DigitalOcean

## Deployment

The application is automatically deployed to DigitalOcean App Platform when changes are pushed to the main branch. The deployment process includes:
- Automated testing
- Build optimization
- Environment variable configuration
- Zero-downtime deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
