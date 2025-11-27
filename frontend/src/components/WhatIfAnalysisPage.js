import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WhatIfAnalysisPage = ({ propertyId, lob, propertyName }) => {
  const [whatifData, setWhatifData] = useState(null);
  const [coverages, setCoverages] = useState([]);
  const [totalPremium, setTotalPremium] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWhatIfData();
  }, [propertyId, lob]);

  const fetchWhatIfData = async () => {
    try {
      const response = await axios.get(`${API}/properties/${propertyId}/whatif/${lob}`);
      setWhatifData(response.data);
      
      // Initialize coverages with slider values
      const initialCoverages = response.data.coverages.map(coverage => {
        const limitValue = parseFloat(coverage.limit.replace('$', '').replace('M', '')) || 50;
        return {
          name: coverage.name,
          minLimit: 0,
          maxLimit: 100,
          selectedLimit: limitValue,
          deductible: 5,
          premium: calculatePremium(limitValue, 5)
        };
      });
      
      setCoverages(initialCoverages);
      calculateTotalPremium(initialCoverages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching what-if data:', error);
      setLoading(false);
    }
  };

  const calculatePremium = (limit, deductible) => {
    // Complex premium calculation: base rate × limit × deductible factor
    const baseRate = 0.025; // 2.5% base rate
    const deductibleFactor = 1 + (deductible / 100); // Higher deductible = lower premium
    const premium = (limit * baseRate) / deductibleFactor;
    return premium;
  };

  const calculateTotalPremium = (coverageList) => {
    const total = coverageList.reduce((sum, coverage) => sum + coverage.premium, 0);
    setTotalPremium(total);
  };

  const handleSliderChange = (index, value) => {
    const newCoverages = [...coverages];
    newCoverages[index].selectedLimit = value[0];
    newCoverages[index].premium = calculatePremium(value[0], newCoverages[index].deductible);
    setCoverages(newCoverages);
    calculateTotalPremium(newCoverages);
  };

  const handleSave = async (decision) => {
    setSaving(true);
    try {
      await axios.post(`${API}/properties/${propertyId}/whatif/${lob}`, {
        coverages: coverages.map(c => ({
          name: c.name,
          limit: `$${c.selectedLimit.toFixed(1)}M`,
          deductible: `$${c.deductible}M`,
          premium: `$${c.premium.toFixed(2)}M`
        })),
        totalPremium: `$${totalPremium.toFixed(2)}M`,
        decision: decision
      });
      
      alert(`Risk ${decision === 'accept' ? 'accepted' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error saving what-if analysis:', error);
      alert('Error saving analysis');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading what-if analysis...</div>;
  }

  return (
    <div className="space-y-6" data-testid="whatif-page">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{propertyName}</h3>
        <p className="text-gray-600">What-If Analysis for <span className="font-semibold">{lob}</span></p>
      </div>

      {coverages.length > 0 ? (
        <>
          <div className=\"space-y-6\">
            {coverages.map((coverage, index) => (
              <Card key={index} className=\"bg-white border-gray-200\">
                <CardContent className=\"p-6\">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{coverage.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Range: ${coverage.minLimit}M - ${coverage.maxLimit}M</span>
                      <span className="text-gray-400">|</span>
                      <span>Selected: <span className="font-semibold text-gray-900">${coverage.selectedLimit.toFixed(1)}M</span></span>
                      <span className="text-gray-400">|</span>
                      <span>Deductible: <span className="font-semibold text-gray-900">${coverage.deductible}M</span></span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Slider
                      value={[coverage.selectedLimit]}
                      min={coverage.minLimit}
                      max={coverage.maxLimit}
                      step={0.5}
                      onValueChange={(value) => handleSliderChange(index, value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>${coverage.minLimit}M</span>
                      <span>${(coverage.maxLimit / 2).toFixed(0)}M</span>
                      <span>${coverage.maxLimit}M</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Calculated Premium</span>
                    <span className="text-xl font-bold text-green-600">${coverage.premium.toFixed(2)}M</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Premium */}
          <Card className=\"bg-blue-50 border-blue-200\">
            <CardContent className=\"p-6\">
              <div className=\"flex justify-between items-center\">
                <div>
                  <h4 className=\"text-lg font-semibold text-gray-900 mb-1\">Total Premium</h4>
                  <p className=\"text-sm text-gray-600\">Sum of all coverage premiums</p>
                </div>
                <div className=\"text-right\">
                  <p className=\"text-4xl font-bold text-blue-600\">${totalPremium.toFixed(2)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className=\"flex gap-4 justify-end\">
            <Button
              onClick={() => handleSave('reject')}
              disabled={saving}
              variant=\"outline\"
              className=\"px-8 py-3 bg-white text-red-600 border-red-600 hover:bg-red-50\"
              data-testid=\"reject-risk-button\"
            >
              {saving ? 'Saving...' : 'Reject Risk'}
            </Button>
            <Button
              onClick={() => handleSave('accept')}
              disabled={saving}
              className=\"px-8 py-3 bg-green-600 hover:bg-green-700 text-white\"
              data-testid=\"accept-risk-button\"
            >
              {saving ? 'Saving...' : 'Accept Risk'}
            </Button>
          </div>
        </>
      ) : (
        <div className=\"text-center py-12 bg-gray-50 rounded-lg border border-gray-200\">
          <p className=\"text-gray-600\">No coverage data available for what-if analysis</p>
        </div>
      )}
    </div>
  );
};

export default WhatIfAnalysisPage;
