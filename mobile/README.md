# Planning Poker Mobile App

React Native mobile application for Planning Poker, built with Expo.

## Features

- 🔐 JWT Authentication (Login/Signup)
- 🏠 Room Management (Create/Join rooms)
- 👥 Real-time participant tracking
- 🔄 WebSocket integration for live updates
- 🌓 Dark mode support
- 💾 Offline token persistence

## Prerequisites

- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Backend server running on `http://localhost:3000`

## Installation

```bash
cd mobile
npm install
```

## Running the App

### Development Mode

```bash
npx expo start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator  
- Scan QR code with Expo Go app for physical device

### Platform-Specific

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Configuration

### Backend URL

Update the backend URL in these files for different environments:

- `services/api.ts` - REST API base URL
- `services/socket.ts` - WebSocket URL

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Development
  : 'https://your-production-url.com';  // Production
```

## Project Structure

```
mobile/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── room/              # Room screens
│   └── _layout.tsx        # Root navigation
├── components/            # Reusable components
│   └── ui/               # UI components (Button, Input)
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── RoomContext.tsx   # Room state
├── services/             # API services
│   ├── api.ts           # Axios instance
│   ├── auth.api.ts      # Auth endpoints
│   ├── rooms.api.ts     # Room endpoints
│   └── socket.ts        # WebSocket client
└── types/               # TypeScript types
    └── api.ts           # API type definitions
```

## Usage

### Authentication  

1. **Signup**: Create new account with name, email, and password
2. **Login**: Sign in with existing credentials
3. **Auto-login**: Token persists across app restarts

### Room Management

1. **Create Room**: Enter room name to create new session
2. **Join Room**: Enter 6-character room code to join
3. **My Rooms**: View and access your created rooms

### Room Features

- View real-time participant list
- Share room code with team
- Leave room when done

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **Storage**: AsyncStorage
- **Language**: TypeScript

## Testing

### Before Testing
1. Ensure backend is running on `localhost:3000`
2. Database is properly configured
3. WebSocket server is active

### Test Scenarios
- ✅ User signup and login
- ✅ Token persistence
- ✅ Create room
- ✅ Join room with code
- ✅ Real-time participant updates
- ✅ Leave room
- ✅ Logout

## Troubleshooting

### Cannot connect to backend
- Check backend is running on correct port
- For physical devices, use your computer's IP address instead of `localhost`
- Update `API_BASE_URL` in `services/api.ts`

### WebSocket not connecting
- Verify WebSocket URL matches backend
- Check CORS configuration on backend
- Review network logs in Expo devtools

### Token not persisting
- Check AsyncStorage permissions
- Clear app data and reinstall
- Verify token is being saved in `auth.api.ts`

## Next Steps (Week 2+)

- Add voting functionality
- Implement card deck selection
- Add voting timer
- Show voting statistics
- Add room history

## License

MIT
