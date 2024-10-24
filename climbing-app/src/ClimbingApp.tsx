// Import necessary dependencies from React and React Router
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavigateFunction, Navigate } from 'react-router-dom';
import './ClimbingApp.css';

// Define interfaces for our data structures
interface Attempts {
  success: number;
  fail: number;
}

interface Route {
  difficulty: number;
  attempts: Attempts;
}

interface Session {
  id: string;
  date: string;
  routes: Route[];
}

// AuthPage Component: Handles both login and registration
const AuthPage: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    const endpoint = isRegistering ? 'register' : 'login';
    try {
      const response = await fetch(`http://localhost:5001/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setError('Registration successful! You can now log in.');
          setIsRegistering(false);
        } else {
          onLogin(data.token);
        }
      } else {
        setError(data.message || `${isRegistering ? 'Registration' : 'Login'} failed. Please try again.`);
      }
    } catch (error) {
      console.error(`${isRegistering ? 'Registration' : 'Login'} error:`, error);
      setError(`An error occurred during ${isRegistering ? 'registration' : 'login'}. Please try again.`);
    }
  };

  return (
    <div className="container">
      <div className="auth">
        <h1>Climbing Tracker</h1>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleAuth}>{isRegistering ? 'Register' : 'Login'}</button>
        <button onClick={() => setIsRegistering(!isRegistering)}>
          Switch to {isRegistering ? 'Login' : 'Register'}
        </button>
      </div>
    </div>
  );
};

// Dashboard Component: Shows options after login
const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <div className="dashboard">
      <h1>Welcome to Climbing Tracker</h1>
      <button onClick={() => navigate('/new-session')}>Start New Session</button>
      <button onClick={() => navigate('/view-sessions')}>View Sessions</button>
      <button onClick={onLogout}>Logout</button>
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
const NewSession: React.FC<{ token: string }> = ({ token }) => {
  const [routes, setRoutes] = useState<Route[]>([{ difficulty: 0, attempts: { success: 0, fail: 0 } }]);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const navigate: NavigateFunction = useNavigate();

  const addRoute = (): void => {
    let lastRoute = routes[routes.length - 1];
    const hasAttempts = lastRoute.attempts.success + lastRoute.attempts.fail > 0;
    if (hasAttempts) {
      setRoutes([...routes, { difficulty: 0, attempts: { success: 0, fail: 0 } }]);
      setRouteIndex(routes.length);
    } else {
      alert('Please log at least one attempt for the previous route before adding a new one.');
    }
  };

  const updateRoute = (index: number, updatedRoute: Route): void => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = updatedRoute;
    setRoutes(updatedRoutes);
  };

  const handleSubmit = async (): Promise<void> => {
    if (routes.length > 0) {
      const lastRoute = routes[routes.length - 1];
      if (lastRoute.attempts.success + lastRoute.attempts.fail === 0) {
        routes.pop();
      }
    }

    const hasValidRoutes = routes.length > 0;

    if (!hasValidRoutes) {
      alert('Please log at least one attempt for a route before submitting.');
      return;
    }

    const response = await fetch('http://localhost:5001/api/sessions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include the token in the request
      },
      body: JSON.stringify({ routes }),
    });
    
    if (response.ok) {
      alert('Session submitted!');
      navigate('/view-sessions');
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
          value={currentRoute.difficulty}
          onChange={(value) => updateRoute(routeIndex, { ...currentRoute, difficulty: value })}
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
const ViewSessions: React.FC<{ token: string }> = ({ token }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    const fetchSessions = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:5001/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setSessions(data);
          } else {
            console.error('Expected an array of sessions, but got:', data);
            setSessions([]); // Set to empty array or handle as needed
          }
        } else {
          console.error('Failed to fetch sessions:', response.statusText);
          setSessions([]); // Optionally handle error state
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]); // Handle network errors
      }
    };

    fetchSessions();
  }, [token]);

  return (
    <div className="view-sessions">
      <h1>Climbing Sessions</h1>
      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Routes</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.date}</td>
                <td>
                  {session.routes.map((route, index) => (
                    <span key={index} className={`grade-V${route.difficulty}`}>
                      V{route.difficulty} [Sends: {route.attempts.success} Punts: {route.attempts.fail}]
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

// Main App Component: Sets up routing for the entire application
const ClimbingApp: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <AuthPage onLogin={setToken} />} />
        <Route path="/dashboard" element={token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/new-session" element={token ? <NewSession token={token} /> : <Navigate to="/" />} />
        <Route path="/view-sessions" element={token ? <ViewSessions token={token} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default ClimbingApp;
