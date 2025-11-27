import React from 'react';
import { Card, CardContent } from './ui/card';

const PropertyOverview = ({ property }) => {
  return (
    <div className="space-y-6" data-testid="property-overview">
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Information</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Product</p>
              <p className="text-lg font-semibold text-gray-900">{property.product}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Customer Name</p>
              <p className="text-lg font-semibold text-gray-900">{property.customerName}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Customer ID</p>
              <p className="text-lg font-semibold text-gray-900">{property.customerId}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Effective Date</p>
              <p className="text-lg font-semibold text-gray-900">{property.effectiveDate}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">SIC Code</p>
              <p className="text-lg font-semibold text-gray-900">{property.sicCode}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Operation</p>
              <p className="text-lg font-semibold text-gray-900">{property.operation}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">State</p>
              <p className="text-lg font-semibold text-gray-900">{property.state}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{property.status}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase mb-2 font-semibold">Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{property.type?.replace('_', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lines of Business (LOB)</h2>
          
          <div className="flex flex-wrap gap-3">
            {property.lobs && property.lobs.map((lob, index) => (
              <div key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold border border-blue-200">
                {lob}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            This property is covered under {property.lobs?.length || 0} line{property.lobs?.length !== 1 ? 's' : ''} of business.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents & AI Extraction</h3>
          <p className="text-gray-700 mb-4">Upload documents for AI-powered data extraction and risk assessment.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Upload Documents
            </button>
            <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              View Extracted Data
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Assessment</h3>
          <p className="text-gray-700 mb-4">Comprehensive risk analysis is available for this property across all LOBs.</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            View Full Assessment
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyOverview;
