import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, FileText, BarChart3, GitCompare } from 'lucide-react';
import PropertyOverview from '../components/PropertyOverview';
import PropertyRiskAnalyzer from '../components/PropertyRiskAnalyzer';
import PropertyMultiLineQuote from '../components/PropertyMultiLineQuote';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PropertyDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API}/properties/${id}`);
      setProperty(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">Loading...</div>;
  }

  if (!property) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">Property not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6" data-testid="property-sidebar">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100 mb-8"
          onClick={() => navigate('/dashboard')}
          data-testid="back-to-dashboard-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase mb-3 font-semibold">Property Menu</p>
          
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('overview')}
            data-testid="overview-tab-button"
          >
            <FileText className="mr-2 h-4 w-4" />
            Overview
          </Button>

          <Button
            variant={activeTab === 'risk' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'risk' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('risk')}
            data-testid="risk-analyzer-tab-button"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Risk Analyzer
          </Button>

          <Button
            variant={activeTab === 'quote' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'quote' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('quote')}
            data-testid="multiline-quote-tab-button"
          >
            <GitCompare className="mr-2 h-4 w-4" />
            Multi Line Quote
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="property-title">{property.propertyName || property.customerName}</h1>
            <p className="text-gray-600 text-lg" data-testid="property-customer">{property.customerName}</p>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <PropertyOverview property={property} />
        )}

        {activeTab === 'risk' && (
          <PropertyRiskAnalyzer property={property} />
        )}

        {activeTab === 'quote' && (
          <PropertyMultiLineQuote property={property} />
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
