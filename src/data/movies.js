// Theatres
export const THEATRES = [
  {
    id: "theatre_1",
    name: "Grand Cinema",
    location: "Downtown"
  },
  {
    id: "theatre_2",
    name: "City Plex",
    location: "Mall Road"
  },
  {
    id: "theatre_3",
    name: "IMAX Arena",
    location: "Tech Park"
  }
];

// Showtimes (movie ↔ theatre mapping)
export const SHOWTIMES = [
  {
    id: "show_1",
    movieId: "movie_1",
    theatreId: "theatre_1",
    time: "10:30"
  },
  {
    id: "show_2",
    movieId: "movie_1",
    theatreId: "theatre_1",
    time: "18:45"
  },
  {
    id: "show_3",
    movieId: "movie_1",
    theatreId: "theatre_2",
    time: "20:30"
  },
  {
    id: "show_4",
    movieId: "movie_2",
    theatreId: "theatre_1",
    time: "21:00"
  },
  {
    id: "show_5",
    movieId: "movie_3",
    theatreId: "theatre_3",
    time: "16:30"
  },
  {
    id: "show_6",
    movieId: "movie_4",
    theatreId: "theatre_2",
    time: "14:00"
  },
  {
    id: "show_7",
    movieId: "movie_5",
    theatreId: "theatre_1",
    time: "19:15"
  },
  {
    id: "show_8",
    movieId: "movie_6",
    theatreId: "theatre_2",
    time: "22:00"
  },
  {
    id: "show_9",
    movieId: "movie_8",
    theatreId: "theatre_3",
    time: "20:45"
  },
  {
    id: "show_10",
    movieId: "movie_9",
    theatreId: "theatre_1",
    time: "17:00"
  }
];

// Helper functions
export const getTheater = (theatreId) => {
  return THEATRES.find(t => t.id === theatreId);
};

export const getShowtimesForMovie = (movieId) => {
  return SHOWTIMES.filter(s => s.movieId === movieId);
};

export const getShowtime = (showId) => {
  return SHOWTIMES.find(s => s.id === showId);
};

// Get available dates (next 7 days)
export const getDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Get showtimes for a movie at a specific theatre on a specific date
export const getShowTimes = (movieId, theatreId, dateStr) => {
  const shows = SHOWTIMES.filter(s => 
    s.movieId === movieId && 
    s.theatreId === theatreId
  );
  
  // Return times, add more showtimes if needed
  const times = shows.map(s => s.time);
  
  // Generate additional times if not enough
  if (times.length < 4) {
    const allTimes = ["10:30", "14:00", "16:45", "19:30", "21:00", "22:30"];
    const availableTimes = allTimes.filter(t => !times.includes(t));
    times.push(...availableTimes.slice(0, 4 - times.length));
  }
  
  return times;
};

// Movies Data
export const MOVIES = [
  {
    id: "movie_1",
    title: "Inception",
    year: 2010,
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.8,
    synopsis: "A thief who enters dream worlds to steal secrets from the subconscious is given a chance to erase his criminal past by planting an idea in a corporate heir's mind.",
    duration: 148,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/YoHD9XEInc0",
    languages: ["English", "Hindi", "Tamil"]
  },
  {
    id: "movie_2",
    title: "The Dark Knight",
    year: 2008,
    genre: ["Action", "Drama"],
    rating: 9.0,
    synopsis: "Batman raises the stakes in his war on crime against the Joker, a criminal mastermind who seeks to test Batman in a game of cat and mouse.",
    duration: 152,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
    languages: ["English", "Hindi"]
  },
  {
    id: "movie_3",
    title: "Interstellar",
    year: 2014,
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.6,
    synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes increasingly uninhabitable.",
    duration: 169,
    status: "coming_soon",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
    languages: ["English"]
  },
  {
    id: "movie_4",
    title: "Avengers: Endgame",
    year: 2019,
    genre: ["Action", "Sci-Fi"],
    rating: 8.4,
    synopsis: "The Avengers assemble one last time to reverse Thanos' actions and restore balance to the universe after the devastating events of Infinity War.",
    duration: 181,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1531303435785-3c53454911b8?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1531303435785-3c53454911b8?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/TcMBFSGVi1c",
    languages: ["English", "Hindi", "Tamil", "Telugu"]
  },
  {
    id: "movie_5",
    title: "Parasite",
    year: 2019,
    genre: ["Thriller", "Drama"],
    rating: 8.5,
    synopsis: "A poor family schemes to become employed by a wealthy family by infiltrating their household, but things take an unexpected turn.",
    duration: 132,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/5xH0HfJHsaY",
    languages: ["Korean", "English"]
  },
  {
    id: "movie_6",
    title: "Joker",
    year: 2019,
    genre: ["Crime", "Drama"],
    rating: 8.4,
    synopsis: "A troubled mental health support worker descends into madness, becoming the archcriminal known only as The Joker.",
    duration: 122,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/zAGVQLHvwOY",
    languages: ["English", "Hindi"]
  },
  {
    id: "movie_7",
    title: "Dune",
    year: 2021,
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.1,
    synopsis: "A noble family becomesembroiled in a war for control over the galaxy's most valuable asset while its heir becomes swept up in a rebellion.",
    duration: 155,
    status: "coming_soon",
    image: "https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/8g18jFvTt3s",
    languages: ["English", "Hindi"]
  },
  {
    id: "movie_8",
    title: "The Matrix",
    year: 1999,
    genre: ["Sci-Fi", "Action"],
    rating: 8.7,
    synopsis: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    duration: 136,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d57dc18c5?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d57dc18c5?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/vKQi3bBA1y8",
    languages: ["English", "Hindi", "Tamil"]
  },
  {
    id: "movie_9",
    title: "Titanic",
    year: 1997,
    genre: ["Romance", "Drama"],
    rating: 7.9,
    synopsis: "A love story aboard the RMS Titanic during its ill-fated maiden voyage, spanning different social classes during a time of great upheaval.",
    duration: 195,
    status: "now_showing",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/2e-eXJ6HgU0",
    languages: ["English", "Hindi", "Tamil"]
  },
  {
    id: "movie_10",
    title: "Oppenheimer",
    year: 2023,
    genre: ["Drama", "History"],
    rating: 8.9,
    synopsis: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    duration: 180,
    status: "coming_soon",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=1200&fit=crop",
    trailer: "https://www.youtube.com/embed/uYPbbksJxIg",
    languages: ["English"]
  }
];
