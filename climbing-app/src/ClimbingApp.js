// ClimbinApp.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './ClimbingApp.css';

// HomePage Component
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Climbing Tracker</h1>
      <div className="button-container">
        <button onClick={() => navigate('/new-session')}>Start New Session</button>
        <button onClick={() => navigate('/view-sessions')}>View Sessions</button>
      </div>
    </div>
  );
};

// DifficultySelector Component
const DifficultySelector = ({ value, onChange }) => {
  return (
    <div className="difficulty-selector">
      <label>Difficulty:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select difficulty</option>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={`V${i}`}>V{i}</option>
        ))}
      </select>
    </div>
  );
};

// LogAttemptButtons Component
const LogAttemptButtons = ({ attempts, onSuccess, onFailure }) => {
  return (
    <div className="log-attempt-buttons">
      <p>Successful Attempts: {attempts.success}</p>
      <p>Failed Attempts: {attempts.fail}</p>
      <div className="button-container">
        <button className="success-button" onClick={onSuccess}>Log Success</button>
        <button className="failure-button" onClick={onFailure}>Log Failure</button>
      </div>
    </div>
  );
};

// NewSession Component
const NewSession = () => {
  const [routes, setRoutes] = useState([{ difficulty: '', attempts: { success: 0, fail: 0 } }]);
  const [currentRoute, setCurrentRoute] = useState(0);
  const navigate = useNavigate();

  const addRoute = () => {
    setRoutes([...routes, { difficulty: '', attempts: { success: 0, fail: 0 } }]);
    setCurrentRoute(routes.length);
  };

  const updateRoute = (index, updatedRoute) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = updatedRoute;
    setRoutes(updatedRoutes);
  };

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routes }),
    });
    if (response.ok) {
      alert('Session submitted!');
      navigate('/');
    } else {
      alert('Failed to submit session');
    }
  };

  return (
    <div className="new-session">
      <h1>New Climbing Session</h1>

      <div>
        <h2>Route {currentRoute + 1}</h2>
        <DifficultySelector 
          value={routes[currentRoute].difficulty} 
          onChange={(difficulty) => updateRoute(currentRoute, { ...routes[currentRoute], difficulty })}
        />
        <LogAttemptButtons 
          attempts={routes[currentRoute].attempts} 
          onSuccess={() => updateRoute(currentRoute, {
            ...routes[currentRoute], 
            attempts: { ...routes[currentRoute].attempts, success: routes[currentRoute].attempts.success + 1 }
          })}
          onFailure={() => updateRoute(currentRoute, {
            ...routes[currentRoute], 
            attempts: { ...routes[currentRoute].attempts, fail: routes[currentRoute].attempts.fail + 1 }
          })}
        />
      </div>

      <div className="button-container">
        <button onClick={addRoute}>Add New Route</button>
        <button onClick={() => setCurrentRoute(currentRoute - 1)} disabled={currentRoute === 0}>Previous Route</button>
        <button onClick={() => setCurrentRoute(currentRoute + 1)} disabled={currentRoute === routes.length - 1}>Next Route</button>
        <button onClick={handleSubmit}>Submit Session</button>
      </div>
    </div>
  );
};

// ViewSessions Component
const ViewSessions = () => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch('http://localhost:5000/api/sessions');
      const data = await response.json();
      setSessions(data);
    };

    fetchSessions();
  }, []);

  return (
    <div className="view-sessions">
      <h1>Climbing Sessions</h1>
      <table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Routes</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{session.id}</td>
              <td>
                <ul>
                  {session.routes.map((route) => (
                    <li key={route.id}>
                      {route.difficulty} - Success: {route.attempts.success}, Fail: {route.attempts.fail}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-container">
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
};

// ClimbinApp Component
const ClimbingApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-session" element={<NewSession />} />
        <Route path="/view-sessions" element={<ViewSessions />} />
      </Routes>
    </Router>
  );
};

export default ClimbingApp;
