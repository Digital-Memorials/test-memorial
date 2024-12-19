import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCondolences, addCondolence, deleteCondolence } from '../services/api';
import styled from 'styled-components';

const BookContainer = styled.div`
  display: flex;
  max-width: calc(100vw - 2rem);
  margin: 0 auto;
  min-height: 800px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

  /* Multiple horizontal lines */
  ${[...Array(30)].map((_, i) => `
    &::before {
      content: '';
      position: absolute;
      top: ${(i + 1) * 3.33}%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(0, 0, 0, ${0.03 + (i % 2) * 0.02});
      transform: translateX(${i * 0.15}px) rotate(${0.05}deg);
    }
  `)}
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
`;

const Header = styled.header`
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
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-family: 'Lora', serif;
  font-size: 0.875rem;
  color: #4A5568;
  font-weight: normal;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background: white;
  color: #4A5568;
  
  &::placeholder {
    color: #A0AEC0;
  }
  
  &:focus {
    outline: none;
    border-color: #CBD5E0;
    box-shadow: 0 0 0 2px rgba(203, 213, 224, 0.15);
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
  
  &::placeholder {
    color: #A0AEC0;
  }
  
  &:focus {
    outline: none;
    border-color: #CBD5E0;
    box-shadow: 0 0 0 2px rgba(203, 213, 224, 0.15);
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
  cursor: pointer;
  transition: all 0.2s;
  align-self: center;
  margin-top: 1rem;
  
  &:hover {
    background-color: #75593F;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 1rem;
    height: 1rem;
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
  
  &:last-child {
    border-bottom: none;
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
  display: block;
`;

const Relation = styled.span`
  color: #718096;
  font-size: 0.875rem;
  
  &::before {
    content: '•';
    margin: 0 0.5rem;
    color: #CBD5E0;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  color: #CBD5E0;
  cursor: pointer;
  transition: color 0.2s;
  margin-top: 0.5rem;
  
  &:hover {
    color: #E53E3E;
  }
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #E53E3E;
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
`;

export const Condolences: React.FC = () => {
  const [condolences, setCondolences] = useState<any[]>([]);
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadCondolences();
  }, []);

  const loadCondolences = async () => {
    try {
      const response = await getCondolences();
      setCondolences(response.data);
      setError('');
    } catch (error) {
      console.error('Error loading condolences:', error);
      setError('Failed to load condolences. Please try again later.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      await addCondolence({
        userId: user.id,
        name: user.name || 'Anonymous',
        relation,
        message
      });
      setRelation('');
      setMessage('');
      await loadCondolences();
    } catch (error) {
      console.error('Error adding condolence:', error);
      setError('Failed to add condolence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, condolenceUserId: string) => {
    if (user?.id !== condolenceUserId) return;
    try {
      await deleteCondolence(id);
      setCondolences(condolences.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting condolence:', error);
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
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <FormGroup>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                type="text"
                placeholder="Friend, Family, Colleague..."
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                disabled={isLoading}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="message">Your Message</Label>
              <TextArea
                id="message"
                placeholder="Share your condolences, memories, or words of comfort..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                required
              />
            </FormGroup>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing...' : 'Sign the Book'}
              {!isLoading && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </Button>
          </Form>
        )}

        <CondolenceList>
          {condolences.map((condolence) => (
            <CondolenceEntry key={condolence.id}>
              <Message>{condolence.message}</Message>
              <div>
                <Author>
                  {condolence.name}
                  <Relation>{condolence.relation}</Relation>
                </Author>
              </div>
              {user && user.id === condolence.userId && (
                <DeleteButton
                  onClick={() => handleDelete(condolence.id, condolence.userId)}
                  title="Delete condolence"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </DeleteButton>
              )}
            </CondolenceEntry>
          ))}
        </CondolenceList>
      </MainContent>
      <BookEdge />
    </BookContainer>
  );
}; 