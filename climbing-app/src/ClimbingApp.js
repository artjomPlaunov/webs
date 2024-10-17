// ClimbingApp.js

import React, { useState, useEffect } from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';
import './ClimbingApp.css';

const Route = ({ route, updateRoute }) => {
  const handleSwipe = (success) => {
    updateRoute(route.id, success);
  };

  const handleDifficultyChange = (value) => {
    updateRoute(route.id, null, value);
  };

  const difficultyLevels = ['V0', 'V1', 'V2', 'V3', 'V4'];

  return (
    <div className="route">
      <h3>{`Route ${route.id}`}</h3>
      <div className="circular-slider">
        <CircularSlider
          label="Difficulty"
          data={difficultyLevels}
          value={difficultyLevels[route.difficulty]}
          onChange={handleDifficultyChange}
          width={120}
          knobColor="#4CAF50"
          knobSize={40}
          progressWidth={8}
          progressColorFrom="#00bf72"
          progressColorTo="#009c9c"
        />
      </div>
      <button onClick={() => handleSwipe(true)}>Success</button>
      <button onClick={() => handleSwipe(false)}>Fail</button>
      <p>{`Attempts: ${route.attempts}, Successes: ${route.successes}, Failures: ${route.failures}`}</p>
    </div>
  );
};

const Summary = ({ routes }) => {
  return (
    <table className="summary-table">
      <thead>
        <tr>
          <th>Difficulty</th>
          <th>Attempts</th>
          <th>Successes</th>
          <th>Failures</th>
        </tr>
      </thead>
      <tbody>
        {routes.map((route) => (
          <tr key={route.id}>
            <td>{['V0', 'V1', 'V2', 'V3', 'V4'][route.difficulty]}</td>
            <td>{route.attempts}</td>
            <td>{route.successes}</td>
            <td>{route.failures}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SessionList = ({ sessions, loadSession }) => (
  <div>
    <h2>Previous Sessions</h2>
    <ul>
      {sessions.map((session) => (
        <li key={session.id} onClick={() => loadSession(session.id)}>
          Session {session.id} - {session.date} {session.completed ? "(Completed)" : "(Ongoing)"}
        </li>
      ))}
    </ul>
  </div>
);

const ClimbingApp = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isViewingSession, setIsViewingSession] = useState(false); // New state for viewing sessions

  useEffect(() => {
    fetch('http://localhost:5000/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((error) => console.error('Error fetching sessions:', error));
  }, []);

  const startNewSession = () => {
    fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((newSession) => {
        setCurrentSession(newSession.id);
        setRoutes([]);
        setIsViewingSession(false); // Ensure we are no longer viewing previous sessions
      })
      .catch((error) => console.error('Error starting session:', error));
  };

  const loadSession = (sessionId) => {
    fetch(`http://localhost:5000/api/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((session) => {
        setCurrentSession(session.id);
        setRoutes(session.routes);
        setIsViewingSession(true); // Set viewing mode for previous sessions
      })
      .catch((error) => console.error('Error loading session:', error));
  };

  const completeSession = () => {
    fetch(`http://localhost:5000/api/sessions/${currentSession}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
      .then((res) => res.json())
      .then(() => {
        setCurrentSession(null);
        setRoutes([]);
      })
      .catch((error) => console.error('Error completing session:', error));
  };

  const updateRoute = (routeId, success = null, difficulty = null) => {
    const updatedRoute = routes.find((route) => route.id === routeId);

    if (difficulty !== null) updatedRoute.difficulty = difficulty;
    if (success !== null) {
      updatedRoute.attempts += 1;
      success ? updatedRoute.successes += 1 : updatedRoute.failures += 1;
    }

    fetch(`http://localhost:5000/api/sessions/${currentSession}/routes/${routeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRoute),
    })
      .then((res) => res.json())
      .then((data) => {
        setRoutes((prevRoutes) =>
          prevRoutes.map((route) => (route.id === routeId ? data : route))
        );
      })
      .catch((error) => console.error('Error updating route:', error));
  };

  const addNewRoute = () => {
    const newRoute = {
      difficulty: 0,
    };

    fetch(`http://localhost:5000/api/sessions/${currentSession}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoute),
    })
      .then((res) => res.json())
      .then((route) => {
        setRoutes([...routes, route]);
      })
      .catch((error) => console.error('Error adding route:', error));
  };

  return (
    <div className="climbing-app">
      {currentSession ? (
        <div>
          <h2>Session {currentSession}</h2>
          {isViewingSession ? ( // Display a summary for previous sessions
            <>
              <Summary routes={routes} />
              <button onClick={() => setIsViewingSession(false)}>
                Back to Session List
              </button>
            </>
          ) : (
            <>
              <button onClick={completeSession}>Complete Session</button>
              <button onClick={addNewRoute}>Add Route</button>
              {routes.map((route) => (
                <Route key={route.id} route={route} updateRoute={updateRoute} />
              ))}
              <Summary routes={routes} />
            </>
          )}
        </div>
      ) : (
        <div>
          <button onClick={startNewSession}>Start New Session</button>
          <SessionList sessions={sessions} loadSession={loadSession} />
        </div>
      )}
    </div>
  );
};

export default ClimbingApp;
