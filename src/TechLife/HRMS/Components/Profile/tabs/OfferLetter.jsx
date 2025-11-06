import React, { useContext, useEffect, useState } from "react";
import { IoDocumentText } from "react-icons/io5";
import axios from "axios"; // Note: axios is imported but not used, publicinfoApi is
import { useParams } from "react-router-dom";
import { Context } from "../../HrmsContext"; // Assuming this is the correct path to your context
import { payroll, publicinfoApi } from "../../../../../axiosInstance";

const OfferLetter = () => {
  const { empID } = useParams();
  const { theme } = useContext(Context);

  const [offerLetter, setOfferLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOfferLetter = async () => {
      try {
        const response = await payroll.get(
          `/payroll/offerletter/html/employee/${empID}`
        );

        // Check if the request was successful and data exists
        if (response.data && response.data.success && response.data.data) {
          setOfferLetter(response.data.data); // Set the nested data object
        } else {
          // Handle API-level errors (e.g., success: false)
          setError(response.data.message || "No offer letter data found.");
          setOfferLetter(null);
        }
      } catch (err) {
        console.error("Error fetching offer letter:", err);
        setError("Failed to fetch offer letter data. Please try again later.");
        setOfferLetter(null); // Ensure no stale data is shown
      } finally {
        setLoading(false);
      }
    };

    fetchOfferLetter();
  }, [empID]);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div
          className={`text-center p-10 rounded-2xl shadow-lg border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <IoDocumentText
            className={`mx-auto w-14 h-14 mb-4 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <h2
            className={`text-3xl font-bold mb-3 ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Offer Letter Information
          </h2>
          <p
            className={`text-base mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View detailed offer letter information for employee ID:{" "}
            <span className="font-semibold">{empID}</span>
          </p>

          {/* Loading */}
          {loading && (
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Loading offer letter details...
            </p>
          )}

          {/* Error */}
          {/* This will now also show errors like "No offer letter data found" from the API */}
          {error && (
            <p className="text-red-500 font-medium">{error}</p>
          )}

          {/* Data Display */}
          {!loading && offerLetter && (
            <div
              className={`mt-6 text-left p-6 rounded-xl shadow-inner ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              <h3 className="text-xl font-semibold mb-4">
                Employee Offer Details
              </h3>
              {/* --- UPDATED UI BASED ON NEW RESPONSE --- */}
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Employee Name:</span>{" "}
                  {offerLetter.empName || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Employee ID:</span>{" "}
                  {offerLetter.employeeId || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Department:</span>{" "}
                  {offerLetter.department || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Designation:</span>{" "}
                  {offerLetter.designation || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Annual Salary:</span>{" "}
                  {offerLetter.annualSalary !== null ? offerLetter.annualSalary : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {offerLetter.startDate || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Job Type:</span>{" "}
                  {offerLetter.jobType || "N/A"}
                </p>
              </div>
              {/* --- END OF UPDATED UI --- */}
            </div>
          )}

          {/* No Data */}
          {/* This condition now correctly triggers if loading is done, there's no error, and offerLetter is still null */}
          {!loading && !offerLetter && !error && (
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No offer letter found for this employee.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferLetter;