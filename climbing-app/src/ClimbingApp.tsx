// Import necessary dependencies from React and React Router
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavigateFunction } from 'react-router-dom';
import './ClimbingApp.css';

// These imports are crucial for our React application:
// - useEffect and useState are React hooks for managing side effects and state
// - The imports from 'react-router-dom' are for handling routing in our app
// - We're also importing our CSS file for styling

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

// These interfaces define the shape of our data:
// - Attempts: Keeps track of successful and failed attempts
// - Route: Represents a climbing route with its difficulty and attempts
// - Session: Represents a climbing session with an ID, date, and array of routes

// HomePage Component: The main landing page of the application
const HomePage: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  // We use the useNavigate hook from react-router-dom to get a function
  // that allows us to programmatically navigate to different routes

  return (
    <div className="home">
      <h1>Climbing Tracker</h1>
      <button onClick={() => navigate('/new-session')}>Start New Session</button>
      <button onClick={() => navigate('/view-sessions')}>View Sessions</button>
    </div>
  );
};

// This HomePage component renders the main page with two buttons
// Each button uses the navigate function to go to a different route when clicked

// DifficultySlider Component: A reusable slider for selecting climbing difficulty
interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
}

// This interface defines the props that the DifficultySlider component expects

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

// This DifficultySlider component creates a range input (slider) for selecting difficulty
// It displays the current value and calls the onChange function when the slider is moved

// Updated NewSession Component
const NewSession: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([{ difficulty: 0, attempts: { success: 0, fail: 0 } }]);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const navigate: NavigateFunction = useNavigate();

  // We use useState to manage the state of our routes and the current route index
  // We also use useNavigate for navigation after submitting the session

  const addRoute = (): void => {
    setRoutes([...routes, { difficulty: 0, attempts: { success: 0, fail: 0 } }]);
    setRouteIndex(routes.length);
  };

  // This function adds a new route to the routes array and sets the current index to the new route

  const updateRoute = (index: number, updatedRoute: Route): void => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = updatedRoute;
    setRoutes(updatedRoutes);
  };

  // This function updates a specific route in the routes array

  const handleSubmit = async (): Promise<void> => {
    const validSession = routes.every(route =>
      route.attempts.success + route.attempts.fail > 0
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

  // This function handles the submission of the session:
  // 1. It checks if the session is valid (all routes have difficulty and at least one attempt)
  // 2. If valid, it sends a POST request to the server with the session data
  // 3. It then shows an alert based on the success or failure of the submission
  // 4. If successful, it navigates back to the home page

  const currentRoute = routes[routeIndex];

  // This gets the current route based on the routeIndex

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

// This NewSession component renders the form for creating a new climbing session:
// - It uses the DifficultySlider component for setting route difficulty
// - It provides buttons for logging successful and failed attempts
// - It allows navigation between routes and adding new routes
// - It has a submit button to save the session

// ViewSessions Component: Page for viewing all climbing sessions
const ViewSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate: NavigateFunction = useNavigate();

  // We use useState to store the fetched sessions
  // We use useNavigate for the "Back to Home" button

  useEffect(() => {
    const fetchSessions = async (): Promise<void> => {
      const response = await fetch('http://localhost:5000/api/sessions');
      const data: Session[] = await response.json();
      setSessions(data);
    };

    fetchSessions();
  }, []);

  // This useEffect hook runs when the component mounts
  // It fetches the sessions from the server and updates the state

  return (
    <div className="view-sessions">
      <h1>Climbing Sessions</h1>
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
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

// This ViewSessions component displays a table of all climbing sessions:
// - It shows the date of each session
// - For each session, it lists all routes with their difficulty and attempts
// - It applies CSS classes based on the route difficulty for styling
// - It provides a "Back to Home" button for navigation

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

// This is the main component of our application:
// - It uses React Router to set up the routing for our app
// - It defines which component should be rendered for each route

export default ClimbingApp;

// We export the ClimbingApp component as the default export
// This allows us to import it in other files (like index.js) to render our app
