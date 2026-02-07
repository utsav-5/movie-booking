# Firebase Firestore Indexes

Your Firestore query needs a composite index. Click this link to create it:

**https://console.firebase.google.com/v1/r/project/movie-booking-app-46bbc/firestore/indexes?create_composite=Clhwcm9qZWN0cy9tb3ZpZS1ib29raW5nLWFwcC00NmJiYy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYm9va2luZ3MvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg**

## What this does:
- Allows the app to query bookings by userId ordered by createdAt
- Required for the Profile page to load your bookings

## After creating the index:
1. Wait a few minutes for the index to build
2. Refresh your Profile page
3. Your bookings should now load correctly
