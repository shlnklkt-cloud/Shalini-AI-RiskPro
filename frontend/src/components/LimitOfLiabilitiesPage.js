import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LimitOfLiabilitiesPage = ({ propertyId, lob, propertyName }) => {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, [propertyId, lob]);

  const fetchLimits = async () => {
    try {
      const response = await axios.get(`${API}/properties/${propertyId}/limits/${lob}`);
      setLimits(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching limits:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading limit data...</div>;
  }

  return (
    <div className="space-y-6" data-testid="limits-page">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">{propertyName}</h3>
        <p className="text-gray-400">Limit of Liabilities for <span className="font-semibold text-white">{lob}</span></p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Category</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Per Occurrence Limit</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Aggregate Limit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {limits?.categories && limits.categories.length > 0 ? (
              limits.categories.map((category, index) => {
                const isNotCovered = category.perOccurrenceLimit === 'Not Covered';
                return (
                  <TableRow 
                    key={index} 
                    className={`border-gray-200 ${isNotCovered ? 'bg-red-50' : ''}`}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {category.name}
                      {isNotCovered && (
                        <span className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          Excluded
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      isNotCovered ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {category.perOccurrenceLimit}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      isNotCovered ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {category.aggregateLimit}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                  No limit data available for this LOB
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-white">Note:</span> Items marked as "Not Covered" indicate exclusions in the policy and are not covered by the company.
        </p>
      </div>
    </div>
  );
};

export default LimitOfLiabilitiesPage;