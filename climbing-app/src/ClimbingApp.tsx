// Import necessary dependencies from React and React Router
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavigateFunction } from 'react-router-dom';
import './ClimbingApp.css';

// Define interfaces for our data structures
interface Attempts {
  success: number;
  fail: number;
}

interface Route {
  difficulty: string;
  attempts: Attempts;
}

interface Session {
  id: string; // Change to string
  date: string; // Add date property
  routes: Route[];
}

// HomePage Component: The main landing page of the application
const HomePage: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <div className="home">
      <h1>Climbing Tracker</h1>
      <button onClick={() => navigate('/new-session')}>Start New Session</button>
      <button onClick={() => navigate('/view-sessions')}>View Sessions</button>
    </div>
  );
};

// DifficultySlider Component: A reusable slider for selecting climbing difficulty
interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const DifficultySlider: React.FC<DifficultySliderProps> = ({ value, onChange }) => {
  return (
    <div className="difficulty-slider">
      <label>Difficulty: V{value}</label>
      <input
        type="range"
        min="0"
        max="11"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

// Updated NewSession Component
const NewSession: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([{ difficulty: 'V0', attempts: { success: 0, fail: 0 } }]);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const navigate: NavigateFunction = useNavigate();

  const addRoute = (): void => {
    setRoutes([...routes, { difficulty: 'V0', attempts: { success: 0, fail: 0 } }]);
    setRouteIndex(routes.length);
  };

  const updateRoute = (index: number, updatedRoute: Route): void => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = updatedRoute;
  };

  const handleSubmit = async (): Promise<void> => {
    const validSession = routes.every(route =>
      route.difficulty !== '' &&
      (route.attempts.success + route.attempts.fail) > 0
    );

    if (!validSession) {
      alert('Please ensure all routes have a difficulty set and at least one attempt logged.');
      return;
    }

    const response = await fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routes }),
    });
    
    if (response.ok) {
      alert('Session submitted!');
      navigate('/');
    } else {
      alert('Failed to submit session');
    }
  };

  const currentRoute = routes[routeIndex];

  return (
    <div className="new-session">
      <h1 className="session-header">New Climbing Session</h1>

      <div>
        <h2>Route {routeIndex + 1}</h2>
        <DifficultySlider 
          value={parseInt(currentRoute.difficulty.replace('V', '') || '0')} 
          onChange={(value) => updateRoute(routeIndex, { ...currentRoute, difficulty: `V${value}` })}
        />
        <div className="log-attempt-buttons">
          <p className="attempt-text">Successful Attempts: {currentRoute.attempts.success}</p>
          <p className="attempt-text">Failed Attempts: {currentRoute.attempts.fail}</p>
          <button className="log-success" onClick={() => updateRoute(routeIndex, {
            ...currentRoute, attempts: { ...currentRoute.attempts, success: currentRoute.attempts.success + 1 }
          })}>Log Success</button>
          <button className="log-failure" onClick={() => updateRoute(routeIndex, {
            ...currentRoute, attempts: { ...currentRoute.attempts, fail: currentRoute.attempts.fail + 1 }
          })}>Log Failure</button>
        </div>
      </div>

      {routeIndex > 0 && (
        <button className="nav-button previous-route" onClick={() => setRouteIndex(routeIndex - 1)}>Previous Route</button>
      )}
      {routeIndex < routes.length - 1 && (
        <button className="nav-button next-route" onClick={() => setRouteIndex(routeIndex + 1)}>Next Route</button>
      )}

      <button className="fixed-button" onClick={addRoute}>Add New Route</button>
      <button className="fixed-button submit-button" onClick={handleSubmit}>Submit Session</button>
    </div>
  );
};

// ViewSessions Component: Page for viewing all climbing sessions
const ViewSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    const fetchSessions = async (): Promise<void> => {
      const response = await fetch('http://localhost:5000/api/sessions');
      const data: Session[] = await response.json();
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
            <th>Date</th> {/* Change header to Date */}
            <th>Routes</th>
          </tr>
        </thead>
<tbody>
  {sessions.map((session) => (
    <tr key={session.id}>
      <td>{session.date}</td>
      <td>
        {session.routes.map((route, index) => (
          <span key={index} className={`grade-${route.difficulty}`}> {/* Apply the grade class */}
            {route.difficulty} [Sends: {route.attempts.success} Punts: {route.attempts.fail}]
          </span>
        ))}
      </td>
    </tr>
  ))}
</tbody>

      </table>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

// Main App Component: Sets up routing for the entire application
const ClimbingApp: React.FC = () => {
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

