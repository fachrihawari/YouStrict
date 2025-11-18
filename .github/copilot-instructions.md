# GitHub Copilot Instructions for YouStrict

## Project Context

YouStrict is a TV-first React Native application for Android TV and Apple TV that provides curated Indonesian children's educational content. It's built with safety and parental control as core principles.

## Technology Stack

- **Framework**: React Native TV (tvOS fork), Expo SDK 54, Expo Router 6
- **Styling**: TailwindCSS 4 + NativeWind 5
- **Database**: Expo SQLite + Drizzle ORM
- **UI**: @shopify/flash-list, react-native-youtube-bridge
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun

## Code Style & Conventions

### General Guidelines

1. **Always use TypeScript** with strict typing
2. **Prefer functional components** with hooks
3. **Use Drizzle ORM** for all database queries (never raw SQL)
4. **Use TailwindCSS classes** via NativeWind (no inline styles)
5. **Import from @/** for absolute imports (configured in tsconfig.json)

### Naming Conventions

- **Components**: PascalCase (e.g., `VideoCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useVideos.ts`)
- **Files**: kebab-case (e.g., `video-card.tsx`)
- **Database tables**: snake_case (e.g., `channel_id`)
- **Functions**: camelCase (e.g., `formatDuration`)

### File Organization

```
- Components go in /components
- Pages/Screens go in /app (Expo Router)
- Hooks go in /hooks
- Database schemas go in /db
- Utilities go in /helpers
- Data files go in /data
```

## TV-Specific Considerations

### Focus States

Always implement focus states for TV navigation:

```tsx
const [isFocused, setIsFocused] = useState(false);

<Pressable
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
>
  <View className={cx(
    'rounded-2xl',
    { 'bg-gray-300': isFocused }
  )}>
    {/* content */}
  </View>
</Pressable>
```

### Layout Guidelines

- Use **4-column grid** for video lists on TV
- Use **FlashList** instead of FlatList for performance
- Implement **pagination** for large datasets (20 items per page)
- Use **large touch targets** suitable for remote control
- Prefer **simple navigation** (no complex gestures)

### TV Environment Variable

All TV-related scripts must include `EXPO_TV=1`:

```json
"scripts": {
  "start": "EXPO_TV=1 expo start",
  "android": "EXPO_TV=1 expo run:android"
}
```

## Database Guidelines

### Using Drizzle ORM

Always use Drizzle's query builder:

```typescript
// ✅ CORRECT
const videos = await db.query.videos.findMany({
  where: (videos, { eq }) => eq(videos.channelId, channelId),
  limit: 20,
  offset: (page - 1) * 20,
  orderBy: (videos, { desc }) => [desc(videos.timestamp)]
});

// ❌ WRONG - Don't use raw SQL
const videos = await db.run(sql`SELECT * FROM videos`);
```

### Schema Changes

1. Modify `db/schema.ts`
2. Generate migration: `bunx drizzle-kit generate`
3. Migrations auto-run on app start via `useDatabaseInit()` hook

### Data Seeding

- Use `useDatabaseInit()` hook for initial data loading
- Check `lastUpdatedAt` timestamp before reseeding
- Clear old data before inserting new data
- Never seed data directly in components

## Styling Guidelines

### TailwindCSS with NativeWind

Use className prop with Tailwind classes:

```tsx
// ✅ CORRECT
<View className="flex-1 bg-gray-50">
  <Text className="text-lg font-semibold text-gray-900">
    Title
  </Text>
</View>

// ❌ WRONG - Don't use inline styles
<View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
  <Text style={{ fontSize: 18, fontWeight: '600' }}>
    Title
  </Text>
</View>
```

### Conditional Classes

Use `clsx` for conditional styling:

```tsx
import cx from 'clsx';

