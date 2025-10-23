import { useState, useEffect } from 'react';
import { SolutionList } from './components/SolutionList';
import { ValidationResults } from './components/ValidationResults';
import { Solution, SolutionValidationResult } from './types';
import { mockSolutions, mockValidateResult } from './api';
import './App.css';

function App() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<SolutionValidationResult | null>(null);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load solutions on mount
  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    setLoadingSolutions(true);
    setError(null);

    try {
      // In production, this would call: const data = await fetchSolutions();
      // For demo, we use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setSolutions(mockSolutions);
    } catch (err) {
      setError('Failed to load solutions');
      console.error(err);
    } finally {
      setLoadingSolutions(false);
    }
  };

  const handleSelectSolution = (solutionId: string) => {
    setSelectedSolutionId(solutionId);
    setValidationResult(null); // Clear previous results
  };

  const handleRunValidation = async () => {
    if (!selectedSolutionId) {
      return;
    }

    setValidating(true);
    setError(null);

    try {
      // In production, this would call: const result = await validateSolution(selectedSolutionId);
      // For demo, we use mock data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const result = mockValidateResult(selectedSolutionId);
      setValidationResult(result);
    } catch (err) {
      setError('Failed to validate solution');
      console.error(err);
    } finally {
      setValidating(false);
    }
  };

  const selectedSolution = solutions.find(s => s.solutionid === selectedSolutionId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dataverse Solution Checker</h1>
        <p>Validate your Dataverse solutions for quality and best practices</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="app-content">
        <aside className="sidebar">
          <SolutionList
            solutions={solutions}
            selectedSolutionId={selectedSolutionId}
            onSelectSolution={handleSelectSolution}
            loading={loadingSolutions}
          />
        </aside>

        <main className="main-content">
          {selectedSolution && (
            <div className="action-bar">
              <div className="selected-solution-info">
                <h3>{selectedSolution.friendlyname}</h3>
                <span className="solution-version">v{selectedSolution.version}</span>
              </div>
              <button
                className="btn-primary"
                onClick={handleRunValidation}
                disabled={validating}
              >
                {validating ? 'Running Validation...' : 'Run Validation'}
              </button>
            </div>
          )}

          <ValidationResults
            result={validationResult}
            loading={validating}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
