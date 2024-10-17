// ClimbingApp.js

/*
  This file contains the main component for our Climbing App. It manages the state
  of climbing sessions and routes, and provides functionality for creating, viewing,
  and updating sessions and routes.

  We'll start by importing the necessary dependencies and components.
*/

import React, { useState, useEffect } from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';
import './ClimbingApp.css';

/*
  The Route component represents a single climbing route within a session.
  It displays the route's difficulty and allows the user to update its status.
*/

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

/*
  The Summary component displays a table summarizing the routes in a session.
  It shows the difficulty, attempts, successes, and failures for each route.
*/

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

/*
  The SessionList component displays a list of previous climbing sessions.
  It allows the user to select and load a specific session.
*/

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

/*
  The main ClimbingApp component manages the overall state and functionality
  of the application. It uses React hooks to manage state and side effects.
*/

const ClimbingApp = () => {
  // State variables to manage the application's data
  const [sessions, setSessions] = useState([]); // List of all sessions
  const [currentSession, setCurrentSession] = useState(null); // ID of the current session
  const [routes, setRoutes] = useState([]); // List of routes in the current session
  const [isViewingSession, setIsViewingSession] = useState(false); // Flag for viewing previous sessions

  /*
    useEffect hook to fetch the list of sessions when the component mounts.
    This is similar to componentDidMount in class components.
  */
  useEffect(() => {
    fetch('http://localhost:5000/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((error) => console.error('Error fetching sessions:', error));
  }, []);

  /*
    Function to start a new climbing session.
    It sends a POST request to the server and updates the local state.
  */
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

  /*
    Function to load an existing session.
    It fetches the session data from the server and updates the local state.
  */
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

  /*
    Function to mark the current session as complete.
    It sends a PUT request to the server and resets the local state.
  */
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

  /*
    Function to update a route within the current session.
    It can update the difficulty or success/failure status of a route.
  */
  const updateRoute = (routeId, success = null, difficulty = null) => {
    console.log('changing', success, difficulty);
    const updatedRoute = routes.find((route) => route.id === routeId);
    console.log(updatedRoute, success, difficulty)
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



  /*
    Function to add a new route to the current session.
    It sends a POST request to the server and updates the local state.
  */
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

  /*
    The render method for the ClimbingApp component.
    It conditionally renders different views based on the current state.
  */
  return (
    <div className="climbing-app">
      {currentSession ? (
        // If there's a current session, show the session view
        <div>
          <h2>Session {currentSession}</h2>
          {isViewingSession ? (
            // If viewing a previous session, show only the summary
            <>
              <Summary routes={routes} />
              <button onClick={() => setIsViewingSession(false)}>
                Back to Session List
              </button>
            </>
          ) : (
            // If it's an active session, show the full interface
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
        // If there's no current session, show the session list and start button
        <div>
          <button onClick={startNewSession}>Start New Session</button>
          <SessionList sessions={sessions} loadSession={loadSession} />
        </div>
      )}
    </div>
  );
};

// Export the ClimbingApp component as the default export
export default ClimbingApp;
 
