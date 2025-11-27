import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, LogOut, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardUWRC = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({ states: [], lobs: [], customerIds: [] });
  const [selectedState, setSelectedState] = useState('All');
  const [selectedLOB, setSelectedLOB] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [selectedState, selectedLOB, selectedCustomerId]);

  const fetchData = async () => {
    try {
      const [statsRes, filtersRes] = await Promise.all([
        axios.get(`${API}/uwrc/statistics`),
        axios.get(`${API}/uwrc/filters`)
      ]);
      setStatistics(statsRes.data);
      setFilters(filtersRes.data);
      await fetchProperties();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedState !== 'All') params.append('state', selectedState);
      if (selectedLOB !== 'All') params.append('lob', selectedLOB);
      if (selectedCustomerId !== 'All') params.append('customerId', selectedCustomerId);
      
      const response = await axios.get(`${API}/uwrc/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6" data-testid="sidebar">
        <div className="space-y-6">
          <Button 
            variant="default" 
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="dashboard-nav-button"
          >
            <FileText className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <div className="pt-8">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
              data-testid="logout-button"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">Underwriter Workbench</h1>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://avatar.iran.liara.run/public/girl?username=Zara" />
                <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <p className="text-gray-600" data-testid="welcome-message">Welcome back, <span className="text-gray-900 font-semibold">{user?.fullName}</span></p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white border-gray-200 shadow-sm" data-testid="stat-new-business">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">New Business</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics?.newBusiness || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="stat-renewals">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Renewals</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics?.renewals || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="stat-endorsement">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Endorsement</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics?.endorsements || 0}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards - Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm" data-testid="stat-pending-submissions">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pending Submission</p>
                  <p className="text-3xl font-bold text-orange-600">{statistics?.pendingSubmissions || 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="stat-potential-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Potential Premium</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics?.potentialPremium || '$0M'}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="stat-hit-ratio">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Hit Ratio</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics?.hitRatio || 0}%</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="bg-white border-gray-300" data-testid="filter-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filters.states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">LOB</label>
              <Select value={selectedLOB} onValueChange={setSelectedLOB}>
                <SelectTrigger className="bg-white border-gray-300" data-testid="filter-lob">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filters.lobs.map(lob => (
                    <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Customer ID</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="bg-white border-gray-300" data-testid="filter-customer-id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filters.customerIds.map(id => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Risk Portfolio Table */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4" data-testid="risk-portfolio-title">Risk Portfolio</h2>
          <div className="overflow-x-auto">
            <Table data-testid="risk-portfolio-table">
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold">Product</TableHead>
                  <TableHead className="text-gray-700 font-semibold">LOB</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Customer Name</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Effective Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">SIC Code</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property, idx) => (
                  <TableRow key={property.id} className="border-gray-200 hover:bg-gray-50" data-testid={`property-row-${property.id}`}>
                    <TableCell className="font-medium text-gray-900">
                      <button 
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        data-testid={`property-link-${property.id}`}
                      >
                        {property.product}
                      </button>
                    </TableCell>
                    <TableCell className="text-gray-700">{property.lobs.join(', ')}</TableCell>
                    <TableCell className="text-gray-700">{property.customerName}</TableCell>
                    <TableCell className="text-gray-700">{property.effectiveDate}</TableCell>
                    <TableCell className="text-gray-700">{property.sicCode}</TableCell>
                    <TableCell className="text-gray-700">{property.operation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUWRC;
