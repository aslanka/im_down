# I'm Down MVP

A runnable Expo + React Native MVP for filling open spots in activities through friends and mutuals.

## Included

- Open-spots feed
- Activity categories: golf, poker, pickleball, basketball, soccer, other
- Friend/mutual social context
- Create activity flow
- Instant join or host-approval request mode
- Private location hidden until a user joins
- Activity detail screen
- Notifications
- Profile + interests
- Local persistence using AsyncStorage
- Mock users/data so the app works immediately

## Run it

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go where supported.

## Architecture

- Expo 54
- React Native 0.81
- Expo Router
- TypeScript
- AsyncStorage

There is intentionally no backend in this first runnable MVP. The state layer is isolated in `src/context/AppContext.tsx`, making it straightforward to replace with Supabase next.

## Recommended next build phase

1. Supabase Auth
2. Postgres profiles/friendships/activities/activity_members
3. Row-Level Security for visibility/private locations
4. Supabase Realtime chat
5. Expo push notifications
6. Contacts-based friend discovery
7. Real mutual-friend queries

## Important MVP behavior

The app is centered around **open spots**, not generic social events. A host can create an activity that needs more participants, expose it to friends/mutuals, and choose between instant claiming or approval-required joining.
