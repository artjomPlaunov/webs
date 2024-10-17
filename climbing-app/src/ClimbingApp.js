// ClimbingApp.js
import React, { useState, useEffect } from 'react';

const Route = ({ route, updateRoute }) => {
  const handleSwipe = (success) => {
    updateRoute(route.id, success);
  };

  const handleSliderChange = (e) => {
    updateRoute(route.id, null, Number(e.target.value));
  };

  const difficultyLevels = ['V0', 'V1', 'V2', 'V3', 'V4'];

  return (
    <div style={{ border: '1px solid gray', padding: '10px', margin: '10px' }}>
      <h3>{`Route ${route.id}`}</h3>

      <label htmlFor={`difficulty-slider-${route.id}`}>
        Select Difficulty: {difficultyLevels[route.difficulty]}
      </label>
      <input
        type="range"
        id={`difficulty-slider-${route.id}`}
        min="0"
        max={difficultyLevels.length - 1}
        value={route.difficulty}
        onChange={handleSliderChange}
        disabled={route.attempts > 0}
        style={{ width: '100%' }}
      />

      {route.difficulty !== '' && (
        <div>
          <button onClick={() => handleSwipe(true)}>Success</button>
          <button onClick={() => handleSwipe(false)}>Fail</button>
          <p>{`Attempts: ${route.attempts}, Successes: ${route.successes}, Failures: ${route.failures}`}</p>
        </div>
      )}
    </div>
  );
};

const Summary = ({ routes }) => {
  const difficultyLevels = ['V0', 'V1', 'V2', 'V3', 'V4'];

  return (
    <table border="1" cellPadding="5" style={{ marginTop: '20px' }}>
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
            <td>{difficultyLevels[route.difficulty]}</td>
            <td>{route.attempts}</td>
            <td>{route.successes}</td>
            <td>{route.failures}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ClimbingApp = () => {
  const [routes, setRoutes] = useState([]);

  // Fetch routes from server when component loads
  useEffect(() => {
    fetch('http://localhost:5000/api/routes')
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((error) => console.error('Error fetching routes:', error));
  }, []);

  const updateRoute = (routeId, success = null, difficulty = null) => {
    const updatedRoute = routes.find((route) => route.id === routeId);
    
    if (difficulty !== null) {
      updatedRoute.difficulty = difficulty;
    }

    if (success !== null) {
      updatedRoute.attempts += 1;
      if (success) {
        updatedRoute.successes += 1;
      } else {
        updatedRoute.failures += 1;
      }
    }

    fetch(`http://localhost:5000/api/routes/${routeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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

  return (
    <div>
      <h1>Rock Climbing Session</h1>
      {routes.map((route) => (
        <Route key={route.id} route={route} updateRoute={updateRoute} />
      ))}
      <Summary routes={routes} />
    </div>
  );
};

export default ClimbingApp;
