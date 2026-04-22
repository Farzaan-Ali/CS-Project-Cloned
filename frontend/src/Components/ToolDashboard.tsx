import React from 'react';
import { useSDK } from '../hooks/useSDK';

const ToolDashboard: React.FC = () => {
  const { tools, loading, error } = useSDK();

  if (loading) return <div>Initializing RCC Security Spine Connection...</div>;
  if (error) return <div style={{ color: 'red' }}>Critical Error: {error}</div>;

  return (
    <section>
      <h1>W.A.F.F.L.E. Framework SDK</h1>
      <div className="grid">
        {tools.map((tool) => (
          <article key={tool.id} className="card">
            <h3>{tool.name}</h3>
            <p>Status: <strong>{tool.status}</strong></p>
            
            {/*TypeScript knows metadata might have version or tier */}
            <div className="details">
              {tool.metadata.version && <span>v{tool.metadata.version}</span>}
              {tool.metadata.tier && <span>Tier: {tool.metadata.tier}</span>}
            </div>
            
            <small>Updated: {new Date(tool.last_updated).toLocaleDateString()}</small>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ToolDashboard;