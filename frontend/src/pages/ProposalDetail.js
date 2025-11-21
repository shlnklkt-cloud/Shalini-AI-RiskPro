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
  const [showFullAssessment, setShowFullAssessment] = useState(false);

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

            {/* Documents & AI Extraction Section */}
            <div className="mt-12 bg-blue-600 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Documents & AI Extraction</h3>
            </div>
            <div className="bg-white p-6 rounded-b-lg">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white mb-6" data-testid="upload-document-button">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Document
              </Button>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-lg">PropSov1 - Cleansed SOV.xlsx</p>
                    <p className="text-gray-500 text-sm">9.9 KB • Uploaded 11/20/2025</p>
                    <Badge className="mt-2 bg-green-500 text-white border-0">
                      COMPLETED (85% confidence)
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    data-testid="view-data-button"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-green-600 border-green-300 hover:bg-green-50"
                    data-testid="download-button"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    data-testid="delete-document-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="mt-8 bg-white p-8 rounded-lg">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Risk Assessment</h3>
              <p className="text-gray-600 mb-8">Comprehensive CAT modeling and risk analysis</p>
              
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <svg className="transform -rotate-90" width="220" height="220">
                    <circle
                      cx="110"
                      cy="110"
                      r="90"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                      fill="none"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r="90"
                      stroke="#06b6d4"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={565}
                      strokeDashoffset={565 - (565 * 48.5) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-cyan-500">48.5</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 text-lg" data-testid="view-full-assessment-button">
                  View Full Assessment
                </Button>
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
                    <p className="text-sm text-gray-500 mt-1">Moderate risk profile</p>
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
                    <h3 className="text-white font-semibold mb-2">Risk Recommendations</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Consider additional property protection measures</li>
                      <li>• Review location-specific compliance requirements for {proposal.location}</li>
                      <li>• Enhanced coverage recommended for high-value assets</li>
                      <li>• Schedule annual risk assessment review</li>
                    </ul>
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
