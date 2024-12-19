import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCondolences, addCondolence, deleteCondolence } from '../services/api';
import styled from 'styled-components';

const BookContainer = styled.div`
  display: flex;
  max-width: calc(100vw - 2rem);
  margin: 0 auto;
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
`;

const BookEdge = styled.div`
  width: 48px;
  background-color: #FAF6F1;
  position: relative;
  overflow: hidden;
  
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
`;

const MainContent = styled.div`
  flex: 1;
  background: white;
  position: relative;
  min-width: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 4rem;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  &::before, &::after {
    content: '';
    height: 1px;
    width: 4rem;
    background: linear-gradient(to right, transparent, rgba(139, 107, 77, 0.5), transparent);
  }
  
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgba(139, 107, 77, 0.5);
  }
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
  margin: 0 auto 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Playfair Display', serif;
  font-size: 1.125rem;
  color: #2D3748;
`;

const Input = styled.input`
  padding: 1rem;
  border: 1px solid rgba(139, 107, 77, 0.2);
  border-radius: 0.5rem;
  background-color: rgba(250, 246, 241, 0.5);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: rgba(139, 107, 77, 0.4);
    box-shadow: 0 0 0 3px rgba(139, 107, 77, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid rgba(139, 107, 77, 0.2);
  border-radius: 0.5rem;
  background-color: rgba(250, 246, 241, 0.5);
  font-size: 1rem;
  min-height: 150px;
  font-family: 'Lora', serif;
  resize: vertical;
  
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
  transition: background-color 0.2s;
  align-self: center;
  
  &:hover {
    background-color: #75593F;
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
  position: relative;
  background-color: rgba(250, 246, 241, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(250, 246, 241, 0.5);
  }
`;

const QuoteIcon = styled.div`
  position: absolute;
  top: -0.75rem;
  left: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: rgba(139, 107, 77, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B6B4D;
`;

const Message = styled.blockquote`
  font-family: 'Lora', serif;
  font-size: 1.125rem;
  color: #4A5568;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  padding-left: 1rem;
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 107, 77, 0.1);
`;

const Author = styled.cite`
  font-family: 'Playfair Display', serif;
  font-size: 1.125rem;
  color: #2D3748;
  font-style: normal;
`;

const Relation = styled.p`
  font-size: 0.875rem;
  color: #8B6B4D;
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
          <Divider><span /></Divider>
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
              <QuoteIcon>
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </QuoteIcon>
              <Message>{condolence.message}</Message>
              <Footer>
                <div>
                  <Author>{condolence.name}</Author>
                  {condolence.relation && <Relation>{condolence.relation}</Relation>}
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
              </Footer>
            </CondolenceEntry>
          ))}
        </CondolenceList>
      </MainContent>
      <BookEdge />
    </BookContainer>
  );
}; 