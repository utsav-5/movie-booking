import { useState, useMemo } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { THEATRES, SHOWTIMES, getTheater, getShowtimesForMovie } from '../data/movies';

const ShowSelection = ({ movieId, onShowSelect }) => {
  const [selectedTheatre, setSelectedTheatre] = useState('');

  // Get showtimes for this movie
  const movieShowtimes = useMemo(() => {
    return getShowtimesForMovie(movieId);
  }, [movieId]);

  // Get unique theatres showing this movie
  const availableTheatres = useMemo(() => {
    const theatreIds = [...new Set(movieShowtimes.map(s => s.theatreId))];
    return theatreIds.map(id => getTheater(id)).filter(Boolean);
  }, [movieShowtimes]);

  // Filter showtimes by selected theatre
  const filteredShowtimes = useMemo(() => {
    if (!selectedTheatre) return movieShowtimes;
    return movieShowtimes.filter(s => s.theatreId === selectedTheatre);
  }, [movieShowtimes, selectedTheatre]);

  const handleShowClick = (show) => {
    const theatre = getTheater(show.theatreId);
    onShowSelect({
      showId: show.id,
      show,
      theatre
    });
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-purple-400" />
        Select Theatre
      </h3>
      
      {/* Theatre Selection */}
      {availableTheatres.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {availableTheatres.map((theatre) => (
            <button
              key={theatre.id}
              onClick={() => setSelectedTheatre(theatre.id === selectedTheatre ? '' : theatre.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg transition-colors text-left ${
                selectedTheatre === theatre.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white bg-opacity-20 text-purple-200 hover:bg-opacity-30'
              }`}
            >
              <div className="font-semibold">{theatre.name}</div>
              <div className="text-xs opacity-80">{theatre.location}</div>
            </button>
          ))}
        </div>
      )}

      {/* Show Times */}
      {filteredShowtimes.length > 0 && (
        <>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Select Show Time
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredShowtimes.map((show) => {
              const theatre = getTheater(show.theatreId);
              return (
                <button
                  key={show.id}
                  onClick={() => handleShowClick(show)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex flex-col items-center"
                >
                  <span className="text-lg font-bold">{show.time}</span>
                  <span className="text-xs opacity-80">{theatre?.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {availableTheatres.length === 0 && (
        <p className="text-purple-300 text-center py-4">No shows available for this movie</p>
      )}
    </div>
  );
};

export default ShowSelection;
