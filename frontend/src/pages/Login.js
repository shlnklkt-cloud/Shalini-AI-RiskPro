import { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!role) {
      setError('Please select a role');
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
        role
      });

      if (response.data.success) {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2" data-testid="app-title">Risk Pro</h1>
          <p className="text-blue-600 text-lg">AI-Powered Commercial Risk Assessment</p>
        </div>

        <Card className="border-blue-200 bg-white shadow-xl" data-testid="login-card">
          <CardHeader>
            <CardTitle className="text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="error-alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900" data-testid="role-select">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="UWR_B">UWR_B</SelectItem>
                    <SelectItem value="UWR_C">UWR_C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                data-testid="signin-button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200" data-testid="test-credentials">
              <p className="text-sm font-semibold text-gray-900 mb-3">Test Credentials</p>
              <div className="space-y-3">
                <div className="p-2 bg-white rounded border border-blue-100">
                  <p className="text-xs font-medium text-gray-700 mb-1">User 1 - Broker</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Username:</span> LARA</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Password:</span> password123</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Role:</span> UWR_B</p>
                </div>
                <div className="p-2 bg-white rounded border border-blue-100">
                  <p className="text-xs font-medium text-gray-700 mb-1">User 2 - Broker</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Username:</span> ZARA</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Password:</span> password123</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Role:</span> UWR_C</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a 
            href="https://app.emergent.sh/?utm_source=emergent-badge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <img 
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" 
              alt="Emergent"
              className="w-6 h-6 rounded"
            />
            <span className="text-sm font-medium">Made with Emergent</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;