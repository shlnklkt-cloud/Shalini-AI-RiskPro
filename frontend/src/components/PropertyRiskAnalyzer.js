import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ExposurePage from './ExposurePage';
import LimitOfLiabilitiesPage from './LimitOfLiabilitiesPage';
import WhatIfAnalysisPage from './WhatIfAnalysisPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PropertyRiskAnalyzer = ({ property }) => {
  const [activeLOB, setActiveLOB] = useState(property.lobs?.[0] || 'Property');
  const [activeSubTab, setActiveSubTab] = useState('exposure');

  const allLOBs = ['Package', 'Property', 'Auto', 'Inland Marine', 'Umbrella', 'General Liability'];
  
  // Determine if LOB is enabled for this property
  const isLOBEnabled = (lob) => {
    return property.lobs?.includes(lob);
  };

  return (
    <div className="space-y-6" data-testid="risk-analyzer">
      {/* LOB Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Line of Business</h2>
        <div className="flex flex-wrap gap-3">
          {allLOBs.map((lob) => {
            const enabled = isLOBEnabled(lob);
            return (
              <button
                key={lob}
                onClick={() => enabled && setActiveLOB(lob)}
                disabled={!enabled}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  enabled
                    ? activeLOB === lob
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                data-testid={`lob-button-${lob.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {lob}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          This property covers: <span className="font-semibold">{property.lobs?.join(', ')}</span>
        </p>
      </div>

      {/* Sub-tabs for selected LOB */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('exposure')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeSubTab === 'exposure'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              data-testid="subtab-exposure"
            >
              Exposure
            </button>
            <button
              onClick={() => setActiveSubTab('limits')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeSubTab === 'limits'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              data-testid="subtab-limits"
            >
              Limit of Liabilities
            </button>
            <button
              onClick={() => setActiveSubTab('whatif')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeSubTab === 'whatif'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              data-testid="subtab-whatif"
            >
              What-If Analysis
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeSubTab === 'exposure' && <ExposurePage propertyId={property.id} lob={activeLOB} propertyName={property.propertyName} />}
          {activeSubTab === 'limits' && <LimitOfLiabilitiesPage propertyId={property.id} lob={activeLOB} propertyName={property.propertyName} />}
          {activeSubTab === 'whatif' && <WhatIfAnalysisPage propertyId={property.id} lob={activeLOB} propertyName={property.propertyName} />}
        </div>
      </div>
    </div>
  );
};

export default PropertyRiskAnalyzer;
