import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SEAT_TYPES = {
  VIP: { price: 250, label: 'VIP', color: 'bg-purple-600', textColor: 'text-purple-600' },
  PREMIUM: { price: 200, label: 'Premium', color: 'bg-blue-500', textColor: 'text-blue-500' },
  STANDARD: { price: 150, label: 'Standard', color: 'bg-gray-400', textColor: 'text-gray-400' },
  DISABLED: { price: 100, label: 'Accessible', color: 'bg-green-500', textColor: 'text-green-500' },
};

const SeatSelector = ({ selectedSeats = [], onSeatSelect, bookedSeats = [] }) => {
  const [seats, setSeats] = useState([]);

  // Generate seats once on mount
  useEffect(() => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;

    const generatedSeats = rows.map((row) => {
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
  }, []); // Run once on mount

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    
    const isAlreadySelected = selectedSeats.some(
      (s) => s.row === seat.row && s.number === seat.number
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
      return 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-gray-500 cursor-not-allowed';
    }
    
    if (isSelected(seat.row, seat.number)) {
      return 'bg-purple-600 text-white transform scale-110 shadow-lg shadow-purple-500/50';
    }
    
    return `${typeInfo.color} text-white hover:scale-105 transition-transform`;
  };

  const selectedTotal = selectedSeats.reduce((total, seat) => {
    const seatType = SEAT_TYPES[seat.type] || SEAT_TYPES.STANDARD;
    return total + seatType.price;
  }, 0);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
      {/* Seat Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {Object.entries(SEAT_TYPES).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded ${value.color}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {value.label} (${value.price})
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-300 dark:bg-dark-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
        </div>
      </div>

      {/* Screen */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-md bg-gradient-to-b from-gray-200 to-gray-300 dark:from-dark-600 dark:to-dark-700 rounded-lg py-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium relative z-10">SCREEN</span>
        </div>
      </div>

      {/* Screen Glow Effect */}
      <div className="flex justify-center mb-2">
        <div className="w-3/4 h-8 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-lg" />
      </div>

      {/* Seats */}
      <div className="space-y-3 overflow-x-auto">
        <div className="flex justify-center min-w-max">
          <div className="space-y-2">
            {seats.map((row) => (
              <div key={row.row} className="flex items-center gap-1">
                <span className="w-6 text-gray-500 dark:text-gray-400 text-sm text-center font-medium">
                  {row.row}
                </span>
                <div className="flex gap-1.5">
                  {row.seats.map((seat) => (
                    <motion.button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked}
                      title={`${SEAT_TYPES[seat.type]?.label || 'Standard'} - $${SEAT_TYPES[seat.type]?.price || 150}`}
                      className={`
                        w-8 h-8 rounded-lg text-xs font-medium transition-all
                        ${getSeatClass(seat)}
                      `}
                      whileHover={!seat.isBooked ? { scale: 1.1 } : {}}
                      whileTap={!seat.isBooked ? { scale: 0.95 } : {}}
                    >
                      {seat.number}
                    </motion.button>
                  ))}
                </div>
                <span className="w-6 text-gray-500 dark:text-gray-400 text-sm text-center font-medium">
                  {row.row}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Seats Info */}
      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-gray-900 dark:text-white">Selected Seats:</p>
            <p className="font-bold text-purple-600">{selectedSeats.length} seats</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSeats.map((seat) => (
              <span
                key={`${seat.row}${seat.number}`}
                className={`px-3 py-1 rounded-full text-sm font-medium ${SEAT_TYPES[seat.type]?.color || SEAT_TYPES.STANDARD.color} text-white`}
              >
                {seat.row}{seat.number}
              </span>
            ))}
          </div>
          <div className="border-t border-purple-200 dark:border-purple-800 pt-3 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Price</span>
            <span className="text-lg font-bold text-purple-600">${selectedTotal}</span>
          </div>
        </motion.div>
      )}

      {/* Accessibility Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          For wheelchair accessibility, please contact our support team or visit the ticket counter.
        </p>
      </div>
    </div>
  );
};

export default SeatSelector;
export { SEAT_TYPES };
