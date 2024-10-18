import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// HomePage Component
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Climbing Tracker</h1>
      <button onClick={() => navigate('/new-session')}>Start New Session</button>
      <button onClick={() => alert('Old sessions not implemented yet!')}>View Old Sessions</button>
    </div>
  );
};

// DifficultySelector Component
const DifficultySelector = ({ value, onChange }) => {
  return (
    <div>
      <label>Difficulty:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  );
};

// LogAttemptButtons Component
const LogAttemptButtons = ({ attempts, onSuccess, onFailure }) => {
  return (
    <div>
      <p>Successful Attempts: {attempts.success}</p>
      <p>Failed Attempts: {attempts.fail}</p>
      <button onClick={onSuccess}>Log Success</button>
      <button onClick={onFailure}>Log Failure</button>
    </div>
  );
};

// NewSession Component
const NewSession = () => {
  const [routes, setRoutes] = useState([{ difficulty: '', attempts: { success: 0, fail: 0 } }]);
  const [currentRoute, setCurrentRoute] = useState(0);

  const addRoute = () => {
    setRoutes([...routes, { difficulty: '', attempts: { success: 0, fail: 0 } }]);
    setCurrentRoute(routes.length);
  };

  const updateRoute = (index, updatedRoute) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = updatedRoute;
    setRoutes(updatedRoutes);
  };

  const handleSubmit = () => {
    // Send session data to server (dummy API call here)
    console.log('Submitting session:', routes);
    // Simulate API call, then navigate back to home
    alert('Session submitted!');
    window.location.href = '/';
  };

  return (
    <div>
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

      <button onClick={addRoute}>Add New Route</button>
      <button onClick={() => setCurrentRoute(currentRoute - 1)} disabled={currentRoute === 0}>Previous Route</button>
      <button onClick={() => setCurrentRoute(currentRoute + 1)} disabled={currentRoute === routes.length - 1}>Next Route</button>

      <button onClick={handleSubmit}>Submit Session</button>
    </div>
  );
};

// App Component
const Copium = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-session" element={<NewSession />} />
      </Routes>
    </Router>
  );
};

export default Copium;
