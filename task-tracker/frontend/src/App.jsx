import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import AuthForm from './components/AuthForm.jsx';
import TimelineChart from './components/TimelineChart.jsx';
import { useEffect, useState } from 'react';

export default function App() {
  const [refresh, setRefresh] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    setToken('');
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-center">Task Tracker with Smart Insights</h1>
          <AuthForm onAuth={({ token: t }) => setToken(t)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex" style={{justifyContent:'space-between', alignItems:'center'}}>
          <h1 className="text-2xl font-bold">Task Tracker with Smart Insights</h1>
          <button onClick={handleLogout} className="px-4 py-2">Logout</button>
        </div>
        <InsightsPanel refresh={refresh} token={token} />
        <TaskForm onTaskAdded={() => setRefresh(!refresh)} token={token} />
        <TimelineChart token={token} refresh={refresh} />
        <TaskList refresh={refresh} onChanged={() => setRefresh(r => !r)} token={token} />
      </div>
    </div>
  );
}
