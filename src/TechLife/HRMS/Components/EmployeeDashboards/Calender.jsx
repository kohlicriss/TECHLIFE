// Calendar.jsx
import React, { useState } from "react";

const Calendar = ({ selectedDate, onSelectDate, onClose }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [showSelector, setShowSelector] = useState("calendar"); // "calendar", "month", "year"
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getStartingDay = (m, y) => new Date(y, m, 1).getDay();

  const handleMonthChange = (newMonth) => {
    setCurrentDate(new Date(year, newMonth, 1));
    setShowSelector("calendar"); // Switch back to calendar view
  };

  const handleYearChange = (newYear) => {
    setCurrentDate(new Date(newYear, month, 1));
    setShowSelector("calendar"); // Switch back to calendar view
  };

  const renderDays = () => {
    const numDays = daysInMonth(month, year);
    const startingDay = getStartingDay(month, year);
    const days = [];

    // Fill in leading empty cells for days from the previous month
    for (let i = 0; i < startingDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="text-gray-400 p-2 text-center"></div>
      );
    }

    // Fill in the days of the current month
    for (let i = 1; i <= numDays; i++) {
      const day = new Date(year, month, i);
      const isSelected =
        selectedDate && day.toDateString() === selectedDate.toDateString();
      const isToday = day.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={`day-${i}`}
          onClick={() => onSelectDate(day)}
          className={`p-1 rounded-full text-center hover:bg-gray-200 transition-colors ${
            isToday ? "bg-orange-500 text-white font-bold" : ""
          } ${
            isSelected && !isToday
              ? "bg-blue-200 text-blue-800 font-bold"
              : ""
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
  ];

  const renderMonthSelector = () => {
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((m, index) => (
          <button
            key={m}
            onClick={() => handleMonthChange(index)}
            className={`p-2 rounded-md text-center hover:bg-gray-200 transition-colors ${
              index === month ? "bg-blue-500 text-white font-bold" : ""
            }`}
          >
            {m.substring(0, 3)}
          </button>
        ))}
      </div>
    );
  };

  const renderYearSelector = () => {
    const currentYearRangeStart = Math.floor(year / 10) * 10;
    const yearsInView = Array.from({ length: 12 }, (_, i) => currentYearRangeStart - 1 + i);

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentYearRangeStart - 11, month, 1))}
            className="text-gray-600 hover:text-gray-800"
          >
            &lt;
          </button>
          <h3 className="font-semibold">
            {currentYearRangeStart} - {currentYearRangeStart + 9}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentYearRangeStart + 11, month, 1))}
            className="text-gray-600 hover:text-gray-800"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2">
          {yearsInView.map((y) => (
            <button
              key={y}
              onClick={() => handleYearChange(y)}
              className={`p-2 rounded-md text-center hover:bg-gray-200 transition-colors ${
                y === year ? "bg-blue-500 text-white font-bold" : "text-gray-700"
              } ${
                y < currentYearRangeStart || y > currentYearRangeStart + 9
                  ? "text-gray-400"
                  : ""
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="absolute z-10 bg-white shadow-lg rounded-lg w-full p-4 mt-2 border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        {showSelector === "calendar" && (
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
              )
            }
            className="text-gray-600 hover:text-gray-800"
          >
            &lt;
          </button>
        )}
        <div className="flex-1 flex justify-center space-x-2">
          <button
            onClick={() => setShowSelector("month")}
            className="font-semibold px-2 py-1 rounded-md hover:bg-gray-100"
          >
            {currentDate.toLocaleString("default", {
              month: "long",
            })}
          </button>
          <button
            onClick={() => setShowSelector("year")}
            className="font-semibold px-2 py-1 rounded-md hover:bg-gray-100"
          >
            {year}
          </button>
        </div>
        {showSelector === "calendar" && (
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              )
            }
            className="text-gray-600 hover:text-gray-800"
          >
            &gt;
          </button>
        )}
      </div>

      {showSelector === "calendar" && (
        <>
          <div className="grid grid-cols-7 gap-1 text-sm font-medium text-center text-gray-500">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">{renderDays()}</div>
        </>
      )}

      {showSelector === "month" && renderMonthSelector()}
      {showSelector === "year" && renderYearSelector()}
    </div>
  );
};

export default Calendar;