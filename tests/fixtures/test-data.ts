export const testData = {
  urls: {
    base: 'https://tronswan.com',
    local: 'http://localhost:5173',
    home: '/',
    weather: '/weather',
    swantron: '/swantron',
    hacking: '/hacking',
    hello: '/hello',
    health: '/health',
    gangnam1: '/gangnam1',
    gangnam2: '/gangnam2',
    fizzBuzz: '/trontronbuzztron',
  },
  
  expectedContent: {
    home: {
      title: 'tronswan',
      swantronLinkText: 'tron swan dot com',
      swantronLinkHref: '#',
    },
    
    weather: {
      temperaturePattern: /🌡️ (-3[0-9]|-[1-9]|[0-9]|[1-9][0-9]|1[01][0-9]|120)°F/,
      minTemperature: -30,
      maxTemperature: 120,
    },
    
    navigation: {
      links: [
        { text: 'tronswan', href: '/' },
        { text: 'swantron', href: '/swantron' },
        { text: 'weathertron', href: '/weather' },
        { text: 'chomptron', href: 'https://chomptron.com' },
        { text: 'hello', href: '/hello' },
        { text: 'health', href: '/health' },
      ],
    },
  },
  
  performance: {
    maxLoadTime: 5000, // 5 seconds
    maxDomContentLoaded: 3000, // 3 seconds
    maxFirstPaint: 2000, // 2 seconds
  },
  
  accessibility: {
    requiredAltTexts: ['logo'],
    requiredAriaLabels: [],
    requiredRoles: ['main', 'navigation'],
  },
  
  responsive: {
    breakpoints: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
    },
  },
  
  errorMessages: {
    networkError: 'Network error occurred',
    loadError: 'Page failed to load',
    timeoutError: 'Operation timed out',
  },
};

export const mockApiResponses = {
  weather: {
    temperature: 72.5,
    condition: 'sunny',
    location: 'San Francisco',
  },
  
  swantron: [
    {
      id: 1,
      title: 'Test Swantron 1',
      description: 'A test swantron item',
      category: 'test',
    },
    {
      id: 2,
      title: 'Test Swantron 2',
      description: 'Another test swantron item',
      category: 'test',
    },
  ],
};
