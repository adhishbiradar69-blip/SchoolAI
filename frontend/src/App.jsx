import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Login from './pages/Login';
import AttendanceBoard from './pages/Teacher/AttendanceBoard';
import TaskManager from './pages/Teacher/TaskManager';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/teacher/attendance" element={<AttendanceBoard />} />
          <Route path="/teacher/tasks" element={<TaskManager />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;