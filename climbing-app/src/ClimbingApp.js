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
  § Route Component

  The Route component represents a single climbing route within a session.
  It displays the route's difficulty and allows the user to update its status.

  In React, components are the building blocks of user interfaces. They encapsulate
  pieces of the UI and their behavior. This component is a function that takes props
  (properties) as input and returns JSX (a syntax extension for JavaScript that looks
  similar to HTML) to describe what should be rendered.
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
  § Summary Component

  The Summary component displays a table summarizing the routes in a session.
  It shows the difficulty, attempts, successes, and failures for each route.

  This component demonstrates how React can efficiently render lists of data.
  The `map` function is used to transform each route object into a table row.
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
  § SessionList Component

  The SessionList component displays a list of previous climbing sessions.
  It allows the user to select and load a specific session.

  This component showcases how to handle user interactions in React. The `onClick`
  prop is used to attach an event handler that calls the `loadSession` function
  when a session is clicked.
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
  § ClimbingApp Component

  The main ClimbingApp component manages the overall state and functionality
  of the application. It uses React hooks to manage state and side effects.

  React hooks are functions that allow functional components to use state and
  lifecycle features. They were introduced in React 16.8 to allow developers
  to use state and other React features without writing a class.
*/

const ClimbingApp = () => {
  /*
    § State Management with useState

    The useState hook is used to add state to functional components. It returns
    an array with two elements: the current state value and a function to update it.

    Here, we're using useState to manage several pieces of state:
    - sessions: a list of all climbing sessions
    - currentSession: the ID of the current session
    - routes: a list of routes in the current session
    - isViewingSession: a flag to indicate if we're viewing a previous session
  */
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isViewingSession, setIsViewingSession] = useState(false);

  /*
    § Side Effects with useEffect

    The useEffect hook lets you perform side effects in function components.
    It's similar to componentDidMount, componentDidUpdate, and componentWillUnmount
    combined in class components.

    This useEffect hook is used to fetch the list of sessions when the component mounts.
    The empty dependency array [] means this effect will only run once, when the
    component is first rendered.
  */
  useEffect(() => {
    fetch('http://localhost:5000/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((error) => console.error('Error fetching sessions:', error));
  }, []);

  /*
    § API Interaction Functions

    These functions handle interactions with the backend API. They demonstrate
    how to make HTTP requests from a React component and update the local state
    based on the server's response.
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

  /*
    § Rendering

    In React, the render method (or return statement in functional components)
    describes what the UI should look like. React uses this description to
    efficiently update and render the right components when your data changes.

    This render method uses conditional rendering to display different views
    based on the current state of the application.
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
