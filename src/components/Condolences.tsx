import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCondolences, addCondolence, deleteCondolence } from '../services/api';
import styled from 'styled-components';

const BookContainer = styled.div`
  display: flex;
  max-width: calc(100vw - 2rem);
  margin: 0 auto;
  min-height: 800px;
`;

const BookSpine = styled.div`
  width: 48px;
  background-color: #E6D5C3;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(139, 107, 77, 0.7), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(139, 107, 77, 0.4);
  }

  /* Spine decorative lines */
  &::before {
    content: '';
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(139, 107, 77, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 32px;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(139, 107, 77, 0.2);
  }
`;

const BookEdge = styled.div`
  width: 48px;
  background-color: #FAF6F1;
  position: relative;
  overflow: hidden;

  /* Page lines */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      to right,
      transparent,
      transparent 1px,
      rgba(0, 0, 0, 0.03) 1px,
      transparent 2px
    );
    background-size: 3px 100%;
  }

  /* Horizontal page lines */
  ${[...Array(12)].map((_, i) => `
    &::after {
      content: '';
      position: absolute;
      top: ${(i + 1) * 8}%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(139, 107, 77, 0.1);
      transform: translateX(${i * 0.3}px);
      box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.02);
    }
  `)}
`;

const MainContent = styled.div`
  flex: 1;
  background: white;
  position: relative;
  min-width: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 4rem;

  /* Page corner fold effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.02) 50%);
  }

  /* Page shadow effects */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: 
      inset 6px 0 8px -4px rgba(0,0,0,0.1),
      inset -6px 0 8px -4px rgba(0,0,0,0.1),
      inset 0 6px 8px -4px rgba(0,0,0,0.1),
      inset 0 -6px 8px -4px rgba(0,0,0,0.1);
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  color: #2D3748;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.125rem;
  color: #4A5568;
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
  background: rgba(250, 246, 241, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 107, 77, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: #4A5568;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(139, 107, 77, 0.2);
  border-radius: 0.25rem;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: rgba(139, 107, 77, 0.4);
    box-shadow: 0 0 0 3px rgba(139, 107, 77, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(139, 107, 77, 0.2);
  border-radius: 0.25rem;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  background: white;
  
  &:focus {
    outline: none;
    border-color: rgba(139, 107, 77, 0.4);
    box-shadow: 0 0 0 3px rgba(139, 107, 77, 0.1);
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background-color: #8B6B4D;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  align-self: center;
  
  &:hover {
    background-color: #75593F;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const CondolenceList = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CondolenceEntry = styled.article`
  padding: 2rem;
  border-bottom: 1px solid rgba(139, 107, 77, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const Message = styled.blockquote`
  font-family: 'Lora', serif;
  font-size: 1.125rem;
  color: #4A5568;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  padding-left: 2rem;
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    left: 0;
    top: -0.5rem;
    font-size: 2.5rem;
    color: #8B6B4D;
    font-family: 'Playfair Display', serif;
  }
`;

const Author = styled.cite`
  font-family: 'Playfair Display', serif;
  font-size: 1.125rem;
  color: #2D3748;
  font-style: italic;
  display: block;
  margin-top: 0.5rem;
`;

const Relation = styled.span`
  font-size: 0.875rem;
  color: #8B6B4D;
  font-style: normal;
  &::before {
    content: '•';
    margin: 0 0.5rem;
  }
`;

const DeleteButton = styled.button`
  color: #A0AEC0;
  transition: color 0.2s;
  
  &:hover {
    color: #E53E3E;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

export const Condolences: React.FC = () => {
  const [condolences, setCondolences] = useState<any[]>([]);
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadCondolences();
  }, []);

  const loadCondolences = async () => {
    try {
      const response = await getCondolences();
      setCondolences(response.data);
    } catch (error) {
      console.error('Error loading condolences:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addCondolence({
        userId: user.id,
        name: user.name || 'Anonymous',
        relation,
        message
      });
      setRelation('');
      setMessage('');
      loadCondolences();
    } catch (error) {
      console.error('Error adding condolence:', error);
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
            <FormGroup>
              <Label>Relationship</Label>
              <Input
                type="text"
                placeholder="Friend, Family, Colleague..."
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Your Message</Label>
              <TextArea
                placeholder="Share your condolences, memories, or words of comfort..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </FormGroup>
            <Button type="submit">
              Sign the Book
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
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