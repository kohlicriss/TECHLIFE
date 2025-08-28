import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
 // Assuming this import is correct based on your project structure
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn
} from "react-icons/fa";

const AllTeams = () => {
  const navigate = useNavigate();

  const teams = [{
    teamId: "ACS2510",
    workingTeamName: "TechLife",
    employees: [
      {
        employeeId: "E123",
        employeeName: "John Doe",
        employeeRole: "Developer",
        employeeEmail: "johndoe@gmail.com",
        employeeMobile: "1111111111",
        EmployeeImage: null
      },
      {
        employeeId: "E456",
        employeeName: "Jane Smith",
        employeeRole: "Tester",
        employeeEmail: "janesmith@gmail.com",
        employeeMobile: "2222222222",
        EmployeeImage: null
      },
      {
        employeeId: "E156",
        employeeName: "Nina Dobrev",
        employeeRole: "Support Engineer",
        employeeEmail: "ninadobrev@gmail.com",
        employeeMobile: "3333333333",
        EmployeeImage: null
      },
      {
        employeeId: "E423",
        employeeName: "Ishaan",
        employeeRole: "Prompt Engineer",
        employeeEmail: "ishaan@gmail.com",
        employeeMobile: "4444444444",
        EmployeeImage: null
      },
    ],
  },
  {
    teamId: "bbbb",
    workingTeamName: "Project B",
    employees: [
      {
        employeeId: "E256",
        employeeName: "Paul",
        employeeRole: "Frontend Developer",
        employeeEmail: "paul123@gmail.com",
        employeeMobile: "5555555555",
        EmployeeImage: null
      },
      {
        employeeId: "E356",
        employeeName: "Kate",
        employeeRole: "Tester",
        employeeEmail: "kate@gmail.com",
        employeeMobile: "6666666666",
        EmployeeImage: null
      },
      {
        employeeId: "E432",
        employeeName: "Andrew",
        employeeRole: "Support Engineer",
        employeeEmail: "andrew@gmail.com",
        employeeMobile: "7777777777",
        EmployeeImage: null
      },
      {
        employeeId: "E652",
        employeeName: "Thomos Sheldon",
        employeeRole: "Backend Developer",
        employeeEmail: "thomossheldon@gmail.com",
        employeeMobile: "8888888888",
        EmployeeImage: null
      },
    ],
  },
  {
    teamId: "cccc",
    workingTeamName: "Project C",
    employees: [
      {
        employeeId: "E223",
        employeeName: "James",
        employeeRole: "Frontend Developer",
        employeeEmail: "james@gmail.com",
        employeeMobile: "9999999999",
        EmployeeImage: null
      },
      {
        employeeId: "E332",
        employeeName: "Mike",
        employeeRole: "Tester",
        employeeEmail: "mike@gmail.com",
        employeeMobile: "1212121212",
        EmployeeImage: null
      },
      {
        employeeId: "E445",
        employeeName: "Robert",
        employeeRole: "Support Engineer",
        employeeEmail: "robert@gmail.com",
        employeeMobile: "3434343434",
        EmployeeImage: null
      },
      {
        employeeId: "E663",
        employeeName: "Noah",
        employeeRole: "Backend Developer",
        employeeEmail: "noah@gmail.com",
        employeeMobile: "5656565656",
        EmployeeImage: null
      },
    ],
  },
  {
    teamId: "dddd",
    workingTeamName: "Project D",
    employees: [
      {
        employeeId: "E238",
        employeeName: "Jim Roll",
        employeeRole: "Frontend Developer",
        employeeEmail: "jimroll@gmail.com",
        employeeMobile: "7878787878",
        EmployeeImage: null
      },
      {
        employeeId: "E389",
        employeeName: "Vishrank",
        employeeRole: "Tester",
        employeeEmail: "vishrank@gmail.com",
        employeeMobile: "8989898989",
        EmployeeImage: null
      },
      {
        employeeId: "E495",
        employeeName: "Prajakta",
        employeeRole: "Support Engineer",
        employeeEmail: "prajakta@gmail.com",
        employeeMobile: "6767676767",
        EmployeeImage: null
      },
      {
        employeeId: "E678",
        employeeName: "Taruk Raina",
        employeeRole: "Backend Developer",
        employeeEmail: "tarukraina@gmail.com",
        employeeMobile: "2323232323",
        EmployeeImage: null
      },
    ],
  },
];

  return (
    <div>
      {teams.map((team, teamIdx) => (
        <motion.div
          key={teamIdx}
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
                  onClick={() => navigate(`/employees/employee/${member.employeeId}`)} // CORRECTED LINE
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
      ))}
    </div>
  );
};

export default AllTeams;