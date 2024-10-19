"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary dependencies from React and React Router
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
require("./ClimbingApp.css");
// HomePage Component: The main landing page of the application
const HomePage = () => {
    // useNavigate is a hook from React Router for programmatic navigation
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<div className="home">
      <h1>Climbing Tracker</h1>
      {/* Navigation buttons that use the navigate function to change routes */}
      <button onClick={() => navigate('/new-session')}>Start New Session</button>
      <button onClick={() => navigate('/view-sessions')}>View Sessions</button>
    </div>);
};
const DifficultySelector = ({ value, onChange }) => {
    return (<div className="difficulty-selector">
      <label>Difficulty:</label>
      {/* Dropdown menu with options from V0 to V11 */}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select difficulty</option>
        {/* Create an array of 12 elements and map over it to generate options */}
        {[...Array(12)].map((_, i) => (<option key={i} value={`V${i}`}>V{i}</option>))}
      </select>
    </div>);
};
const LogAttemptButtons = ({ attempts, onSuccess, onFailure }) => {
    return (<div className="log-attempt-buttons">
      <p>Successful Attempts: {attempts.success}</p>
      <p>Failed Attempts: {attempts.fail}</p>
      <button onClick={onSuccess}>Log Success</button>
      <button onClick={onFailure}>Log Failure</button>
    </div>);
};
// NewSession Component: Page for creating a new climbing session
const NewSession = () => {
    // State for storing routes and current route index
    const [routes, setRoutes] = (0, react_1.useState)([{ difficulty: '', attempts: { success: 0, fail: 0 } }]);
    const [currentRoute, setCurrentRoute] = (0, react_1.useState)(0);
    const navigate = (0, react_router_dom_1.useNavigate)();
    // Function to add a new route to the session
    const addRoute = () => {
        setRoutes([...routes, { difficulty: '', attempts: { success: 0, fail: 0 } }]);
        setCurrentRoute(routes.length);
    };
    // Function to update a specific route's data
    const updateRoute = (index, updatedRoute) => {
        const updatedRoutes = [...routes];
        updatedRoutes[index] = updatedRoute;
        setRoutes(updatedRoutes);
    };
    // Function to submit the session data to the server
    const handleSubmit = async () => {
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
        }
        else {
            alert('Failed to submit session');
        }
    };
    return (<div className="new-session">
      <h1>New Climbing Session</h1>

      {/* Display current route information */}
      <div>
        <h2>Route {currentRoute + 1}</h2>
        <DifficultySelector value={routes[currentRoute].difficulty} onChange={(difficulty) => updateRoute(currentRoute, { ...routes[currentRoute], difficulty })}/>
        <LogAttemptButtons attempts={routes[currentRoute].attempts} onSuccess={() => updateRoute(currentRoute, {
            ...routes[currentRoute],
            attempts: { ...routes[currentRoute].attempts, success: routes[currentRoute].attempts.success + 1 }
        })} onFailure={() => updateRoute(currentRoute, {
            ...routes[currentRoute],
            attempts: { ...routes[currentRoute].attempts, fail: routes[currentRoute].attempts.fail + 1 }
        })}/>
      </div>

      {/* Navigation and submission buttons */}
      <button onClick={addRoute}>Add New Route</button>
      <button onClick={() => setCurrentRoute(currentRoute - 1)} disabled={currentRoute === 0}>Previous Route</button>
      <button onClick={() => setCurrentRoute(currentRoute + 1)} disabled={currentRoute === routes.length - 1}>Next Route</button>

      <button onClick={handleSubmit}>Submit Session</button>
    </div>);
};
// ViewSessions Component: Page for viewing all climbing sessions
const ViewSessions = () => {
    // State for storing fetched sessions
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const navigate = (0, react_router_dom_1.useNavigate)();
    // useEffect hook to fetch sessions when the component mounts
    (0, react_1.useEffect)(() => {
        const fetchSessions = async () => {
            const response = await fetch('http://localhost:5000/api/sessions');
            const data = await response.json();
            setSessions(data);
        };
        fetchSessions();
    }, []);
    return (<div className="view-sessions">
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
          {sessions.map((session) => (<tr key={session.id}>
              <td>{session.id}</td>
              <td>{session.routes.length}</td>
            </tr>))}
        </tbody>
      </table>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>);
};
// Main App Component: Sets up routing for the entire application
const ClimbingApp = () => {
    return (<react_router_dom_1.BrowserRouter>
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/" element={<HomePage />}/>
        <react_router_dom_1.Route path="/new-session" element={<NewSession />}/>
        <react_router_dom_1.Route path="/view-sessions" element={<ViewSessions />}/>
      </react_router_dom_1.Routes>
    </react_router_dom_1.BrowserRouter>);
};
exports.default = ClimbingApp;
