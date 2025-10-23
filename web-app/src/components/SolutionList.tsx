import React from 'react';
import { Solution } from '../types';

interface SolutionListProps {
  solutions: Solution[];
  selectedSolutionId: string | null;
  onSelectSolution: (solutionId: string) => void;
  loading: boolean;
}

export const SolutionList: React.FC<SolutionListProps> = ({
  solutions,
  selectedSolutionId,
  onSelectSolution,
  loading
}) => {
  if (loading) {
    return (
      <div className="solution-list">
        <h2>Solutions</h2>
        <div className="loading">Loading solutions...</div>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="solution-list">
        <h2>Solutions</h2>
        <div className="empty">No solutions found</div>
      </div>
    );
  }

  return (
    <div className="solution-list">
      <h2>Solutions ({solutions.length})</h2>
      <div className="solution-items">
        {solutions.map((solution) => (
          <div
            key={solution.solutionid}
            className={`solution-item ${selectedSolutionId === solution.solutionid ? 'selected' : ''}`}
            onClick={() => solution.solutionid && onSelectSolution(solution.solutionid)}
          >
            <div className="solution-name">{solution.friendlyname}</div>
            <div className="solution-details">
              <span className="solution-unique-name">{solution.uniquename}</span>
              <span className="solution-version">v{solution.version}</span>
              {solution.ismanaged && <span className="solution-badge">Managed</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
