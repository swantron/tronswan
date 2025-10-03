# Service Health & Deployment Status Page

This page provides real-time monitoring of service health, deployment status, and infrastructure metrics by integrating with GitLab CI and DigitalOcean APIs.

## Features

### 🚀 Deployment Status
- **GitLab CI Integration**: View recent pipelines, jobs, and deployment status
- **Project Selection**: Switch between different GitLab projects
- **Pipeline Details**: See commit information, author, duration, and job status
- **Real-time Updates**: Automatic refresh every 30 seconds

### ☁️ Infrastructure Monitoring
- **DigitalOcean Droplets**: Monitor server status, specs, and performance
- **Load Balancers**: Check load balancer health and configuration
- **Databases**: View database status and connection details
- **Account Limits**: Track resource usage against account limits

### 🌐 Service Health
- **Multi-service Monitoring**: Track health of tronswan, chomptron, and swantron
- **Response Time Monitoring**: Measure and display service response times
- **Uptime Tracking**: Monitor service availability
- **Health Status Indicators**: Visual status indicators for quick assessment

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# GitLab CI Configuration
# Get your GitLab token from: https://gitlab.com/-/profile/personal_access_tokens
# Create a token with 'api' scope
REACT_APP_GITLAB_TOKEN=your_gitlab_token_here
REACT_APP_GITLAB_URL=https://gitlab.com/api/v4

# DigitalOcean Configuration
# Get your DigitalOcean token from: https://cloud.digitalocean.com/account/api/tokens
# Create a token with 'read' scope
REACT_APP_DIGITALOCEAN_TOKEN=your_digitalocean_token_here
```

### API Token Setup

#### GitLab CI Token
1. Go to [GitLab Personal Access Tokens](https://gitlab.com/-/profile/personal_access_tokens)
2. Create a new token with `api` scope
3. Copy the token and add it to your `.env` file

#### DigitalOcean Token
1. Go to [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Generate a new token with `read` scope
3. Copy the token and add it to your `.env` file

## Usage

1. **Navigate to Health Page**: Click on "health" in the navigation menu
2. **View Deployment Status**: See recent GitLab CI pipelines and their status
3. **Monitor Infrastructure**: Check DigitalOcean resources and their health
4. **Track Service Health**: Monitor your applications' availability and performance
5. **Refresh Data**: Use the refresh button to manually update all data

## Components

### HealthPage
Main component that orchestrates all health monitoring features.

### GitLabStatus
- Displays GitLab CI pipeline information
- Shows project selection dropdown
- Renders pipeline details and job status
- Handles real-time data fetching

### DigitalOceanStatus
- Tabs for different resource types (Droplets, Load Balancers, Databases, Account)
- Displays resource specifications and status
- Shows account limits and usage

### ServiceHealth
- Monitors external service availability
- Performs health checks with response time measurement
- Displays service status summary

## Styling

The health page uses a modern, responsive design with:
- Gradient background with glassmorphism effects
- Card-based layout for different sections
- Status indicators with color coding
- Responsive grid layout
- Smooth animations and transitions

## Error Handling

- Graceful error handling for API failures
- User-friendly error messages
- Fallback states when data is unavailable
- Loading states during data fetching

## Security

- API tokens are stored in environment variables
- No sensitive data is exposed in the frontend
- CORS-compliant API requests
- Secure token-based authentication

## Future Enhancements

- Historical data and trends
- Alerting and notifications
- Custom health check endpoints
- Integration with additional monitoring tools
- Performance metrics and charts
