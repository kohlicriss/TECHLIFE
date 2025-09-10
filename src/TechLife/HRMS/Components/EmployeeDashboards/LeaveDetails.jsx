import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LeaveDetails = ({ leave, onClose }) => {
  if (!leave) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-25 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Leave Request Summary</h2>
          <div className="space-y-2">
            <div><strong>Employee ID:</strong> {leave.EmployeeId}</div>
            <div><strong>Employee Name:</strong> {leave.EmployeeName}</div>
            <div><strong>Leave Type:</strong> {leave.Leave_type}</div>
            <div><strong>Leave On:</strong> {Array.isArray(leave.Leave_On) ? leave.Leave_On.join(" ") : leave.Leave_On}</div>
            <div><strong>Status:</strong> {leave.status}</div>
            <div><strong>Request By:</strong> {leave.Request_By}</div>
            <div><strong>Action Date:</strong> {leave.Action_Date}</div>
            <div><strong>Rejection Reason:</strong> {leave.Rejection_Reason || "-"}</div>
            <div><strong>Details:</strong> <a href={leave.Details} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Document</a></div>
            <div><strong>Action:</strong> <a href={leave.Action} target="_blank" rel="noreferrer" className="text-gray-600 underline">⋯</a></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaveDetails;