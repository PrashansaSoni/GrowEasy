# Todo Mobile Application

A React Native mobile application for managing todos with authentication and API integration.

## Features

- User Authentication (Login/Signup)
- Create, Read, Update, Delete Todos
- Mark todos as complete/incomplete
- Separate sections for active and completed todos
- User Profile view
- JWT token-based authentication
- Modern, clean UI design

## Tech Stack

- React Native with Expo
- React Navigation for routing
- Axios for API calls
- AsyncStorage for local storage

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `api/config.js` if needed:
   - iOS Simulator: `http://localhost:8000`
   - Android Emulator: `http://10.0.2.2:8000`
   - Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:8000`)

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator
   - Or press `w` for web browser

## Project Structure

```
frontend/
├── App.js                 # Main app component with navigation
├── api/
│   └── config.js         # API configuration and axios setup
├── screens/
│   ├── LoginScreen.js    # Login screen
│   ├── SignupScreen.js   # Signup screen
│   ├── DashboardScreen.js # Main todo list screen
│   └── ProfileScreen.js  # User profile screen
├── metro.config.js        # Metro bundler configuration
└── package.json
```

## App Screens

### Login Screen
First-time users need to sign up, returning users can log in with their credentials.

### Signup Screen
New users can create an account by providing name, email, and password.

### Dashboard
- View all todos separated into Active and Completed sections
- Create new todos with title and description
- Mark todos as complete/incomplete by tapping the checkbox
- Delete todos
- Navigate to profile
- Logout

### Profile
- View user details (name and email)
- Logout option

## Screenshots

Click on the links below to view screenshots of the application:

- **[Login Screen](screenshots/signin.png)** - User login interface
- **[Signup Screen](screenshots/signup.png)** - New user registration
- **[Dashboard Screen](screenshots/dashboard1.png)** - Main todo management interface
- **[Dashboard Screen](screenshots/dashboard2.png)** - Create new todo interface
- **[Profile Screen](screenshots/profile.png)** - User profile and settings

## API Integration

The app integrates with the FastAPI backend at `http://localhost:8000`. Make sure the backend is running before using the app.

Endpoints used:
- POST `/signup` - Create new user account
- POST `/login` - Authenticate user
- GET `/profile` - Get user profile
- GET `/todos` - Get all todos for logged-in user
- POST `/todos` - Create new todo
- PUT `/todos/:id` - Update todo
- DELETE `/todos/:id` - Delete todo

## Note

This app uses in-memory storage on the backend, so data will be lost when the server restarts. For production, connect to a real database like MongoDB or PostgreSQL.