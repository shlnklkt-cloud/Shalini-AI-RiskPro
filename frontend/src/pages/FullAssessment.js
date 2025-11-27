import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FullAssessment = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const response = await axios.get(`${API}/properties/${id}/full-assessment`);
      setAssessment(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-500/20 border-red-500/50';
      case 'moderate': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 border-green-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const getCatModelColor = (type) => {
    if (type.includes('Earthquake')) return 'bg-red-500';
    if (type.includes('Flood')) return 'bg-blue-500';
    if (type.includes('Hurricane')) return 'bg-purple-500';
    if (type.includes('Wildfire')) return 'bg-green-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading assessment...</div>;
  }

  if (!assessment) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Assessment not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600">
      {/* Header */}
      <div className="bg-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-blue-600 mb-4"
            onClick={() => navigate(`/property/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property
          </Button>
          <h1 className="text-4xl font-bold">Comprehensive Risk Assessment</h1>
          <p className="text-xl mt-2">Property: {assessment.propertyName}</p>
          <p className="text-lg opacity-90">Location: {assessment.locationIntelligence?.city}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Overall Risk Score */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Overall Risk Score</h2>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-64 h-64">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle cx="128" cy="128" r="100" stroke="#e5e7eb" strokeWidth="20" fill="none" />
                <circle 
                  cx="128" 
                  cy="128" 
                  r="100" 
                  stroke="#06b6d4" 
                  strokeWidth="20" 
                  fill="none" 
                  strokeDasharray="628" 
                  strokeDashoffset="314" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-bold text-cyan-500">{assessment.overallRiskScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Analysis Summary */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Risk Analysis Summary</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            {assessment.riskAnalysisSummary?.moderateRisk}
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <p className="text-gray-800 font-medium">{assessment.riskAnalysisSummary?.recommendation}</p>
          </div>
        </div>

        {/* Detailed Risk Component Breakdown */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Risk Component Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessment.riskComponents?.map((component, index) => (
              <div 
                key={index} 
                className={`border-2 rounded-lg p-6 ${getSeverityColor(component.severity)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{component.name}</h3>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">{component.score}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        component.severity === 'high' ? 'bg-red-500' : 
                        component.severity === 'moderate' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${component.score}%` }}
                    />
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{component.description}</p>
                <div className="bg-white/50 rounded p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-800">Recommendations:</p>
                  <p className="text-sm text-gray-700">{component.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catastrophic Risk Modeling */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Catastrophic Risk Modeling</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {assessment.catastrophicRiskModeling?.map((model, index) => (
              <div key={index} className={`${getCatModelColor(model.type)} text-white rounded-lg p-6`}>
                <h3 className="text-xl font-bold mb-2">{model.type}</h3>
                <p className="text-4xl font-bold mb-3">{model.amount}</p>
                <div className="text-sm opacity-90">
                  <p>{model.details.split(',')[0]}</p>
                  <p>{model.details.split(',')[1]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Intelligence & Risk Mapping */}
        <div className="bg-purple-700 text-white rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Location Intelligence & Risk Mapping
          </h2>
          <div className="bg-white rounded-lg p-1 mb-6">
            <img 
              src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-87.6298,41.8781,12,0/1200x400@2x?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example" 
              alt="Risk Map"
              className="w-full h-96 object-cover rounded"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'%3E%3Crect width='1200' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23fff'%3EMap View - Location Intelligence%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="opacity-75 mb-1">Address</p>
              <p className="font-bold">{assessment.locationIntelligence?.address}</p>
            </div>
            <div>
              <p className="opacity-75 mb-1">Coordinates</p>
              <p className="font-bold">{assessment.locationIntelligence?.coordinates}</p>
            </div>
            <div>
              <p className="opacity-75 mb-1">Year Built</p>
              <p className="font-bold">{assessment.locationIntelligence?.yearBuilt}</p>
            </div>
            <div>
              <p className="opacity-75 mb-1">Construction</p>
              <p className="font-bold">{assessment.locationIntelligence?.constructionType}</p>
            </div>
          </div>
        </div>

        {/* Detailed Risk & Concentration Analysis */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Risk & Concentration Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Total Insured Value</p>
              <p className="text-2xl font-bold text-gray-900">{assessment.concentrationAnalysis?.totalInsuredValue}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Business Type</p>
              <p className="text-2xl font-bold text-gray-900">{assessment.concentrationAnalysis?.businessType}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">SIC Code</p>
              <p className="text-2xl font-bold text-gray-900">{assessment.concentrationAnalysis?.sicCode}</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Construction Type</p>
              <p className="text-2xl font-bold text-gray-900">{assessment.concentrationAnalysis?.constructionType}</p>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Mitigation Recommendations</h3>
            <ul className="space-y-2">
              {assessment.mitigationRecommendations?.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAssessment;
