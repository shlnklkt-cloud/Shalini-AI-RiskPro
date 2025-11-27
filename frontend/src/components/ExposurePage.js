import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExposurePage = ({ propertyId, lob, propertyName }) => {
  const [exposure, setExposure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExposure();
  }, [propertyId, lob]);

  const fetchExposure = async () => {
    try {
      const response = await axios.get(`${API}/properties/${propertyId}/exposure/${lob}`);
      setExposure(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exposure:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading exposure data...</div>;
  }

  return (
    <div className="space-y-6" data-testid="exposure-page">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">{propertyName}</h3>
        <p className="text-gray-400">Exposure details for <span className="font-semibold text-white">{lob}</span></p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-500/20 border-blue-500/30">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2 font-semibold">2024 Total Insurable Value</p>
            <p className="text-3xl font-bold text-white">{exposure?.totalInsurableValue2024 || '$0M'}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/20 border-green-500/30">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2 font-semibold">2025 Total Insurable Value</p>
            <p className="text-3xl font-bold text-white">{exposure?.totalInsurableValue2025 || '$0M'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Exposure Breakdown */}
      <div>
        <h4 className="text-xl font-bold text-white mb-4">Exposure Breakdown (2025)</h4>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Coverage</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Limits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exposure?.coverages && exposure.coverages.length > 0 ? (
                exposure.coverages.map((coverage, index) => (
                  <TableRow key={index} className="border-gray-200">
                    <TableCell className="font-medium text-gray-900">{coverage.name}</TableCell>
                    <TableCell className="text-gray-900 text-right font-semibold">{coverage.limit}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                    No exposure data available for this LOB
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ExposurePage;