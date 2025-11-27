import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, Clock, TrendingUp, CheckCircle, Zap, LogOut, Plus, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New proposal form state
  const [newProposal, setNewProposal] = useState({
    title: '',
    client: '',
    location: '',
    priority: 'medium',
    clientId: '',
    firstNameInsured: '',
    businessType: '',
    totalInsuredValue: '',
    website: '',
    effectiveDate: '',
    expirationDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [proposals, activeTab, searchQuery]);

  const fetchData = async () => {
    try {
      const [statsRes, proposalsRes] = await Promise.all([
        axios.get(`${API}/statistics`),
        axios.get(`${API}/proposals`)
      ]);
      setStatistics(statsRes.data);
      setProposals(proposalsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterProposals = () => {
    let filtered = [...proposals];

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProposals(filtered);
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/proposals`, newProposal, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsNewProposalOpen(false);
      setNewProposal({
        title: '',
        client: '',
        location: '',
        priority: 'medium',
        clientId: '',
        firstNameInsured: '',
        businessType: '',
        totalInsuredValue: '',
        website: '',
        effectiveDate: '',
        expirationDate: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-black border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-black border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-black border-green-500/30';
      default: return 'bg-gray-500/20 text-black border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'to_do': return 'bg-blue-500/20 text-black border-blue-500/30';
      case 'in_process': return 'bg-cyan-500/20 text-black border-cyan-500/30';
      case 'completed': return 'bg-green-500/20 text-black border-green-500/30';
      default: return 'bg-gray-500/20 text-black border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'to_do': return 'Pending Submission';
      case 'in_process': return 'In Process';
      case 'completed': return 'Completed';
      default: return status;
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
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
            data-testid="dashboard-nav-button"
          >
            <FileText className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <div className="pt-8">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="dashboard-title">Underwriter Workbench</h1>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://avatar.iran.liara.run/public/girl?username=Lara" />
                <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <p className="text-gray-400" data-testid="welcome-message">Welcome back, <span className="text-white font-semibold">{user?.fullName}</span></p>
            </div>
          </div>
          <Dialog open={isNewProposalOpen} onOpenChange={setIsNewProposalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="new-proposal-button">
                <Plus className="mr-2 h-4 w-4" />
                New Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="new-proposal-dialog">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Proposal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Title</Label>
                    <Input
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                      data-testid="proposal-title-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Client</Label>
                    <Input
                      value={newProposal.client}
                      onChange={(e) => setNewProposal({...newProposal, client: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                      data-testid="proposal-client-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Location</Label>
                    <Input
                      value={newProposal.location}
                      onChange={(e) => setNewProposal({...newProposal, location: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                      data-testid="proposal-location-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Priority</Label>
                    <Select value={newProposal.priority} onValueChange={(value) => setNewProposal({...newProposal, priority: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white" data-testid="proposal-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Client ID</Label>
                    <Input
                      value={newProposal.clientId}
                      onChange={(e) => setNewProposal({...newProposal, clientId: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">First Name Insured</Label>
                    <Input
                      value={newProposal.firstNameInsured}
                      onChange={(e) => setNewProposal({...newProposal, firstNameInsured: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Business Type</Label>
                    <Input
                      value={newProposal.businessType}
                      onChange={(e) => setNewProposal({...newProposal, businessType: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Total Insured Value</Label>
                    <Input
                      value={newProposal.totalInsuredValue}
                      onChange={(e) => setNewProposal({...newProposal, totalInsuredValue: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="$100.0M"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Website</Label>
                    <Input
                      value={newProposal.website}
                      onChange={(e) => setNewProposal({...newProposal, website: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Effective Date</Label>
                    <Input
                      value={newProposal.effectiveDate}
                      onChange={(e) => setNewProposal({...newProposal, effectiveDate: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="MM/DD/YYYY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Expiration Date</Label>
                    <Input
                      value={newProposal.expirationDate}
                      onChange={(e) => setNewProposal({...newProposal, expirationDate: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="MM/DD/YYYY"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="create-proposal-submit">
                    Create Proposal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700" data-testid="stat-total-submissions">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Submission</p>
                  <p className="text-3xl font-bold text-white">{statistics?.totalSubmissions || 0}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700" data-testid="stat-pending-submissions">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Pending Submission</p>
                  <p className="text-3xl font-bold text-orange-400">{statistics?.pendingSubmissions || 0}</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700" data-testid="stat-in-process">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">In Process</p>
                  <p className="text-3xl font-bold text-blue-400">{statistics?.inProcess || 0}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700" data-testid="stat-completed">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-400">{statistics?.completed || 0}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700" data-testid="stat-hit-ratio">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Hit Ratio</p>
                  <p className="text-3xl font-bold text-purple-400">{statistics?.hitRatio || 0}%</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Submission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
                data-testid="search-proposals-input"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              className={activeTab === 'all' ? 'bg-gray-900 text-white' : 'text-gray-400 border-gray-600 hover:bg-gray-700'}
              onClick={() => setActiveTab('all')}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button
              variant={activeTab === 'to_do' ? 'default' : 'outline'}
              className={activeTab === 'to_do' ? 'bg-gray-900 text-white' : 'text-gray-400 border-gray-600 hover:bg-gray-700'}
              onClick={() => setActiveTab('to_do')}
              data-testid="filter-todo"
            >
              Pending Submission
            </Button>
            <Button
              variant={activeTab === 'in_process' ? 'default' : 'outline'}
              className={activeTab === 'in_process' ? 'bg-gray-900 text-white' : 'text-gray-400 border-gray-600 hover:bg-gray-700'}
              onClick={() => setActiveTab('in_process')}
              data-testid="filter-in-process"
            >
              In Process
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'default' : 'outline'}
              className={activeTab === 'completed' ? 'bg-gray-900 text-white' : 'text-gray-400 border-gray-600 hover:bg-gray-700'}
              onClick={() => setActiveTab('completed')}
              data-testid="filter-completed"
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4" data-testid="proposal-queue-title">Submission Queue</h2>
          <div className="overflow-x-auto">
            <Table data-testid="proposals-table">
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700">Property Name</TableHead>
                  <TableHead className="text-gray-700">Client</TableHead>
                  <TableHead className="text-gray-700">Location</TableHead>
                  <TableHead className="text-gray-700">Priority</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id} className="border-gray-200 hover:bg-gray-50" data-testid={`proposal-row-${proposal.id}`}>
                    <TableCell className="font-medium text-gray-900">{proposal.title}</TableCell>
                    <TableCell className="text-gray-700">{proposal.client}</TableCell>
                    <TableCell className="text-gray-700">{proposal.location}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(proposal.priority)} data-testid={`priority-badge-${proposal.id}`}>
                        {proposal.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(proposal.status)} data-testid={`status-badge-${proposal.id}`}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        onClick={() => navigate(`/proposal/${proposal.id}`)}
                        data-testid={`view-proposal-${proposal.id}`}
                      >
                        View
                      </Button>
                    </TableCell>
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

export default Dashboard;