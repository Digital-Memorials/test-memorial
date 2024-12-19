import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addCondolence, getCondolences } from '../services/api';
import { Condolence } from '../types/index';
import styled from 'styled-components';

const BookContainer = styled.div`
  display: flex;
  max-width: calc(100vw - 2rem);
  margin: 0 auto;
  min-height: 800px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #F5F1EA, #FFF);
`;

const BookSpine = styled.div`
  width: 48px;
  background-color: #D4C4B4;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(139, 107, 77, 0.4), transparent);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
  }
`;

const BookEdge = styled.div`
  width: 48px;
  background-color: #F5F1EA;
  position: relative;
  overflow: hidden;

  /* Base gradient for depth */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.05), transparent 70%);
  }

  /* Vertical lines for pages */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      to right,
      transparent,
      transparent 1px,
      rgba(0, 0, 0, 0.05) 1px,
      rgba(0, 0, 0, 0.05) 2px
    );
    background-size: 3px 100%;
  }
`;

const MainContent = styled.div`
  flex: 1;
  background: white;
  position: relative;
  min-width: 0;
  padding: 3rem 4rem;
  box-shadow: 
    inset 1px 0 2px rgba(0, 0, 0, 0.05),
    inset -1px 0 2px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #2D3748;
  margin-bottom: 1rem;
  font-weight: normal;
`;

const Subtitle = styled.p`
  font-family: 'Lora', serif;
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  max-width: 36rem;
  margin: 0 auto;
`;

const Form = styled.form`
  max-width: 36rem;
  margin: 0 auto 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(245, 241, 234, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 107, 77, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background: white;
  color: #4A5568;
  font-family: 'Lora', serif;
  
  &::placeholder {
    color: #A0AEC0;
  }
  
  &:focus {
    outline: none;
    border-color: #8B6B4D;
    box-shadow: 0 0 0 2px rgba(139, 107, 77, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  min-height: 150px;
  resize: vertical;
  background: white;
  color: #4A5568;
  font-family: 'Lora', serif;
  line-height: 1.6;
  
  &::placeholder {
    color: #A0AEC0;
  }
  
  &:focus {
    outline: none;
    border-color: #8B6B4D;
    box-shadow: 0 0 0 2px rgba(139, 107, 77, 0.1);
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background-color: #8B6B4D;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-family: 'Playfair Display', serif;
  cursor: pointer;
  transition: all 0.2s;
  align-self: center;
  
  &:hover {
    background-color: #75593F;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background-color: #CBD5E0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 1rem;
    height: 1rem;
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(2px);
  }
`;

const CondolenceList = styled.div`
  max-width: 36rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const CondolenceEntry = styled.article`
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(203, 213, 224, 0.3);
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(245, 241, 234, 0.5);
  }
`;

const Message = styled.blockquote`
  font-family: 'Lora', serif;
  font-size: 1rem;
  color: #4A5568;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
  position: relative;
  font-style: italic;
  
  &::before {
    content: '"';
    position: absolute;
    left: 0;
    top: -0.25rem;
    font-size: 2rem;
    color: #8B6B4D;
    font-family: 'Playfair Display', serif;
    opacity: 0.5;
  }
`;

const Author = styled.cite`
  font-family: 'Lora', serif;
  font-size: 0.875rem;
  color: #4A5568;
  font-style: normal;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Relation = styled.span`
  color: #718096;
  &::before {
    content: '•';
    margin-right: 0.5rem;
  }
`;

const Condolences: React.FC = () => {
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [newCondolence, setNewCondolence] = useState('');
  const [relation, setRelation] = useState('');
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
    if (!user || !newCondolence.trim() || !relation.trim()) return;

    try {
      const condolenceData = {
        text: newCondolence.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        relation: relation.trim(),
        createdAt: new Date().toISOString()
      };

      const response = await addCondolence(condolenceData);
      if (response?.data) {
        setCondolences(prev => [...prev, response.data]);
        setNewCondolence('');
        setRelation('');
      }
    } catch (error) {
      console.error('Error adding condolence:', error);
    }
  };

  return (
    <BookContainer>
      <BookSpine />
      <MainContent>
        <Header>
          <Title>Book of Condolences</Title>
          <Subtitle>
            Share your condolences, memories, and messages of support for the family in this
            digital book of remembrance.
          </Subtitle>
        </Header>

        {user && (
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="Your relationship to John (e.g., Friend, Colleague, Family)"
              required
            />
            <TextArea
              value={newCondolence}
              onChange={(e) => setNewCondolence(e.target.value)}
              placeholder="Share your condolences, memories, or words of comfort..."
              required
            />
            <Button type="submit">
              Sign the Book
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </Form>
        )}

        <CondolenceList>
          {condolences.map((condolence, index) => (
            <CondolenceEntry key={condolence.id || index}>
              <Message>{condolence.text}</Message>
              <Author>
                - {condolence.userName}
                <Relation>• {condolence.relation}</Relation>
              </Author>
            </CondolenceEntry>
          ))}
        </CondolenceList>
      </MainContent>
      <BookEdge />
    </BookContainer>
  );
};

export default Condolences; 