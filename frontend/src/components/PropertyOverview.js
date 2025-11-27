import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PropertyOverview = ({ property }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [property.id]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API}/properties/${property.id}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // If no documents exist, show default document
      setDocuments([{
        id: 'default-doc',
        name: 'PropSov1 - Cleansed SOV.xlsx',
        size: '9.9 KB',
        uploadedAt: '11/20/2025',
        status: 'completed',
        confidence: 85
      }]);
    }
  };

  const handleUploadDocument = async () => {
    setUploading(true);
    try {
      const newDoc = {
        name: `Document_${Date.now()}.pdf`,
        size: '2.5 MB'
      };
      await axios.post(`${API}/properties/${property.id}/documents`, newDoc);
      await fetchDocuments();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/properties/${property.id}/documents/${documentId}`);
      await fetchDocuments();
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const handleViewFullAssessment = () => {
    navigate(`/property/${property.id}/full-assessment`);
  };
  return (
    <div className="space-y-6" data-testid="property-overview">
      {/* Property Information Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-white uppercase mb-2">Customer ID</p>
          <p className="text-lg font-semibold text-white">{property.customerId}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">Customer Name</p>
          <p className="text-lg font-semibold text-white">{property.customerName}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">Operation</p>
          <p className="text-lg font-semibold text-white">{property.operation}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">SIC Code</p>
          <p className="text-lg font-semibold text-white">{property.sicCode}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">State</p>
          <p className="text-lg font-semibold text-white">{property.state}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">Status</p>
          <p className="text-lg font-semibold text-white capitalize">{property.status}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">Effective Date</p>
          <p className="text-lg font-semibold text-white">{property.effectiveDate}</p>
        </div>
        
        <div>
          <p className="text-xs text-white uppercase mb-2">Type</p>
          <p className="text-lg font-semibold text-white capitalize">{property.type?.replace('_', ' ')}</p>
        </div>

        <div>
          <p className="text-xs text-white uppercase mb-2">Lines of Business</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {property.lobs && property.lobs.map((lob, index) => (
              <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {lob}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Documents & AI Extraction Section */}
      <div className="mt-12 bg-blue-600 text-white p-6 rounded-t-lg">
        <h3 className="text-2xl font-bold">Documents & AI Extraction</h3>
      </div>
      <div className="bg-white p-6 rounded-b-lg">
        <Button 
          className="bg-cyan-500 hover:bg-cyan-600 text-white mb-6" 
          data-testid="upload-document-button"
          onClick={handleUploadDocument}
          disabled={uploading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>

        {documents.map((doc, index) => (
          <div key={doc.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-lg">{doc.name}</p>
                <p className="text-gray-500 text-sm">{doc.size} • Uploaded {doc.uploadedAt}</p>
                <Badge className="mt-2 bg-green-500 text-white border-0">
                  {doc.status.toUpperCase()} ({doc.confidence}% confidence)
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
                onClick={() => handleDeleteDocument(doc.id)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Assessment Section */}
      <div className="mt-8 bg-gray-800 text-white p-6 rounded-t-lg">
        <h3 className="text-2xl font-bold">Risk Assessment</h3>
      </div>
      <div className="bg-white p-8 rounded-b-lg">
        <p className="text-gray-700 mb-4">Comprehensive CAT modeling and risk analysis</p>
        
        <div className="flex items-center justify-center py-8">
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle cx="96" cy="96" r="80" stroke="#e5e7eb" strokeWidth="16" fill="none" />
              <circle cx="96" cy="96" r="80" stroke="#06b6d4" strokeWidth="16" fill="none" strokeDasharray="502.4" strokeDashoffset="251.2" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-cyan-500">48.5</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <Button 
            className="bg-cyan-500 hover:bg-cyan-600 text-white" 
            data-testid="view-full-assessment-button"
            onClick={handleViewFullAssessment}
          >
            View Full Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;
