import { useState, useEffect } from 'react';

const SEAT_TYPES = {
  VIP: { price: 250, label: 'VIP', color: 'bg-purple-600' },
  PREMIUM: { price: 200, label: 'Premium', color: 'bg-blue-500' },
  STANDARD: { price: 150, label: 'Standard', color: 'bg-gray-400' },
  DISABLED: { price: 100, label: 'Accessible', color: 'bg-green-500' },
};

const SeatSelector = ({ selectedSeats = [], onSeatSelect, bookedSeats = [] }) => {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;

    const generatedSeats = rows.map((row) => {
      // Determine seat type based on row
      let seatType = 'STANDARD';
      if (row === 'A') seatType = 'VIP';
      else if (['B', 'C'].includes(row)) seatType = 'PREMIUM';
      else if (row === 'H') seatType = 'DISABLED';

      return {
        row,
        seatType,
        seats: Array.from({ length: seatsPerRow }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return {
            id: seatId,
            row,
            number: i + 1,
            type: seatType,
            isBooked: bookedSeats.includes(seatId),
          };
        }),
      };
    });

    setSeats(generatedSeats);
  }, [bookedSeats]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    
    // Check if already selected
    const isAlreadySelected = selectedSeats.some(
      (s) => s.row === seat.row && s.col === seat.number
    );
    
    if (isAlreadySelected) {
      onSeatSelect({ ...seat, action: 'remove' });
    } else {
      onSeatSelect({ ...seat, action: 'add' });
    }
  };

  const isSelected = (row, number) => {
    return selectedSeats.some((s) => s.row === row && s.number === number);
  };

  const getSeatClass = (seat) => {
    const typeInfo = SEAT_TYPES[seat.type] || SEAT_TYPES.STANDARD;
    
    if (seat.isBooked) {
      return 'bg-gray-800 text-gray-600 cursor-not-allowed';
    }
    
    if (isSelected(seat.row, seat.number)) {
      return 'bg-purple-600 text-white transform scale-110 shadow-lg shadow-purple-500/50';
    }
    
    return `${typeInfo.color.replace('bg-', 'bg-opacity-80 bg-')} text-white hover:scale-105 transition-transform`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Seat Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {Object.entries(SEAT_TYPES).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded ${value.color}`} />
            <span className="text-sm text-gray-600">
              {value.label} (${value.price})
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-800" />
          <span className="text-sm text-gray-600">Booked</span>
        </div>
      </div>

      {/* Screen */}
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-md bg-gray-200 rounded-lg py-3 text-center">
          <span className="text-gray-600 text-sm font-medium">SCREEN</span>
        </div>
      </div>

      {/* Seats */}
      <div className="space-y-2 overflow-x-auto">
        <div className="flex justify-center min-w-max">
          <div className="space-y-2">
            {seats.map((row) => (
              <div key={row.row} className="flex items-center gap-1">
                <span className="w-6 text-gray-500 text-sm text-center font-medium">{row.row}</span>
                <div className="flex gap-1">
                  {row.seats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked}
                      title={`${SEAT_TYPES[seat.type]?.label || 'Standard'} - $${SEAT_TYPES[seat.type]?.price || 150}`}
                      className={`
                        w-8 h-8 rounded-lg text-xs font-medium transition-all
                        ${getSeatClass(seat)}
                      `}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
                <span className="w-6 text-gray-500 text-sm text-center font-medium">{row.row}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Seats Info */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-xl">
          <p className="font-medium text-gray-900 mb-2">Selected Seats:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span
                key={`${seat.row}${seat.number}`}
                className={`px-3 py-1 rounded-full text-sm font-medium ${SEAT_TYPES[seat.type]?.color || SEAT_TYPES.STANDARD.color} text-white`}
              >
                {seat.row}{seat.number} (${SEAT_TYPES[seat.type]?.price || 150})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelector;
export { SEAT_TYPES };
