import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addCondolence, getCondolences } from '../services/api';
import { Condolence } from '../types/index';
import './Condolences.css';

const Condolences: React.FC = () => {
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [newCondolence, setNewCondolence] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadCondolences();
  }, []);

  const loadCondolences = async () => {
    try {
      const response = await getCondolences();
      if (response?.data) {
        setCondolences(response.data);
      }
    } catch (error) {
      console.error('Error loading condolences:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCondolence.trim()) return;

    try {
      const condolenceData = {
        text: newCondolence.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        createdAt: new Date().toISOString()
      };

      const response = await addCondolence(condolenceData);
      if (response?.data) {
        setCondolences(prev => [...prev, response.data]);
        setNewCondolence('');
      }
    } catch (error) {
      console.error('Error adding condolence:', error);
    }
  };

  return (
    <div className="condolences-container">
      <h2>Condolences</h2>
      <div className="condolences-list">
        {condolences.map((condolence, index) => (
          <div key={condolence.id || index} className="condolence-item">
            <p className="condolence-text">{condolence.text}</p>
            <p className="condolence-author">- {condolence.userName}</p>
          </div>
        ))}
      </div>
      {user && (
        <form onSubmit={handleSubmit} className="condolence-form">
          <textarea
            value={newCondolence}
            onChange={(e) => setNewCondolence(e.target.value)}
            placeholder="Write your condolence..."
            className="condolence-input"
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Condolences; 