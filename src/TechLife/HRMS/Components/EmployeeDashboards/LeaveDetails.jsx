import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../HrmsContext";
import { FaRegCircleXmark } from "react-icons/fa6";

const LeaveDetails = ({ leave, onClose }) => {
  const {theme}=useContext(Context)
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
          className={` ${theme==='dark'?'bg-gray-500 text-gray-200':'bg-stone-100'} rounded-lg shadow-xl p-6 max-w-lg w-full relative`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className={`w-20 h-20 absolute top-3 right-3 ${theme==='dark'?'text-gray-200':'text-gray-500'} hover:text-gray-700 text-xl`}
          >
         <FaRegCircleXmark className="w-8 h-8"  />
          </button>
          <h2 className={`text-2xl font-bold mb-4 ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>Leave Request Summary</h2>
          <div className="space-y-2">
            <div><strong>Request By:</strong> {leave.request_By}</div>
            <div><strong>Leave Type:</strong> {leave.leave_type}</div>
            <div><strong>Leave On:</strong> {leave.leave_on}</div>
            <div><strong>Status:</strong> {leave.status}</div>
            <div><strong>Action Date:</strong> {leave.action_Date}</div>
            <div><strong>Reason:</strong>{leave.leave_Reason || "-"} </div>
            <div><strong>Action:</strong> {leave.rejection_Reason || "-"}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaveDetails;