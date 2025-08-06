

import React from 'react'
import TasksPage from './TaskPage'
import TaskViewPage from './TaskViewPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const TasksApp = () => {
  return (
    
      <Routes>
        <Route path='/' element={<TasksPage />} />
        
        <Route path=':employeeId' element={<TasksPage />} />

        <Route path='taskview/:projectid/:id' element={<TaskViewPage />} />
      </Routes>
  )
}

export default TasksApp