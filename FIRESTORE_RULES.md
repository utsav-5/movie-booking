# Firebase Firestore Security Rules

You need to update your Firestore rules in Firebase Console to allow bookings.

## Steps to Fix:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **movie-booking-app-46bbc**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**

## For Production (After testing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Movies collection (read-only for users)
    match /movies/{movieId} {
      allow read: if true;
      allow write: if request.auth != null; // Only admins should write
    }
  }
}
```

## After updating rules, try booking again!
