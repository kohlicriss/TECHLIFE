import React, { useContext, useEffect, useState } from "react";
import { IoDocumentText, IoDownload, IoEye } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { Context } from "../../HrmsContext";
import { payrollApi } from "../../../../../axiosInstance";
import html2pdf from "html2pdf.js";

const OfferLetter = () => {
  const { empID } = useParams();
  const { theme } = useContext(Context);

  const [offerLetter, setOfferLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOfferLetter = async () => {
      try {
        const response = await payrollApi.get(
          `/offerletter/html/employee/${empID}`
        );

        if (typeof response.data === "string") {
          setHtmlContent(response.data);
          setOfferLetter({ html: response.data });
        } else if (response.data && response.data.success) {
          if (typeof response.data.data === "string") {
            setHtmlContent(response.data.data);
            setOfferLetter({ html: response.data.data });
          } else if (
            response.data.data &&
            typeof response.data.data === "object"
          ) {
            setOfferLetter(response.data.data);
          }
        } else {
          setError(response.data?.message || "No offer letter data found.");
          setOfferLetter(null);
        }
      } catch (err) {
        console.error("Error fetching offer letter:", err);
        setError("Failed to fetch offer letter data. Please try again later.");
        setOfferLetter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferLetter();
  }, [empID]);

  const wrapWithA4Styling = (content) => `
    <div style="
        font-family: Calibri, Arial, sans-serif;
        font-size: 10pt;
        background: #fff;
        color: #333;
        width: 100%;
        line-height: 1.5;
        padding: 0;
        margin: 0;
      "
    >
      <style>
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          table-layout: fixed !important;
        }
        td, th {
          border: 1px solid !important;
          padding: 6px 8px !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        tr {
          page-break-inside: avoid !important;
        }
      </style>
      ${content}
    </div>
  `;
  // Preview PDF with page splits
  const openPdfPreview = () => {
    if (htmlContent) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = wrapWithA4Styling(htmlContent);

      const options = {
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      html2pdf()
        .set(options)
        .from(tempDiv)
        .toPdf()
        .get("pdf")
        .then(function (pdf) {
          window.open(pdf.output("bloburl"), "_blank");
        });
    }
  };

  // Download PDF with correct paging
  const downloadPdf = async () => {
    if (!htmlContent || downloading) return;
    setDownloading(true);
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = wrapWithA4Styling(htmlContent);

      const options = {
        margin: 10,
        filename: `Offer_Letter_${empID}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(options).from(tempDiv).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Utility: Demonstration of page breaks (in HTML), inject `.page-break` after sections
  // For real use, make sure your offer letter HTML includes <div class="page-break"></div>
  const exampleContentWithBreak = () => {
    if (!htmlContent) return "";
    // This is just an example, inject breaks between major sections.
    // You can replace this with your real parsing logic if needed.
    return htmlContent.replace(/<\/section>/g, '</section><div class="page-break"></div>');
  };

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
          {error && (
            <p className="text-red-500 font-medium">{error}</p>
          )}

          {/* Action Buttons */}
          {htmlContent && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={openPdfPreview}
                disabled={downloading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
                    : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
                }`}
              >
                <IoEye className="w-5 h-5" />
                Preview Offer Letter
              </button>
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  theme === "dark"
                    ? "bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400"
                    : "bg-green-500 hover:bg-green-600 text-white disabled:bg-green-300"
                }`}
              >
                <IoDownload className="w-5 h-5" />
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          )}

          {/* Downloading Overlay */}
          {downloading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                className={`p-6 rounded-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <p
                    className={
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }
                  >
                    Generating PDF...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details Panel */}
          {!loading && offerLetter && offerLetter.empName && (
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
                  {offerLetter.annualSalary !== null &&
                  offerLetter.annualSalary !== undefined
                    ? `₹${offerLetter.annualSalary}`
                    : "N/A"}
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
            </div>
          )}

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
