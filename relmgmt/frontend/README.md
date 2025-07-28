# Release Management System - Frontend

This is the frontend application for the Release Management System, built with React 19.1.0, Vite, and TypeScript.

## Technology Stack

- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: ShadCB UI (custom components)
- **Styling**: Tailwind CSS
- **Routing**: React Router 6
- **State Management**: React Query + Context API
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Documentation**: Storybook

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager

## Getting Started

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd relmgmt/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building

Build the application for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:ui
```

### Linting and Formatting

Run ESLint:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

### Storybook

Start Storybook development server:
```bash
npm run storybook
```

Build Storybook:
```bash
npm run build-storybook
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── common/          # Common components
│   ├── layout/          # Layout components
│   └── forms/           # Form components
├── pages/               # Page components
├── services/
│   └── api/             # API service modules
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── constants/           # Application constants
└── test/                # Test setup files
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Write unit tests for all components
- Document components with Storybook stories

### Component Development

1. Create the component in the appropriate directory
2. Write tests for the component
3. Create Storybook stories for documentation
4. Export the component from an index file

### API Integration

- Use the `apiClient` from `src/services/api/apiClient.ts`
- Create service modules for each API endpoint
- Use React Query for data fetching and caching
- Handle errors appropriately

## Testing Strategy

- Unit tests for all components and utilities
- Integration tests for complex workflows
- E2E tests for critical user journeys
- Storybook for component documentation and testing

## CI/CD

The project includes GitHub Actions workflows for:
- Automated testing
- Linting and formatting checks
- Build verification
- Storybook build

## Contributing

1. Create a feature branch
2. Make your changes
3. Write or update tests
4. Run linting and tests
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Dependencies not found**: Run `npm install` to install missing dependencies
2. **TypeScript errors**: Check that all types are properly imported and defined
3. **Build failures**: Ensure all required environment variables are set

### Getting Help

- Check the Storybook documentation for component usage
- Review the test files for examples
- Consult the technical specification documents
