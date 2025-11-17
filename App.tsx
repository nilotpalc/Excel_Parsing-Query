
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { QueryInput } from './components/QueryInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeData } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [sheetData, setSheetData] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (data: string[][], name: string) => {
    setSheetData(data);
    setFileName(name);
    setResult(null);
    setError(null);
    setQuery('');
  };

  const handleQuerySubmit = useCallback(async () => {
    if (!query.trim() || !sheetData) {
      setError('Please enter a query and upload a file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeData(query, sheetData);
      setResult(analysisResult);
    } catch (e) {
      console.error(e);
      setError('An error occurred while analyzing the data. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [query, sheetData]);
  
  const Header: React.FC = () => (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm1.5 1a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zm5 0a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zM5 9.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3zm5 0a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3z" clipRule="evenodd" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Excel Sheet Query Assistant
        </h1>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Step 1: Upload Your Excel File</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Select an .xlsx or .xls file to begin. The contents will be processed locally in your browser.</p>
            <FileUpload onFileUpload={handleFileUpload} />
            {fileName && (
              <div className="mt-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
                Successfully loaded: <strong>{fileName}</strong>
              </div>
            )}
          </div>

          {sheetData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Step 2: Ask a Question</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Enter your query below to get insights from your data.</p>
              <QueryInput
                query={query}
                setQuery={setQuery}
                onSubmit={handleQuerySubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}

          {isLoading && (
              <div className="flex justify-center items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                  <p className="ml-4 text-lg">Analyzing your data...</p>
              </div>
          )}

          {result && <ResultsDisplay result={result} />}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-xs">
          Powered by Gemini
      </footer>
    </div>
  );
};

export default App;
