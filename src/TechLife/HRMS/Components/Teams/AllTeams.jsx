import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { publicinfoApi } from "../../../../axiosInstance";

const AllTeams = () => {
  const navigate = useNavigate();
  const { empID } = useParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllTeams = async () => {
      if (!empID) {
        setLoading(false);
        setError("Employee ID is missing.");
        return;
      }
      try {
        setLoading(true);
        const response = await publicinfoApi.get(`employee/team/${empID}`);
        console.log(response.data);
        setTeams(response.data || []);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to fetch team data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllTeams();
  }, [empID]);

  // Loading and error states
  if (loading) {
    return <div className="text-center p-12">Loading teams...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-500">{error}</div>;
  }

  return (
    <div>
      {teams.length === 0 ? (
        <div className="text-center p-12 text-gray-500">No teams found.</div>
      ) : (
        teams.map((team, teamIdx) => (
          <motion.div
            key={team.teamId || teamIdx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: teamIdx * 0.2 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto my-12 rounded-xl overflow-hidden shadow-lg relative"
          >
            <div className="absolute inset-0">
              <div className="h-1/2 bg-[#d0ceb9]"></div>
              <div className="h-1/2 bg-white"></div>
            </div>

            <h2 className="relative z-10 text-3xl font-bold text-center py-6 text-gray-700">
              {team.workingTeamName}{" "}
              <span className="text-l text-gray-700">{team.teamId}</span>
            </h2>

            <div className="relative z-10 px-6 pb-16 overflow-x-auto whitespace-nowrap hide-horizantal-scrollbar">
              <motion.div
                className="flex gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.15 }}
              >
                {team.employees.map((member) => (
                  <motion.div
                    key={member.employeeId}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 w-72 text-center inline-block cursor-pointer"
                    onClick={() => navigate(`/employees/employee/${member.employeeId}`)}
                  >
                    <div className="w-36 h-36 mx-auto mb-4 rounded-full bg-[#d0ceb9] flex items-center justify-center overflow-hidden shadow-md">
                      {member.EmployeeImage ? (
                        <img
                          src={member.EmployeeImage}
                          alt={member.employeeName}
                          className="w-32 h-32 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-[#7c7662] text-white text-3xl font-semibold flex items-center justify-center">
                          {member.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{member.employeeName}</h3>
                    <p className="text-sm font-semibold text-[#7c7662] capitalize">
                      {member.employeeRole}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {member.employeeEmail}
                    </p>
                    <p className="text-sm text-gray-600">{member.employeeMobile}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default AllTeams;