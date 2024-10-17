// ClimbingApp.js

// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';  // Circular slider library
import './ClimbingApp.css';  // Import custom styling

// The Route component represents each individual climbing route.
const Route = ({ route, updateRoute }) => {

  // Handle a swipe action (success or failure) from the user.
  const handleSwipe = (success) => {
    updateRoute(route.id, success);
  };

  // Handle difficulty change via the circular slider.
  const handleDifficultyChange = (value) => {
    updateRoute(route.id, null, value);  // Update route with new difficulty
  };

  // Define difficulty levels for display purposes.
  const difficultyLevels = ['V0', 'V1', 'V2', 'V3', 'V4'];

  // Return the JSX for rendering each route
  return (
    <div className="route">
      <h3>{`Route ${route.id}`}</h3>
      <div className="circular-slider">
        <CircularSlider
          label="Difficulty"
          data={difficultyLevels}  // Pass difficulty levels to the circular slider
          value={difficultyLevels[route.difficulty]}  // Set current difficulty value
          onChange={handleDifficultyChange}  // Handle value change
          width={120}  // Adjust the size of the circular slider
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

// The Summary component renders a table summarizing all climbing attempts.
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

// The main ClimbingApp component manages state and handles interactions.
const ClimbingApp = () => {
  const [routes, setRoutes] = useState([]);  // State to store the routes

  // Fetch initial routes from the backend when the component loads.
  useEffect(() => {
    fetch('http://localhost:5000/api/routes')
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((error) => console.error('Error fetching routes:', error));
  }, []);

  // Update a route's data (attempts, successes, failures, or difficulty).
  const updateRoute = (routeId, success = null, difficulty = null) => {
    const updatedRoute = routes.find((route) => route.id === routeId);

    if (difficulty !== null) updatedRoute.difficulty = difficulty;
    if (success !== null) {
      updatedRoute.attempts += 1;
      success ? updatedRoute.successes += 1 : updatedRoute.failures += 1;
    }

    fetch(`http://localhost:5000/api/routes/${routeId}`, {
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

  // Add a new route dynamically to the list.
  const addNewRoute = () => {
    const newRoute = {
      id: routes.length + 1,
      difficulty: 0,
      attempts: 0,
      successes: 0,
      failures: 0,
    };

    fetch('http://localhost:5000/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoute),
    })
      .then((res) => res.json())
      .then((data) => setRoutes((prevRoutes) => [...prevRoutes, data]))
      .catch((error) => console.error('Error adding route:', error));
  };

  return (
    <div className="climbing-app">
      <h1>Rock Climbing Session</h1>
      
      {/* Render the routes dynamically */}
      {routes.map((route) => (
        <Route key={route.id} route={route} updateRoute={updateRoute} />
      ))}

      {/* Button to add a new route */}
      <button className="add-route-btn" onClick={addNewRoute}>Add New Route</button>

      {/* Render the summary table */}
      <Summary routes={routes} />
    </div>
  );
};

export default ClimbingApp;
