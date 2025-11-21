import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, FileText, BarChart3, GitCompare, Trash2, ExternalLink } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProposalDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      const response = await axios.get(`${API}/proposals/${id}`);
      setProposal(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`${API}/proposals/${id}`, { status: newStatus });
      fetchProposal();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/proposals/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-yellow-500 text-black';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'to_do': return 'To Do';
      case 'in_process': return 'In Process';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!proposal) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Proposal not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6" data-testid="proposal-sidebar">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-gray-700 mb-8"
          onClick={() => navigate('/dashboard')}
          data-testid="back-to-dashboard-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase mb-3">Property Menu</p>
          
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('overview')}
            data-testid="overview-tab-button"
          >
            <FileText className="mr-2 h-4 w-4" />
            Overview
          </Button>

          <Button
            variant={activeTab === 'risk' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'risk' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('risk')}
            data-testid="risk-analyzer-tab-button"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Risk Analyzer
          </Button>

          <Button
            variant={activeTab === 'quote' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'quote' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('quote')}
            data-testid="quote-comparison-tab-button"
          >
            <GitCompare className="mr-2 h-4 w-4" />
            Quote Comparison
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="proposal-title">{proposal.title}</h1>
            <p className="text-gray-400 text-lg" data-testid="proposal-client">{proposal.client}</p>
          </div>
          <Button 
            className="bg-cyan-600 hover:bg-cyan-700"
            data-testid="in-progress-button"
          >
            {getStatusLabel(proposal.status).toUpperCase()}
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6" data-testid="overview-content">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Client ID</p>
                <p className="text-lg font-semibold text-white" data-testid="client-id">{proposal.clientId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">First Name Insured</p>
                <p className="text-lg font-semibold text-white" data-testid="first-name-insured">{proposal.firstNameInsured}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Business Type</p>
                <p className="text-lg font-semibold text-white" data-testid="business-type">{proposal.businessType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Total Insured Value</p>
                <p className="text-lg font-semibold text-white" data-testid="total-insured-value">{proposal.totalInsuredValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Website</p>
                <a 
                  href={`https://${proposal.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  data-testid="website-link"
                >
                  {proposal.website}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Priority</p>
                <Badge className={getPriorityColor(proposal.priority)} data-testid="priority-badge">
                  {proposal.priority.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Created By</p>
                <p className="text-lg font-semibold text-white" data-testid="created-by">{proposal.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Effective Date</p>
                <p className="text-lg font-semibold text-white" data-testid="effective-date">{proposal.effectiveDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Expiration Date</p>
                <p className="text-lg font-semibold text-white" data-testid="expiration-date">{proposal.expirationDate}</p>
              </div>
            </div>

            {/* Status Update Section */}
            <div className="mt-8">
              <p className="text-lg font-semibold text-white mb-4">Update Status:</p>
              <div className="flex gap-4">
                <Button
                  variant={proposal.status === 'to_do' ? 'default' : 'outline'}
                  className={proposal.status === 'to_do' ? 'bg-blue-600 text-white' : 'text-white border-gray-600 hover:bg-gray-700'}
                  onClick={() => handleStatusUpdate('to_do')}
                  data-testid="status-todo-button"
                >
                  To Do
                </Button>
                <Button
                  variant={proposal.status === 'in_process' ? 'default' : 'outline'}
                  className={proposal.status === 'in_process' ? 'bg-cyan-600 text-white' : 'text-white border-gray-600 hover:bg-gray-700'}
                  onClick={() => handleStatusUpdate('in_process')}
                  data-testid="status-in-process-button"
                >
                  In Process
                </Button>
                <Button
                  variant={proposal.status === 'completed' ? 'default' : 'outline'}
                  className={proposal.status === 'completed' ? 'bg-green-600 text-white' : 'text-white border-gray-600 hover:bg-gray-700'}
                  onClick={() => handleStatusUpdate('completed')}
                  data-testid="status-completed-button"
                >
                  Completed
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <p className="text-lg font-semibold text-red-400 mb-4">Danger Zone:</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    data-testid="delete-proposal-button"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Proposal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700" data-testid="delete-confirmation-dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      This action cannot be undone. This will permanently delete the proposal.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="confirm-delete-button"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6" data-testid="risk-analyzer-content">
            {/* Document Upload Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Document Extraction & Analysis</h2>
                <p className="text-gray-400 mb-4">Upload property documents for AI-powered risk assessment</p>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" data-testid="document-upload-area">
                  <input type="file" id="file-upload" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Click to upload documents</p>
                    <p className="text-gray-500 text-sm">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                  </label>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">Property_Assessment.pdf</p>
                        <p className="text-gray-500 text-xs">2.4 MB • Extracted 5 mins ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Processed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">Building_Inspection.pdf</p>
                        <p className="text-gray-500 text-xs">1.8 MB • Extracted 12 mins ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Processed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">Financial_Statements.pdf</p>
                        <p className="text-gray-500 text-xs">3.2 MB • Extracted 20 mins ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Processed</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    AI Extraction Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-gray-400">Documents Processed</p>
                      <p className="text-white font-semibold text-lg">3</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Data Points Extracted</p>
                      <p className="text-white font-semibold text-lg">47</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Risk Factors Identified</p>
                      <p className="text-white font-semibold text-lg">8</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Confidence Score</p>
                      <p className="text-white font-semibold text-lg">94%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis Report */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Risk Analysis Report</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300 font-medium">Property Risk Score</p>
                      <p className="text-white font-bold">72/100</p>
                    </div>
                    <Progress value={72} className="h-3" data-testid="property-risk-score" />
                    <p className="text-sm text-gray-500 mt-1">Moderate risk profile based on extracted data</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300 font-medium">Location Risk</p>
                      <p className="text-white font-bold">65/100</p>
                    </div>
                    <Progress value={65} className="h-3" data-testid="location-risk-score" />
                    <p className="text-sm text-gray-500 mt-1">Moderate location risk based on {proposal.location}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300 font-medium">Business Type Risk</p>
                      <p className="text-white font-bold">58/100</p>
                    </div>
                    <Progress value={58} className="h-3" data-testid="business-risk-score" />
                    <p className="text-sm text-gray-500 mt-1">{proposal.businessType} industry standard risk</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300 font-medium">Financial Exposure</p>
                      <p className="text-white font-bold">85/100</p>
                    </div>
                    <Progress value={85} className="h-3" data-testid="financial-risk-score" />
                    <p className="text-sm text-gray-500 mt-1">High value property: {proposal.totalInsuredValue}</p>
                  </div>

                  <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">AI-Generated Risk Recommendations</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Consider additional property protection measures</li>
                      <li>• Review location-specific compliance requirements for {proposal.location}</li>
                      <li>• Enhanced coverage recommended for high-value assets</li>
                      <li>• Property inspection report shows minor structural concerns - monitor quarterly</li>
                      <li>• Financial statements indicate strong stability - low credit risk</li>
                      <li>• Schedule annual risk assessment review</li>
                    </ul>
                  </div>

                  {/* Extracted Key Data Points */}
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">Key Data Extracted from Documents</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Building Age</p>
                        <p className="text-white">15 years</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Last Inspection</p>
                        <p className="text-white">March 2025</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Safety Systems</p>
                        <p className="text-white">Fire suppression, CCTV</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Occupancy Rate</p>
                        <p className="text-white">87%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Revenue (Annual)</p>
                        <p className="text-white">$12.5M</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Claims History</p>
                        <p className="text-white">2 in last 5 years</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'quote' && (
          <div className="space-y-6" data-testid="quote-comparison-content">
            <h2 className="text-2xl font-bold text-white mb-6">Insurance Quote Comparison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quote 1 */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Provider A</h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Recommended</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Annual Premium</p>
                      <p className="text-2xl font-bold text-white">$125,000</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Coverage Limit</p>
                      <p className="text-white font-semibold">{proposal.totalInsuredValue}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Deductible</p>
                      <p className="text-white font-semibold">$25,000</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Key Features</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>✓ Comprehensive coverage</li>
                        <li>✓ 24/7 claim support</li>
                        <li>✓ Business interruption</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" data-testid="select-quote-a">
                    Select Quote
                  </Button>
                </CardContent>
              </Card>

              {/* Quote 2 */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Provider B</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Annual Premium</p>
                      <p className="text-2xl font-bold text-white">$142,500</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Coverage Limit</p>
                      <p className="text-white font-semibold">{proposal.totalInsuredValue}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Deductible</p>
                      <p className="text-white font-semibold">$15,000</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Key Features</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>✓ Premium coverage</li>
                        <li>✓ Lower deductible</li>
                        <li>✓ Extended protection</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" data-testid="select-quote-b">
                    Select Quote
                  </Button>
                </CardContent>
              </Card>

              {/* Quote 3 */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Provider C</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Annual Premium</p>
                      <p className="text-2xl font-bold text-white">$108,750</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Coverage Limit</p>
                      <p className="text-white font-semibold">{proposal.totalInsuredValue}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Deductible</p>
                      <p className="text-white font-semibold">$50,000</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Key Features</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>✓ Basic coverage</li>
                        <li>✓ Cost effective</li>
                        <li>✓ Standard support</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" data-testid="select-quote-c">
                    Select Quote
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Comparison Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400">Feature</th>
                        <th className="text-center py-2 text-gray-400">Provider A</th>
                        <th className="text-center py-2 text-gray-400">Provider B</th>
                        <th className="text-center py-2 text-gray-400">Provider C</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-gray-700">
                        <td className="py-2">Response Time</td>
                        <td className="text-center">24h</td>
                        <td className="text-center">12h</td>
                        <td className="text-center">48h</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">Claims Processing</td>
                        <td className="text-center">Fast</td>
                        <td className="text-center">Very Fast</td>
                        <td className="text-center">Standard</td>
                      </tr>
                      <tr>
                        <td className="py-2">Customer Rating</td>
                        <td className="text-center">4.5/5</td>
                        <td className="text-center">4.7/5</td>
                        <td className="text-center">4.2/5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalDetail;
