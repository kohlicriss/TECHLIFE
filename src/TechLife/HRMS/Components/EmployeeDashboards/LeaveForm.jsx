import { useState } from "react";
import Calendar from "./Calender";

const LeaveForm = ({ onClose }) => {
  // ... state for form inputs (fromDate, toDate, etc.) ...
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-25 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-auto rounded-lg bg-white p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center border-b pb-4">Add Leave</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Name</label>
            <input
              type="text"
              value=""
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option>Select</option>
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Unpaid Leave</option>
              <option>Paid Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  readOnly
                  value={fromDate ? fromDate.toLocaleDateString("en-GB") : "dd-mm-yyyy"}
                  onClick={() => setShowFromCalendar(!showFromCalendar)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                />
                {showFromCalendar && (
                  <Calendar
                    selectedDate={fromDate}
                    onSelectDate={(date) => {
                      setFromDate(date);
                      setShowFromCalendar(false);
                    }}
                    onClose={() => setShowFromCalendar(false)}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  readOnly
                  value={toDate ? toDate.toLocaleDateString("en-GB") : "dd-mm-yyyy"}
                  onClick={() => setShowToCalendar(!showToCalendar)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                />
                {showToCalendar && (
                  <Calendar
                    selectedDate={toDate}
                    onSelectDate={(date) => {
                      setToDate(date);
                      setShowToCalendar(false);
                    }}
                    onClose={() => setShowToCalendar(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* New row for calculated days and leave duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">No. of Days</label>
              <input
                readOnly
                type="text"
                value={
                  fromDate && toDate ? `${Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1} Days` : "0 Days"
                }
                className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leave Duration</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option>Select</option>
                <option>Full Day</option>
                <option>First Half Day</option>
                <option>Second Half Day</option>
              </select>
            </div>
          </div>
          
          {/* Remaining Days (placeholder for now) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Remaining Days</label>
            <input
              type="text"
              readOnly
              value="8"
              className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button className="rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            Add Leave
          </button>
        </div>
      </div>
    </div>
  );
};
export default LeaveForm;