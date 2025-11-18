# YouStrict 📺

A curated, kid-safe YouTube video streaming app for Android TV and Apple TV platforms. YouStrict provides Indonesian parents with a controlled environment for their children to watch pre-approved educational content.

## 🎯 Overview

**YouStrict** (YouTube + Strict) is a TV-first application that delivers a carefully curated collection of Indonesian children's educational videos. Unlike standard YouTube apps, YouStrict only displays content from whitelisted channels, ensuring a safe viewing experience with no ads, recommendations, or user-generated content.

### Key Features

- 📺 **TV-Optimized UI** - 4-column grid layout designed for living room viewing
- 🔒 **Curated Content Only** - Pre-approved Indonesian educational channels
- ⚡ **Offline-First** - All video metadata stored locally for instant loading
- 🎨 **Modern Stack** - React Native TV + Expo + Drizzle ORM + TailwindCSS
- 🚀 **High Performance** - FlashList for efficient rendering, parallel data fetching
- 🔄 **Auto-Updates** - CLI tool to refresh channel data from YouTube

## 🏗️ Tech Stack

- **[React Native TV](https://github.com/react-native-tvos/react-native-tvos)** - tvOS fork supporting Android TV & Apple TV
- **[Expo SDK 54](https://expo.dev/)** - Framework with TV config plugin
- **[Expo Router 6](https://docs.expo.dev/router/introduction/)** - File-based routing with typed routes
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL with Expo SQLite
- **[TailwindCSS 4 + NativeWind 5](https://www.nativewind.dev/)** - Utility-first styling
- **[@shopify/flash-list](https://shopify.github.io/flash-list/)** - High-performance lists
- **[react-native-youtube-bridge](https://github.com/LonelyCpp/react-native-youtube-bridge)** - YouTube video playback

## 📦 Installation

```bash
# Install dependencies
bun install

# Generate native code for TV
bun run prebuild:tv
```

## 🚀 Running the App

```bash
# Start development server (TV mode)
bun run start

# Build and run on Android TV
bun run android

# Build and run on Apple TV
bun run ios

# Web preview
bun run web
```

> **Note:** TV mode is enabled by default via `EXPO_TV=1` environment variable in package.json scripts.

## 🗄️ Database Architecture

The app uses **Expo SQLite** with **Drizzle ORM** for local data storage:

### Tables

- **`videos`** - Video metadata (id, title, duration, views, thumbnail, timestamp, channelId, channelName)
- **`channels`** - Aggregated channel data (id, name, totalVideos)
- **`settings`** - App configuration (lastUpdatedAt tracking)

### Data Flow

1. **Initial Load** - App runs migrations and checks `lastUpdatedAt` timestamp
2. **Smart Seeding** - If data is outdated, clears and reseeds from `/data/*.json` files
3. **Channel Aggregation** - Automatically calculates channel statistics from videos
4. **Instant Access** - All queries run locally for offline-first experience

## 📝 Content Management

### Adding/Updating Channels

Use the built-in CLI tool to fetch the latest videos from YouTube channels:

```bash
# Add or update a channel
bun run data/generate.ts <channel-name>

# Examples:
bun run data/generate.ts CocomelonIndonesia
bun run data/generate.ts BabyBusID
```

**What it does:**
1. Uses `yt-dlp` to fetch all video metadata from the channel
2. Processes videos in parallel batches (10x faster than sequential)
3. Saves data to `data/<channel-name>.json`
4. Auto-updates `data/index.ts` with imports and exports
5. Sets `lastUpdatedAt` timestamp for change detection

### Prerequisites

Install yt-dlp:

```bash
# macOS
brew install yt-dlp

# Or with pip
pip install yt-dlp
```

### Current Channels

The app includes 11 curated Indonesian children's channels:

- Cocobi Toys
- Bing Indonesia
- Sheriff Labrador ID
- Yes Neo ID
- Leo Si Penjaga Alam
- Kabi Kisah Teladan Nabi
- Belajar Bersama Kinderflix
- Marbel Educa Studio
- Minivila ID
- Nusa Official Series
- Si Kecil Pintar

## 📱 Project Structure

```
YouStrict/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with DB initialization
│   ├── index.tsx          # Home screen with video grid
│   └── videos/[id]/       # Video player page
├── components/            # Reusable UI components
│   └── video-card.tsx     # TV-optimized video card
├── data/                  # YouTube channel data
│   ├── generate.ts        # CLI tool to fetch videos
│   ├── index.ts          # Auto-generated exports
│   └── *.json            # Channel video metadata
├── db/                    # Database layer
│   ├── schema.ts         # Drizzle ORM schema
│   └── index.ts          # Database instance
├── drizzle/              # SQL migrations
├── helpers/              # Utility functions
│   └── video.ts          # Formatting helpers
└── hooks/                # Custom React hooks
    ├── use-database-init.ts  # DB setup & seeding
    └── use-videos.ts         # Video pagination
```

## 🎨 TV-Specific Features

### Focus Management

The app includes focus states optimized for TV remote navigation:

```tsx
// Video cards show visual feedback when focused
<Pressable
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
>
  {/* Rounded corners and background on focus */}
</Pressable>
```

### Grid Layout

- **4-column grid** optimized for TV screen dimensions
- **FlashList** for smooth scrolling with thousands of videos
- **Infinite scroll** with page-based pagination (20 items/page)

### Navigation

- File-based routing with Expo Router
- Type-safe navigation with generated routes
- TV-friendly transitions

## 🔧 Development

### Database Migrations

```bash
# Generate migration from schema changes
bunx drizzle-kit generate

# Push changes to database
bunx drizzle-kit push
```

### Building for Production

```bash
# Preview build (APK for Android TV)
eas build --profile preview --platform android

# Production build
eas build --platform android
eas build --platform ios
```

## 🎯 Design Philosophy

### 1. **Safety First**
- Only whitelisted channels appear in the app
- No search, recommendations, or user-generated content
- No comments, ads, or external links

### 2. **Offline-First**
- All metadata stored locally in SQLite
- Videos play via YouTube player (requires internet)
- Instant app navigation without loading states

### 3. **TV-Optimized**
- Built specifically for TV platforms, not adapted from mobile
- Remote control navigation with clear focus states
- 10-foot UI with appropriate text sizes and spacing

### 4. **Type Safety**
- Full TypeScript coverage
- Drizzle ORM with inferred types
- Type-safe routing with Expo Router

### 5. **Performance**
- FlashList for efficient list rendering
- Parallel data fetching (10 videos at once)
- Smart caching with timestamp-based updates

## 📄 License

This project is maintained by [@fachrihawari](https://github.com/fachrihawari).

## 🤝 Contributing

This is a personal project for providing safe content to Indonesian children. If you'd like to suggest channels or improvements, please open an issue.

---

**Made with ❤️ for Indonesian families**
