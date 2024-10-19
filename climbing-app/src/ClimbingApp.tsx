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
  id: number;
  routes: Route[];
}

// HomePage Component: The main landing page of the application
const HomePage: React.FC = () => {
  // useNavigate is a hook from React Router for programmatic navigation
  const navigate: NavigateFunction = useNavigate();

  return (
    <div className="home">
      <h1>Climbing Tracker</h1>
      {/* Navigation buttons that use the navigate function to change routes */}
      <button onClick={() => navigate('/new-session')}>Start New Session</button>
      <button onClick={() => navigate('/view-sessions')}>View Sessions</button>
    </div>
  );
};

// DifficultySelector Component: A reusable dropdown for selecting climbing difficulty
interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="difficulty-selector">
      <label>Difficulty:</label>
      {/* Dropdown menu with options from V0 to V11 */}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select difficulty</option>
        {/* Create an array of 12 elements and map over it to generate options */}
        {[...Array(12)].map((_, i) => (
          <option key={i} value={`V${i}`}>V{i}</option>
        ))}
      </select>
    </div>
  );
};

// LogAttemptButtons Component: Buttons and display for logging climbing attempts
interface LogAttemptButtonsProps {
  attempts: Attempts;
  onSuccess: () => void;
  onFailure: () => void;
}

const LogAttemptButtons: React.FC<LogAttemptButtonsProps> = ({ attempts, onSuccess, onFailure }) => {
  return (
    <div className="log-attempt-buttons">
      <p>Successful Attempts: {attempts.success}</p>
      <p>Failed Attempts: {attempts.fail}</p>
      <button onClick={onSuccess}>Log Success</button>
      <button onClick={onFailure}>Log Failure</button>
    </div>
  );
};

// NewSession Component: Page for creating a new climbing session
const NewSession: React.FC = () => {
  // State for storing routes and current route index
  const [routes, setRoutes] = useState<Route[]>([{ difficulty: '', attempts: { success: 0, fail: 0 } }]);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const navigate: NavigateFunction = useNavigate();

  // Function to add a new route to the session
  const addRoute = (): void => {
    setRoutes([...routes, { difficulty: '', attempts: { success: 0, fail: 0 } }]);
    setRouteIndex(routes.length);
  };

  // Function to update a specific route's data
  const updateRoute = (index: number, updatedRoute: Route): void => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = updatedRoute;
    setRoutes(updatedRoutes);
  };

  // Function to submit the session data to the server
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

  // Create a variable for the current route
  const currentRoute = routes[routeIndex];

  return (
    <div className="new-session">
      <h1>New Climbing Session</h1>

      <div>
        <h2>Route {routeIndex + 1}</h2>
        <DifficultySelector 
          value={currentRoute.difficulty} 
          onChange={(difficulty) => updateRoute(routeIndex, { ...currentRoute, difficulty })}
        />
        <LogAttemptButtons 
          attempts={currentRoute.attempts} 
          onSuccess={() => updateRoute(routeIndex, {
            ...currentRoute, 
            attempts: { ...currentRoute.attempts, success: currentRoute.attempts.success + 1 }
          })}
          onFailure={() => updateRoute(routeIndex, {
            ...currentRoute, 
            attempts: { ...currentRoute.attempts, fail: currentRoute.attempts.fail + 1 }
          })}
        />
      </div>

      {/* Navigation and submission buttons */}
      <button onClick={addRoute}>Add New Route</button>
      {routeIndex > 0 && (
        <button onClick={() => setRouteIndex(routeIndex - 1)}>Previous Route</button>
      )}
      {routeIndex < routes.length - 1 && (
        <button onClick={() => setRouteIndex(routeIndex + 1)}>Next Route</button>
      )}

      <button onClick={handleSubmit}>Submit Session</button>
    </div>
  );
};

// ViewSessions Component: Page for viewing all climbing sessions
const ViewSessions: React.FC = () => {
  // State for storing fetched sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate: NavigateFunction = useNavigate();

  // useEffect hook to fetch sessions when the component mounts
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
      {/* Table to display session data */}
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
                {session.routes.map((route, index) => (
                  <span key={index}>
                    {route.difficulty} [Sends: {route.attempts.success}  Punts: {route.attempts.fail}]
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
