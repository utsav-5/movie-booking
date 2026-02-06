# Movie Booking App

A modern, interactive movie booking website built with Vite, React, JavaScript, and **Firebase**.

## Features

- 🔐 **Firebase Authentication** - Real user login/register
- 🎬 Browse movies with ratings and details
- 📅 Select showtimes
- 💺 Interactive seat selection
- ✅ Booking checkout flow
- 📧 Confirmation screen
- ☁️ **Cloud Firestore** - Store bookings and user data

## Tech Stack

- **Vite** - Fast build tool
- **React** - UI library
- **JavaScript** - Programming language
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Firebase** - Backend (Authentication + Firestore Database)

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- Firebase account ([Create one here](https://firebase.google.com/))

### Installation

1. Extract the zip file to your desired location

2. Open terminal/command prompt and navigate to the project folder:
   ```bash
   cd movie-booking-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. **Set up Firebase** (IMPORTANT!):
   - Follow the detailed guide in `FIREBASE_SETUP.md`
   - Or watch this quick video: [Firebase Setup Tutorial](https://www.youtube.com/watch?v=q5J5ho7YUhA)
   
   Quick steps:
   - Create a Firebase project
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy your Firebase config to `src/config/firebase.js`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and visit the URL shown in the terminal (usually `http://localhost:5173`)

## Firebase Configuration

**Important:** You must configure Firebase for the app to work!

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

See `FIREBASE_SETUP.md` for detailed instructions!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
movie-booking-app/
├── src/
│   ├── config/
│   │   └── firebase.js      # Firebase configuration
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── FIREBASE_SETUP.md        # Detailed Firebase setup guide
└── README.md               # This file
```

## How to Use

1. **Register**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Browse Movies**: View available movies on the home page
4. **Select Showtime**: Click on a movie to see available showtimes
5. **Choose Seats**: Pick your seats from the interactive seating chart
6. **Checkout**: Enter your details and complete booking
7. **Confirmation**: View your booking confirmation

Your bookings are saved in Firebase Firestore! 🎉

## Firebase Database Structure

### Collections:

**users/**
- User profiles (name, email, phone)

**bookings/**
- Movie bookings with seat info, showtime, price
- Linked to user accounts

## Customization

You can easily customize:
- Movies in `src/App.jsx` (movies array)
- Colors in `tailwind.config.js`
- Ticket prices in the `ticketPrice` variable
- Seat layout in the `generateSeats()` function
- Firebase rules in Firebase Console

## Deployment

To deploy to Firebase Hosting:

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

## Troubleshooting

**"Firebase not configured" error:**
- Make sure you've updated `src/config/firebase.js` with your actual Firebase config

**Authentication not working:**
- Check Firebase Console → Authentication → Sign-in method
- Ensure Email/Password is enabled

**Permission denied errors:**
- Check Firestore security rules in Firebase Console
- See `FIREBASE_SETUP.md` for correct rules

## Next Steps

- Add payment integration (Stripe/Razorpay)
- Implement admin panel for managing movies
- Add email notifications
- Generate QR code tickets
- Add movie search and filters

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

Enjoy your movie booking experience! 🍿
