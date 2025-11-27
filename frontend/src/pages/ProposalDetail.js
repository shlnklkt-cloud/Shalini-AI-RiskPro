import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, FileText, BarChart3, GitCompare, Trash2, ExternalLink, TrendingUp } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProposalDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullAssessment, setShowFullAssessment] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('allianz');

  // Calculate dynamic dates
  const dynamicDates = useMemo(() => {
    const today = new Date();
    // Effective date: system date + 2 months
    const effectiveDate = new Date(today);
    effectiveDate.setMonth(effectiveDate.getMonth() + 2);
    
    // Expiration date: effective date + 12 months
    const expirationDate = new Date(effectiveDate);
    expirationDate.setMonth(expirationDate.getMonth() + 12);
    
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    return {
      effectiveDate: formatDate(effectiveDate),
      expirationDate: formatDate(expirationDate)
    };
  }, []);

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

  const handleGenerateQuote = () => {
    alert('Quote has been generated successfully.');
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
      case 'to_do': return 'Pending Submission';
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
                <p className="text-xs text-white uppercase mb-2">Client ID</p>
                <p className="text-lg font-semibold text-white" data-testid="client-id">{proposal.clientId}</p>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">First Name Insured</p>
                <p className="text-lg font-semibold text-white" data-testid="first-name-insured">{proposal.firstNameInsured}</p>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">Business Type</p>
                <p className="text-lg font-semibold text-white" data-testid="business-type">{proposal.businessType}</p>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">Total Insured Value</p>
                <p className="text-lg font-semibold text-white" data-testid="total-insured-value">{proposal.totalInsuredValue}</p>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">Website</p>
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
                <p className="text-xs text-white uppercase mb-2">Priority</p>
                <Badge className={getPriorityColor(proposal.priority)} data-testid="priority-badge">
                  {proposal.priority.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">Created By</p>
                <p className="text-lg font-semibold text-white" data-testid="created-by">{proposal.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">Effective Date</p>
                <p className="text-lg font-semibold text-white" data-testid="effective-date">{dynamicDates.effectiveDate}</p>
              </div>
              <div>
                <p className="text-xs text-white uppercase mb-2">Expiration Date</p>
                <p className="text-lg font-semibold text-white" data-testid="expiration-date">{dynamicDates.expirationDate}</p>
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
                <Button 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 text-lg" 
                  data-testid="view-full-assessment-button"
                  onClick={() => setShowFullAssessment(true)}
                >
                  View Full Assessment
                </Button>
              </div>
            </div>

            {/* Full Risk Assessment Modal */}
            {showFullAssessment && (
              <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto" onClick={() => setShowFullAssessment(false)}>
                <div className="min-h-screen px-4 py-8">
                  <div className="max-w-7xl mx-auto bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8 rounded-t-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-4xl font-bold mb-2">Comprehensive Risk Assessment</h1>
                          <p className="text-blue-100">Property: {proposal.title}</p>
                          <p className="text-blue-100">Location: {proposal.location}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="text-white hover:bg-white/20"
                          onClick={() => setShowFullAssessment(false)}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                      {/* Overall Risk Score */}
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Overall Risk Score</h2>
                        <div className="flex items-center justify-center mb-6">
                          <div className="relative">
                            <svg className="transform -rotate-90" width="200" height="200">
                              <circle cx="100" cy="100" r="80" stroke="#e5e7eb" strokeWidth="16" fill="none" />
                              <circle
                                cx="100" cy="100" r="80"
                                stroke="#06b6d4" strokeWidth="16" fill="none"
                                strokeDasharray={502} strokeDashoffset={502 - (502 * 48.5) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-5xl font-bold text-cyan-500">48.5</span>
                            </div>
                          </div>
                        </div>
                        <div className="max-w-3xl mx-auto bg-blue-50 p-6 rounded-lg">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Risk Analysis Summary</h3>
                          <p className="text-gray-700">
                            This property has been classified as <span className="font-bold text-orange-600">MODERATE RISK</span> based on comprehensive catastrophic modeling. 
                            The overall risk score of 48.5 indicates moderate exposure to natural disasters, with flood and hurricane risks being the primary concerns. 
                            Enhanced mitigation strategies are recommended for these specific perils.
                          </p>
                        </div>
                      </div>

                      {/* Detailed Risk Component Breakdown */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Risk Component Breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Earthquake Risk */}
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-900">Earthquake Risk</h3>
                              <span className="text-3xl font-bold text-orange-600">42.0</span>
                            </div>
                            <Progress value={42} className="h-3 mb-4" style={{backgroundColor: '#fed7aa'}} />
                            <p className="text-gray-700 mb-4">
                              Moderate seismic activity in the region. Building age and construction type influence vulnerability. 
                              Regular structural assessments recommended.
                            </p>
                            <div className="bg-white p-3 rounded">
                              <p className="text-sm font-semibold text-gray-900">Recommendations for Improvement:</p>
                              <p className="text-sm text-gray-700">Seismic retrofitting, foundation reinforcement</p>
                            </div>
                          </div>

                          {/* Wildfire Risk */}
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-900">Wildfire Risk</h3>
                              <span className="text-3xl font-bold text-green-600">20.0</span>
                            </div>
                            <Progress value={20} className="h-3 mb-4" style={{backgroundColor: '#bbf7d0'}} />
                            <p className="text-gray-700 mb-4">
                              Low wildfire risk due to urban location and adequate fire protection infrastructure. 
                              Vegetation management and fire suppression systems in place.
                            </p>
                            <div className="bg-white p-3 rounded">
                              <p className="text-sm font-semibold text-gray-900">Recommendations for Improvement:</p>
                              <p className="text-sm text-gray-700">Maintain defensible space, upgrade fire detection systems</p>
                            </div>
                          </div>

                          {/* Hurricane Risk */}
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-900">Hurricane Risk</h3>
                              <span className="text-3xl font-bold text-orange-600">65.0</span>
                            </div>
                            <Progress value={65} className="h-3 mb-4" style={{backgroundColor: '#fed7aa'}} />
                            <p className="text-gray-700 mb-4">
                              Elevated hurricane exposure based on coastal proximity. Wind speed projections indicate potential 
                              for Category 2-3 storms. Window and roof vulnerabilities identified.
                            </p>
                            <div className="bg-white p-3 rounded">
                              <p className="text-sm font-semibold text-gray-900">Recommendations for Improvement:</p>
                              <p className="text-sm text-gray-700">Impact-resistant windows, roof anchoring, storm shutters</p>
                            </div>
                          </div>

                          {/* Flood Risk */}
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-900">Flood Risk</h3>
                              <span className="text-3xl font-bold text-red-600">67.0</span>
                            </div>
                            <Progress value={67} className="h-3 mb-4" style={{backgroundColor: '#fecaca'}} />
                            <p className="text-gray-700 mb-4">
                              High flood risk identified. Property located in FEMA flood zone with historical flooding events. 
                              Storm surge and river overflow are primary concerns.
                            </p>
                            <div className="bg-white p-3 rounded">
                              <p className="text-sm font-semibold text-gray-900">Recommendations for Improvement:</p>
                              <p className="text-sm text-gray-700">Elevation, flood barriers, improved drainage systems</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Catastrophic Risk Modeling */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Catastrophic Risk Modeling</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Earthquake Risk</h3>
                            <div className="text-4xl font-bold mb-4">$336K</div>
                            <div className="space-y-1 text-sm">
                              <p>AAL: $12,500</p>
                              <p>PML (100yr): $145K</p>
                              <p>PML (250yr): $336K</p>
                              <p className="pt-2 border-t border-white/30">Probability: 0.4%</p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Flood Risk</h3>
                            <div className="text-4xl font-bold mb-4">$206K</div>
                            <div className="space-y-1 text-sm">
                              <p>AAL: $18,200</p>
                              <p>PML (100yr): $98K</p>
                              <p>PML (250yr): $206K</p>
                              <p className="pt-2 border-t border-white/30">Probability: 2.3%</p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Hurricane Risk</h3>
                            <div className="text-4xl font-bold mb-4">$286K</div>
                            <div className="space-y-1 text-sm">
                              <p>AAL: $15,800</p>
                              <p>PML (100yr): $132K</p>
                              <p>PML (250yr): $286K</p>
                              <p className="pt-2 border-t border-white/30">Probability: 1.8%</p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Wildfire Risk</h3>
                            <div className="text-4xl font-bold mb-4">$107K</div>
                            <div className="space-y-1 text-sm">
                              <p>AAL: $4,200</p>
                              <p>PML (100yr): $52K</p>
                              <p>PML (250yr): $107K</p>
                              <p className="pt-2 border-t border-white/30">Probability: 0.2%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location Intelligence */}
                      <div>
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg flex items-center gap-3">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <h2 className="text-3xl font-bold">Location Intelligence & Risk Mapping</h2>
                        </div>
                        
                        <div className="bg-white rounded-b-lg overflow-hidden border border-gray-200">
                          {/* Embedded Google Maps with Satellite View */}
                          <div className="relative h-96 bg-gray-100">
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{border: 0}}
                              referrerPolicy="no-referrer-when-downgrade"
                              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=JW+Marriott+Chicago&center=41.8796,-87.632&zoom=19&maptype=satellite"
                              allowFullScreen
                              title="Property Location Map"
                            ></iframe>
                          </div>

                          {/* Location Details Grid */}
                          <div className="grid grid-cols-4 gap-6 p-6 bg-gray-50">
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Address</p>
                              <p className="text-base font-semibold text-gray-900">151 W Adams St</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Latitude</p>
                              <p className="text-base font-semibold text-gray-900">41.879600</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Longitude</p>
                              <p className="text-base font-semibold text-gray-900">-87.632000</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Precision</p>
                              <p className="text-base font-semibold text-gray-900">Rooftop</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-6 p-6 pt-0 bg-gray-50">
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">City</p>
                              <p className="text-base font-semibold text-gray-900">Chicago</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">State</p>
                              <p className="text-base font-semibold text-gray-900">IL</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Risk Analysis */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Risk & Concentration Analysis</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Cost of Building</p>
                              <p className="text-2xl font-bold text-gray-900">{proposal.totalInsuredValue}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">SIC Description</p>
                              <p className="text-2xl font-bold text-gray-900">{proposal.businessType}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Year Built</p>
                              <p className="text-2xl font-bold text-gray-900">2010</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Construction</p>
                              <p className="text-2xl font-bold text-gray-900">Steel Frame</p>
                            </div>
                          </div>
                          <div className="border-t border-gray-300 pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Mitigation Recommendations</h3>
                            <ul className="space-y-3 text-gray-700">
                              <li className="flex items-start">
                                <span className="text-cyan-500 font-bold mr-2">•</span>
                                Implement comprehensive flood mitigation measures including elevation and drainage improvements
                              </li>
                              <li className="flex items-start">
                                <span className="text-cyan-500 font-bold mr-2">•</span>
                                Upgrade hurricane protection with impact-resistant materials and reinforced openings
                              </li>
                              <li className="flex items-start">
                                <span className="text-cyan-500 font-bold mr-2">•</span>
                                Consider seismic retrofitting to reduce earthquake vulnerability
                              </li>
                              <li className="flex items-start">
                                <span className="text-cyan-500 font-bold mr-2">•</span>
                                Annual risk assessment reviews recommended to monitor changing exposure levels
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3">
                          Download Full Report
                        </Button>
                        <Button variant="outline" className="border-gray-300 px-8 py-3" onClick={() => setShowFullAssessment(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  Pending Submission
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
            <div className="bg-white rounded-lg">
              <div className="p-8">
                <h1 className="text-5xl font-serif text-gray-900 mb-2">Risk Analyzer</h1>
                <p className="text-gray-600 text-lg">Comprehensive risk assessment engine for {proposal.title}</p>
              </div>

              {/* Tabs */}
              <div className="border-t border-gray-200">
                <Tabs defaultValue="exposures" className="w-full">
                  <div className="flex border-b border-gray-200 px-8">
                    <TabsList className="bg-transparent h-auto p-0 space-x-8">
                      <TabsTrigger 
                        value="exposures" 
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                        data-testid="exposures-tab"
                      >
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Exposures
                      </TabsTrigger>
                      <TabsTrigger 
                        value="liabilities" 
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                        data-testid="liabilities-tab"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Limit of Liabilities
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="exposures" className="p-8 mt-0">
                    {/* Value Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                        <p className="text-sm text-gray-700 mb-2">2024 Total Insurable Value</p>
                        <p className="text-4xl font-bold text-blue-600">$125.0M</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                        <p className="text-sm text-gray-700 mb-2">2025 Total Insurable Value</p>
                        <p className="text-4xl font-bold text-purple-600">$132.0M</p>
                      </div>
                    </div>

                    {/* Exposure Breakdown */}
                    <div>
                      <h2 className="text-3xl font-serif text-gray-900 mb-6">Exposure Breakdown</h2>
                      
                      {/* Business Interruption */}
                      <div className="mb-8 pb-8 border-b border-gray-200">
                        <h3 className="text-xl text-gray-900 mb-4">Business Interruption</h3>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Previous Value</p>
                            <p className="text-3xl font-bold text-blue-600">$45.0M</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Current Value</p>
                            <p className="text-3xl font-bold text-purple-600">$48.0M</p>
                          </div>
                        </div>
                      </div>

                      {/* Building Values */}
                      <div className="mb-8 pb-8 border-b border-gray-200">
                        <h3 className="text-xl text-gray-900 mb-4">Building Values</h3>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Previous Value</p>
                            <p className="text-3xl font-bold text-blue-600">$65.0M</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Current Value</p>
                            <p className="text-3xl font-bold text-purple-600">$69.0M</p>
                          </div>
                        </div>
                      </div>

                      {/* Contents */}
                      <div>
                        <h3 className="text-xl text-gray-900 mb-4">Contents</h3>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Previous Value</p>
                            <p className="text-3xl font-bold text-blue-600">$15.0M</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Current Value</p>
                            <p className="text-3xl font-bold text-purple-600">$15.0M</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="liabilities" className="p-8 mt-0">
                    <h2 className="text-3xl font-serif text-gray-900 mb-6">Limit of Liabilities - Chicago Marriott Downtown Magnificent Mile</h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-4 px-4 text-gray-700 font-semibold">Category</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">Per Occurrence Limit</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">Aggregate Limit</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Account Receivable</td>
                            <td className="text-right py-4 px-4 text-gray-900">$2,000,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$5,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Pipe Burst</td>
                            <td className="text-right py-4 px-4 text-gray-900">$5,000,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$10,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Boiler & Machinery</td>
                            <td className="text-right py-4 px-4 text-gray-900">$25,000,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$25,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Spoilage/Perishables</td>
                            <td className="text-right py-4 px-4 text-gray-900">$500,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$1,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Water Damage</td>
                            <td className="text-right py-4 px-4 text-gray-900">$10,000,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$20,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Liquor Liability</td>
                            <td className="text-right py-4 px-4 text-gray-900">$1,000,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$2,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">Professional Liability</td>
                            <td className="text-right py-4 px-4 text-gray-900">$5,000,000</td>
                            <td className="text-right py-4 px-4 text-gray-900">$10,000,000</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">
                              War & Terrorism <span className="text-red-600 text-sm">(Not Covered)</span>
                            </td>
                            <td className="text-right py-4 px-4 text-gray-500">-</td>
                            <td className="text-right py-4 px-4 text-gray-500">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quote' && (
          <div className="space-y-6" data-testid="quote-comparison-content">
            <div className="bg-white rounded-lg">
              <div className="p-8">
                <h1 className="text-5xl font-serif text-gray-900 mb-2">Quote Comparison Dashboard</h1>
                <p className="text-gray-600 text-lg">Multi-Carrier Quote Comparison - {proposal.title}</p>
              </div>

              {/* Tabs */}
              <div className="border-t border-gray-200">
                <Tabs defaultValue="chart" className="w-full">
                  <div className="flex border-b border-gray-200 px-8">
                    <TabsList className="bg-transparent h-auto p-0 space-x-8">
                      <TabsTrigger 
                        value="chart" 
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                        data-testid="chart-comparison-tab"
                      >
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Chart Comparison
                      </TabsTrigger>
                      <TabsTrigger 
                        value="financial" 
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                        data-testid="financial-overview-tab"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Financial Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="limits" 
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                        data-testid="limits-liabilities-tab"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Limits of Liabilities
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Chart Comparison Tab */}
                  <TabsContent value="chart" className="p-8 mt-0">
                    <h2 className="text-3xl font-serif text-gray-900 mb-2">Quote Comparison</h2>
                    <p className="text-gray-600 mb-8">{proposal.title}</p>
                    
                    {/* Chart - Attachment Point Visualization */}
                    <div className="mb-8 bg-white p-8 rounded-lg border border-gray-200 relative">
                      {/* Y-axis label (rotated) */}
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 origin-center">
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Attachment Point</span>
                      </div>

                      <div className="flex ml-12">
                        {/* Y-axis labels */}
                        <div className="flex flex-col justify-between pr-4" style={{width: '60px'}}>
                          <div className="text-sm text-gray-600 text-right">30M</div>
                          <div className="text-sm text-gray-600 text-right">25M</div>
                          <div className="text-sm text-gray-600 text-right">20M</div>
                          <div className="text-sm text-gray-600 text-right">15M</div>
                          <div className="text-sm text-gray-600 text-right">10M</div>
                          <div className="text-sm text-gray-600 text-right">5M</div>
                          <div className="text-sm text-gray-600 text-right">0</div>
                        </div>

                        {/* Chart bars */}
                        <div className="flex-1">
                          <div>
                            {/* Liberty Mutual */}
                            <div className="flex items-center" style={{height: '48px', margin: 0, padding: 0}}>
                              <div className="w-full flex" style={{margin: 0}}>
                                <div className="bg-blue-900 flex items-center justify-center text-white font-semibold px-4" style={{width: '10%', height: '48px', margin: 0}}>
                                  <span className="text-xs">Liberty Mutual (80%)</span>
                                </div>
                                <div className="bg-cyan-400 flex items-center justify-center text-white font-bold px-4" style={{width: '50%', height: '48px', margin: 0}}>
                                  <span>Zurich (100%)</span>
                                </div>
                                <div className="flex items-center justify-start px-4" style={{width: '40%', height: '48px', margin: 0}}>
                                  <span className="text-gray-700 font-semibold">$23,000</span>
                                </div>
                              </div>
                            </div>

                            {/* Munich Re */}
                            <div className="flex items-center" style={{height: '48px', margin: 0, padding: 0}}>
                              <div className="w-full flex" style={{margin: 0}}>
                                <div className="bg-blue-700 flex items-center justify-center text-white font-semibold px-4" style={{width: '20%', height: '48px', margin: 0}}>
                                  <span className="text-sm">Munich Re (40%)</span>
                                </div>
                                <div className="bg-purple-500 flex items-center justify-center text-white font-bold px-4" style={{width: '60%', height: '48px', margin: 0}}>
                                  <span>AIG (80%)</span>
                                </div>
                                <div className="flex items-center justify-start px-4" style={{width: '20%', height: '48px', margin: 0}}>
                                  <span className="text-gray-700 font-semibold">$27,000</span>
                                </div>
                              </div>
                            </div>

                            {/* Chubb */}
                            <div className="flex items-center" style={{height: '48px', margin: 0, padding: 0}}>
                              <div className="w-full flex" style={{margin: 0}}>
                                <div className="bg-purple-600 flex items-center justify-center text-white font-semibold px-4" style={{width: '25%', height: '48px', margin: 0}}>
                                  <span className="text-sm">Chubb (70%)</span>
                                </div>
                                <div className="flex items-center justify-start px-4" style={{width: '75%', height: '48px', margin: 0}}>
                                  <span className="text-gray-700 font-semibold">$24,000</span>
                                </div>
                              </div>
                            </div>

                            {/* Allianz */}
                            <div className="flex items-center" style={{height: '48px', margin: 0, padding: 0}}>
                              <div className="w-full flex" style={{margin: 0}}>
                                <div className="bg-indigo-700 flex items-center justify-center text-white font-semibold px-4" style={{width: '30%', height: '48px', margin: 0}}>
                                  <span className="text-sm">Allianz (50%)</span>
                                </div>
                                <div className="flex items-center justify-start px-4" style={{width: '70%', height: '48px', margin: 0}}>
                                  <span className="text-gray-700 font-semibold">$28,000</span>
                                </div>
                              </div>
                            </div>

                            {/* Zurich */}
                            <div className="flex items-center" style={{height: '48px', margin: 0, padding: 0}}>
                              <div className="w-full flex" style={{margin: 0}}>
                                <div className="bg-blue-900 flex items-center justify-center text-white font-semibold px-4" style={{width: '10%', height: '48px', margin: 0}}>
                                  <span className="text-xs">Liberty Mutual (80%)</span>
                                </div>
                                <div className="bg-cyan-400 flex items-center justify-center text-white font-bold px-4" style={{width: '50%', height: '48px', margin: 0}}>
                                  <span>Zurich (20%)</span>
                                </div>
                                <div className="flex items-center justify-start px-4" style={{width: '40%', height: '48px', margin: 0}}>
                                  <span className="text-gray-700 font-semibold">$26,000</span>
                                </div>
                              </div>
                            </div>

                            {/* AIG */}
                            <div className="flex items-center" style={{height: '48px', margin: 0, padding: 0}}>
                              <div className="w-full flex" style={{margin: 0}}>
                                <div className="bg-blue-700 flex items-center justify-center text-white font-semibold px-4" style={{width: '20%', height: '48px', margin: 0}}>
                                  <span className="text-sm">Munich Re (40%)</span>
                                </div>
                                <div className="bg-purple-500 flex items-center justify-center text-white font-bold px-4" style={{width: '60%', height: '48px', margin: 0}}>
                                  <span>AIG (80%)</span>
                                </div>
                                <div className="flex items-center justify-start px-4" style={{width: '20%', height: '48px', margin: 0}}>
                                  <span className="text-gray-700 font-semibold">$22,000</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="flex justify-between mt-4 px-2">
                            <span className="text-sm text-gray-600">0%</span>
                            <span className="text-sm text-gray-600">10%</span>
                            <span className="text-sm text-gray-600">20%</span>
                            <span className="text-sm text-gray-600">30%</span>
                            <span className="text-sm text-gray-600">40%</span>
                            <span className="text-sm text-gray-600">50%</span>
                            <span className="text-sm text-gray-600">60%</span>
                            <span className="text-sm text-gray-600">70%</span>
                            <span className="text-sm text-gray-600">80%</span>
                            <span className="text-sm text-gray-600">90%</span>
                            <span className="text-sm text-gray-600">100%</span>
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-sm font-semibold text-gray-700">Capacity</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provider Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Allianz */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                          <img 
                            src="https://logo.clearbit.com/allianz.com" 
                            alt="Allianz" 
                            className="h-8 w-8 object-contain mr-3"
                          />
                          <h3 className="text-2xl font-bold text-gray-900">Allianz</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Premium:</span>
                            <span className="text-2xl font-bold text-blue-600">$2.95M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Limit:</span>
                            <span className="text-lg font-semibold text-gray-900">$85M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Commission:</span>
                            <span className="text-lg font-semibold text-green-600">15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="text-lg font-semibold text-purple-600">$85M</span>
                          </div>
                        </div>
                      </div>

                      {/* Munich Re */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                          <img 
                            src="https://logo.clearbit.com/munichre.com" 
                            alt="Munich Re" 
                            className="h-8 w-8 object-contain mr-3"
                          />
                          <h3 className="text-2xl font-bold text-gray-900">Munich Re</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Premium:</span>
                            <span className="text-2xl font-bold text-blue-600">$2.99M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Limit:</span>
                            <span className="text-lg font-semibold text-gray-900">$90M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Commission:</span>
                            <span className="text-lg font-semibold text-green-600">14.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="text-lg font-semibold text-purple-600">$90M</span>
                          </div>
                        </div>
                      </div>

                      {/* AIG */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                          <div className="h-10 px-4 bg-blue-700 rounded flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-xl tracking-wide">AIG</span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">AIG</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Premium:</span>
                            <span className="text-2xl font-bold text-blue-600">$2.78M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Limit:</span>
                            <span className="text-lg font-semibold text-gray-900">$88M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Commission:</span>
                            <span className="text-lg font-semibold text-green-600">15.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="text-lg font-semibold text-purple-600">$88M</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Financial Overview Tab */}
                  <TabsContent value="financial" className="p-8 mt-0">
                    <h2 className="text-3xl font-serif text-gray-900 mb-6">Financial Overview - Key Metrics</h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-4 px-4 text-gray-700 font-semibold">Underwriting Company</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">100% Premium</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">Attachment Point</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">Limit</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">Written Capacity</th>
                            <th className="text-right py-4 px-4 text-gray-700 font-semibold">Commission %</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-6 px-4">
                              <div className="flex items-center">
                                <img 
                                  src="https://logo.clearbit.com/allianz.com" 
                                  alt="Allianz" 
                                  className="h-6 w-6 object-contain mr-3"
                                />
                                <span className="font-semibold text-gray-900">Allianz</span>
                              </div>
                            </td>
                            <td className="text-right py-6 px-4 text-gray-900 font-semibold">$2,950,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$6,000,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$25,000,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$25,000,000</td>
                            <td className="text-right py-6 px-4 text-green-600 font-semibold">15%</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-6 px-4">
                              <div className="flex items-center">
                                <img 
                                  src="https://logo.clearbit.com/munichre.com" 
                                  alt="Munich Re" 
                                  className="h-6 w-6 object-contain mr-3"
                                />
                                <span className="font-semibold text-gray-900">Munich Re</span>
                              </div>
                            </td>
                            <td className="text-right py-6 px-4 text-gray-900 font-semibold">$2,990,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$5,000,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$30,000,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$30,000,000</td>
                            <td className="text-right py-6 px-4 text-green-600 font-semibold">14.5%</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="py-6 px-4">
                              <div className="flex items-center">
                                <div className="h-6 px-3 bg-blue-700 rounded flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm tracking-wide">AIG</span>
                                </div>
                                <span className="font-semibold text-gray-900">AIG</span>
                              </div>
                            </td>
                            <td className="text-right py-6 px-4 text-gray-900 font-semibold">$2,780,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$5,000,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$28,000,000</td>
                            <td className="text-right py-6 px-4 text-gray-900">$28,000,000</td>
                            <td className="text-right py-6 px-4 text-green-600 font-semibold">15.5%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  {/* Limits of Liabilities Tab */}
                  <TabsContent value="limits" className="p-8 mt-0">
                    <h2 className="text-3xl font-serif text-gray-900 mb-6">Limits of Liabilities - Multi-Carrier Comparison</h2>
                    
                    <div className="overflow-x-auto">
                      <RadioGroup value={selectedCarrier} onValueChange={setSelectedCarrier}>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-300">
                              <th className="text-left py-4 px-4 text-gray-700 font-semibold">Category</th>
                              <th className="text-center py-4 px-4 text-gray-700 font-semibold">
                                <div className="flex items-center justify-center gap-3">
                                  <RadioGroupItem 
                                    value="allianz" 
                                    id="allianz-radio"
                                    className="border-2 border-gray-400"
                                    data-testid="allianz-radio"
                                  />
                                  <label htmlFor="allianz-radio" className="flex items-center gap-2 cursor-pointer">
                                    <img 
                                      src="https://logo.clearbit.com/allianz.com" 
                                      alt="Allianz" 
                                      className="h-5 w-5 object-contain"
                                    />
                                    <span>Allianz</span>
                                  </label>
                                </div>
                              </th>
                              <th className="text-center py-4 px-4 text-gray-700 font-semibold">
                                <div className="flex items-center justify-center gap-3">
                                  <RadioGroupItem 
                                    value="munich" 
                                    id="munich-radio"
                                    className="border-2 border-gray-400"
                                    data-testid="munich-radio"
                                  />
                                  <label htmlFor="munich-radio" className="flex items-center gap-2 cursor-pointer">
                                    <img 
                                      src="https://logo.clearbit.com/munichre.com" 
                                      alt="Munich Re" 
                                      className="h-5 w-5 object-contain"
                                    />
                                    <span>Munich Re</span>
                                  </label>
                                </div>
                              </th>
                              <th className="text-center py-4 px-4 text-gray-700 font-semibold">
                                <div className="flex items-center justify-center gap-3">
                                  <RadioGroupItem 
                                    value="aig" 
                                    id="aig-radio"
                                    className="border-2 border-gray-400"
                                    data-testid="aig-radio"
                                  />
                                  <label htmlFor="aig-radio" className="flex items-center gap-2 cursor-pointer">
                                    <div className="h-5 px-3 bg-blue-700 rounded flex items-center justify-center">
                                      <span className="text-white font-bold text-xs tracking-wide">AIG</span>
                                    </div>
                                    <span>AIG</span>
                                  </label>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Account Receivable</td>
                              <td className="text-center py-4 px-4 text-gray-900">$2,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$2,200,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$1,900,000</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Pipe Burst</td>
                              <td className="text-center py-4 px-4 text-gray-900">$5,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$5,500,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$4,600,000</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Boiler & Machinery</td>
                              <td className="text-center py-4 px-4 text-gray-900">$25,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$28,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$24,000,000</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Spoilage/Perishables</td>
                              <td className="text-center py-4 px-4 text-gray-900">$500,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$550,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$460,000</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Water Damage</td>
                              <td className="text-center py-4 px-4 text-gray-900">$10,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$11,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$9,500,000</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Liquor Liability</td>
                              <td className="text-center py-4 px-4 text-gray-900">$1,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$1,100,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$950,000</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">Professional Liability</td>
                              <td className="text-center py-4 px-4 text-gray-900">$5,000,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$5,500,000</td>
                              <td className="text-center py-4 px-4 text-gray-900">$4,600,000</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-900">
                                War & Terrorism <span className="text-red-600 text-sm">(Not Covered)</span>
                              </td>
                              <td className="text-center py-4 px-4 text-gray-500">-</td>
                              <td className="text-center py-4 px-4 text-gray-500">-</td>
                              <td className="text-center py-4 px-4 text-gray-500">-</td>
                            </tr>
                          </tbody>
                        </table>
                      </RadioGroup>
                    </div>

                    {/* Generate Quote Button */}
                    <div className="mt-8">
                      <Button
                        onClick={handleGenerateQuote}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                        data-testid="generate-quote-button"
                      >
                        Generate Quote
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalDetail;