<View className={cx(
  'rounded-2xl p-4',
  {
    'bg-gray-300': isFocused,
    'bg-white': !isFocused
  }
)}>
```

## Component Patterns

### Custom Hooks

Follow this pattern for data fetching hooks:

```typescript
export function useVideos() {
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVideos(page)
      .then((data) => {
        if (page === 1) setVideos(data);
        else setVideos((prev) => [...prev, ...data]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const loadNextPage = () => {
    if (loading) return;
    setPage((prev) => prev + 1);
  };

  return { videos, loading, loadNextPage };
}
```

### Loading States

Always show loading states for better UX:

```tsx
if (!isReady) {
  return (
    <View className='h-screen bg-white flex justify-center items-center'>
      <ActivityIndicator size={48} color='tomato' />
      <Text className='mt-4 text-lg'>Loading...</Text>
    </View>
  );
}
```

### Type Safety

Use Drizzle's inferred types:

```typescript
import { Video } from '@/db/schema';

interface VideoCardProps {
  video: Video; // Type inferred from Drizzle schema
}

export default function VideoCard({ video }: VideoCardProps) {
  // ...
}
```

## Content Management

### Adding New Channels

When adding support for new channels:

1. Run: `bun run data/generate.ts <channel-name>`
2. This automatically:
   - Fetches video metadata via yt-dlp
   - Creates `data/<channel-name>.json`
   - Updates `data/index.ts` with imports
   - Sets `lastUpdatedAt` timestamp

### Video Metadata Format

All video data must follow this structure:

```typescript
interface VideoData {
  id: string;           // YouTube video ID
  title: string;        // Video title
  duration: number;     // Duration in seconds
  views: number;        // View count
  thumbnail: string;    // Thumbnail URL
  timestamp: number;    // Unix timestamp
  channelId: string;    // YouTube channel ID
  channelName: string;  // Channel display name
}
```

## Performance Best Practices

1. **Use FlashList** for all lists with 10+ items
2. **Implement pagination** - Don't load all data at once
3. **Optimize images** - Use appropriate thumbnail sizes
4. **Batch operations** - Process data in parallel when possible
5. **Memoize expensive calculations** - Use useMemo/useCallback

## Safety & Security

1. **No external links** - All navigation stays within app
2. **No user input** - No search, comments, or user-generated content
3. **Curated content only** - Only whitelisted channels appear
4. **No API keys in code** - Use environment variables
5. **No tracking/analytics** - Respect user privacy

## Testing Considerations

When implementing new features:

1. Test on **both Android TV and Apple TV**
2. Verify **remote control navigation** works smoothly
3. Check **focus states** are clearly visible
4. Ensure **loading states** don't block navigation
5. Test with **large datasets** (1000+ videos)

## Common Pitfalls to Avoid

- ❌ **Don't use FlatList** - Use FlashList for better performance
- ❌ **Don't fetch all data at once** - Implement pagination
- ❌ **Don't use inline styles** - Use TailwindCSS classes
- ❌ **Don't use raw SQL** - Use Drizzle ORM queries
- ❌ **Don't forget TV environment variable** - Always include `EXPO_TV=1`
- ❌ **Don't implement search** - This app is curated content only
- ❌ **Don't add external recommendations** - Only whitelisted channels

## Helper Functions

Use existing helpers from `/helpers/video.ts`:

```typescript
import { formatDuration, formatViewCount, formatRelativeTime } from '@/helpers/video';

// Convert seconds to MM:SS or HH:MM:SS
formatDuration(347); // "5:47"

// Format view counts
formatViewCount(1500000); // "1.5M views"
formatViewCount(3500); // "3.5K views"

// Format relative timestamps
formatRelativeTime(Date.now() / 1000 - 86400); // "1 day ago"
```

## Code Review Checklist

Before suggesting code changes, verify:

- [ ] TypeScript types are properly defined
- [ ] TailwindCSS classes are used (no inline styles)
- [ ] TV focus states are implemented
- [ ] Database queries use Drizzle ORM
- [ ] Loading states are present
- [ ] File follows project structure conventions
- [ ] Component is functional (not class-based)
- [ ] Imports use `@/` for absolute paths
- [ ] Performance is optimized (FlashList, pagination)
- [ ] No external API calls (except YouTube player)

## When to Ask for Clarification

Ask the developer before:

- Adding new dependencies
- Changing database schema
- Modifying the data generation script
- Adding new pages/routes
- Implementing search or filtering
- Adding user preferences or settings
- Integrating third-party services

## Additional Resources

- [React Native TV Docs](https://github.com/react-native-tvos/react-native-tvos)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [FlashList Docs](https://shopify.github.io/flash-list/)
