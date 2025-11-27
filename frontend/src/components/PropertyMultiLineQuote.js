import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PropertyMultiLineQuote = ({ property }) => {
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuoteData();
  }, [property.id]);

  const fetchQuoteData = async () => {
    try {
      const response = await axios.get(`${API}/properties/${property.id}/multiline-quote`);
      setQuoteData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quote data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading multi-line quote...</div>;
  }

  return (
    <div className="space-y-6" data-testid="multiline-quote">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Multi Line Quote</h2>
        <p className="text-gray-400">Comprehensive premium summary across all lines of business</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Property Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1 font-semibold">Property Name</p>
              <p className="text-base font-semibold text-white">{property.propertyName || property.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1 font-semibold">Customer</p>
              <p className="text-base font-semibold text-white">{property.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1 font-semibold">Effective Date</p>
              <p className="text-base font-semibold text-white">{property.effectiveDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Premium Breakdown by LOB</h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Product (LOB)</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Premium</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quoteData?.items && quoteData.items.length > 0 ? (
              <>
                {quoteData.items.map((item, index) => (
                  <TableRow key={index} className="border-gray-200">
                    <TableCell className="font-medium text-gray-900">{item.product}</TableCell>
                    <TableCell className="text-gray-900 text-right font-semibold">{item.premium}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-blue-50 border-t-2 border-blue-200">
                  <TableCell className="font-bold text-gray-900 text-lg">Total Premium</TableCell>
                  <TableCell className="text-blue-600 text-right font-bold text-2xl">
                    {quoteData.totalPremium}
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                  No quote data available. Please complete What-If Analysis for each LOB first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {quoteData?.items && quoteData.items.length > 0 && (
        <Card className="bg-green-500/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                ✓
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Quote Ready</h4>
                <p className="text-gray-300 mb-4">
                  The multi-line quote has been calculated based on your What-If Analysis selections. 
                  The total premium across all {quoteData.items.length} line{quoteData.items.length !== 1 ? 's' : ''} of business is <span className="font-bold text-white">{quoteData.totalPremium}</span>.
                </p>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                    Generate Quote Document
                  </button>
                  <button className="px-6 py-2 bg-gray-800 text-green-400 border border-green-500/30 rounded-lg hover:bg-gray-700 font-medium">
                    Email Quote to Client
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyMultiLineQuote;
