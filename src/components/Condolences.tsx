import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addCondolence, getCondolences, deleteCondolence } from '../services/api';
import { Condolence } from '../types/index';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

const BookContainer = styled.div`
  display: flex;
  max-width: calc(100vw - 2rem);
  margin: 3rem auto;
  min-height: 800px;
  position: relative;
  box-shadow: 
    0 4px 40px -15px rgba(50, 50, 93, 0.05),
    0 2px 10px -3px rgba(0, 0, 0, 0.05),
    0 -10px 20px -8px rgba(0, 0, 0, 0.08),
    0 10px 20px -8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(to right, #F8F5F0, #FFF);
  border-radius: 12px;
  overflow: hidden;
  transform: perspective(2000px) rotateX(1deg);
  transform-origin: center center;

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: auto;
    transform: none;
    margin: 1rem auto;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to bottom, 
      rgba(0, 0, 0, 0.04) 0%,
      rgba(0, 0, 0, 0.02) 40%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to top, 
      rgba(0, 0, 0, 0.04) 0%,
      rgba(0, 0, 0, 0.02) 40%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const BookSpine = styled.div`
  width: 48px;
  background-color: #E5DCD0;
  position: relative;
  transform: perspective(2000px) rotateY(-12deg);
  transform-origin: right center;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 24px;
    transform: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      ${props => props.theme.mediaQuery?.isMobile 
        ? 'to bottom'
        : 'to right'}, 
      rgba(139, 107, 77, 0.2), 
      transparent
    );
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);

    @media (max-width: 768px) {
      width: 100%;
      height: 4px;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), transparent);
    }
  }
`;

const BookEdge = styled.div`
  width: 48px;
  background-color: #F8F5F0;
  position: relative;
  overflow: hidden;
  transform: perspective(2000px) rotateY(12deg);
  transform-origin: left center;

  @media (max-width: 768px) {
    width: 100%;
    height: 24px;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      ${props => props.theme.mediaQuery?.isMobile 
        ? 'to bottom'
        : 'to right'}, 
      rgba(0, 0, 0, 0.05), 
      transparent 70%
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      ${props => props.theme.mediaQuery?.isMobile 
        ? 'to bottom'
        : 'to right'},
      transparent,
      transparent 1px,
      rgba(0, 0, 0, 0.03) 1px,
      rgba(0, 0, 0, 0.03) 2px
    );
    background-size: ${props => props.theme.mediaQuery?.isMobile 
      ? '100% 3px'
      : '3px 100%'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  background: #FFFBF6;
  position: relative;
  min-width: 0;
  padding: 6rem 3rem;
  box-shadow: 
    inset 1px 0 1px rgba(0, 0, 0, 0.03),
    inset -1px 0 1px rgba(0, 0, 0, 0.03);

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1rem 0;
  }
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(139, 107, 77, 0.3) 20%,
      rgba(139, 107, 77, 0.3) 80%,
      transparent
    );

    @media (max-width: 768px) {
      width: 120px;
    }
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
  }
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  color: #2D3748;
  margin-bottom: 1.5rem;
  font-weight: normal;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.125rem;
  color: #666;
  line-height: 1.6;
  max-width: 42rem;
  margin: 0 auto;
  font-style: italic;
`;

const FormSection = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-family: 'Lora', serif;
  font-size: 1.125rem;
  color: #2D3748;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  width: 100%;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  &:first-of-type {
    width: 50%;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;

const inputStyles = `
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(139, 107, 77, 0.15);
  border-radius: 12px;
  font-size: 1.125rem;
  background: white;
  color: #2D3748;
  font-family: 'Lora', serif;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #A0AEC0;
    font-size: 1.125rem;
    font-style: italic;
  }
  
  &:focus {
    outline: none;
    border-color: rgba(139, 107, 77, 0.3);
    box-shadow: 0 0 0 3px rgba(139, 107, 77, 0.1);
  }
`;

const Input = styled.input`
  ${inputStyles}
  height: 4rem;
`;

const TextArea = styled.textarea`
  ${inputStyles}
  min-height: 240px;
  resize: vertical;
  line-height: 1.8;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  width: 100%;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 3rem;
  background-color: #8B6B4D;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 1.125rem;
  font-family: 'Lora', serif;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 240px;
  box-shadow: 
    0 2px 4px rgba(139, 107, 77, 0.1),
    0 0 0 1px rgba(139, 107, 77, 0.1);
  
  &:hover {
    background-color: #75593F;
    color: white;
    transform: translateY(-1px);
    box-shadow: 
      0 4px 6px rgba(139, 107, 77, 0.15),
      0 0 0 1px rgba(139, 107, 77, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    color: white;
    box-shadow: 
      0 2px 4px rgba(139, 107, 77, 0.1),
      0 0 0 1px rgba(139, 107, 77, 0.1);
  }

  &:disabled {
    background-color: #CBD5E0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    color: white;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 2;
  }
`;

const CondolenceList = styled.div`
  max-width: 64rem;
  margin: 6rem auto 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 2rem;

  @media (max-width: 768px) {
    margin: 3rem auto 0;
    padding: 0 1rem;
    gap: 1.5rem;
  }
`;

const CondolenceCard = styled.article`
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 200ms);
  transform: translateY(1rem);
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardContent = styled.div`
  position: relative;
  background: rgba(253, 252, 250, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(235, 217, 196, 0.1);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  &:hover {
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 3rem;
    height: 3rem;
    overflow: hidden;
    opacity: 0.3;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 2rem;
    background: linear-gradient(to bottom, rgba(235, 217, 196, 0.3), transparent);
    transform: rotate(45deg) translateX(1rem);
  }
`;

const QuoteIcon = styled.div`
  position: absolute;
  top: -0.75rem;
  left: -0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: linear-gradient(135deg, #DFC2A4, #F5EDE6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  svg {
    width: 1rem;
    height: 1rem;
    color: #8B6B4D;
  }
`;

const CondolenceMessage = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1.5rem;
  border-left: 2px solid rgba(139, 107, 77, 0.2);
`;

const MessageText = styled.blockquote`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.125rem;
  color: #4A4541;
  line-height: 1.6;
  font-style: italic;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const CardFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(235, 217, 196, 0.2);
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const AuthorNameText = styled.cite`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.125rem;
  color: #332F2B;
  font-style: normal;
  font-weight: 600;
`;

const RelationText = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.875rem;
  color: #8B6B4D;
  margin: 0;
`;

const CardDeleteButton = styled.button`
  color: #A8A29E;
  transition: color 0.2s ease;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.3s ease;

  ${CardContent}:hover & {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    color: #EF4444;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const SignInPrompt = styled.div`
  max-width: 600px;
  margin: 0 auto 3rem;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 
    0 4px 40px -15px rgba(50, 50, 93, 0.05),
    0 2px 10px -3px rgba(0, 0, 0, 0.05);
`;

const PromptText = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.25rem;
  color: #4A5568;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const SignInButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 3rem;
  background-color: #8B6B4D;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 1.125rem;
  font-family: 'Lora', serif;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  min-width: 240px;
  box-shadow: 
    0 2px 4px rgba(139, 107, 77, 0.1),
    0 0 0 1px rgba(139, 107, 77, 0.1);
  
  &:hover {
    background-color: #75593F;
    color: white;
    transform: translateY(-1px);
    box-shadow: 
      0 4px 6px rgba(139, 107, 77, 0.15),
      0 0 0 1px rgba(139, 107, 77, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    color: white;
    box-shadow: 
      0 2px 4px rgba(139, 107, 77, 0.1),
      0 0 0 1px rgba(139, 107, 77, 0.1);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 2;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #E53E3E;
  padding: 1rem 1.5rem;
  background: rgba(229, 62, 62, 0.1);
  border-radius: 12px;
  margin-bottom: 2rem;
  font-size: 1rem;
  max-width: 42rem;
  margin: 0 auto 2rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 1.125rem;
`;

const Condolences: React.FC = () => {
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [newCondolence, setNewCondolence] = useState('');
  const [relation, setRelation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    loadCondolences();
  }, []);

  const loadCondolences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add retry logic for loading condolences
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const response = await getCondolences();
          if (response?.data) {
            const sortedCondolences = response.data.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setCondolences(sortedCondolences);
            break;
          }
        } catch (err) {
          attempts++;
          if (attempts === maxAttempts) {
            throw err;
          }
        }
      }
    } catch (error) {
      console.error('Error loading condolences:', error);
      setError('Failed to load condolences. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCondolence.trim() || !relation.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Add retry logic for submitting condolences
      let attempts = 0;
      const maxAttempts = 3;
      
      const condolenceData = {
        text: newCondolence.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        relation: relation.trim(),
        createdAt: new Date().toISOString()
      };

      while (attempts < maxAttempts) {
        try {
          const response = await addCondolence(condolenceData);
          if (response?.data) {
            setCondolences(prev => [response.data, ...prev]);
            setNewCondolence('');
            setRelation('');
            await loadCondolences();
            break;
          }
        } catch (err) {
          attempts++;
          if (attempts === maxAttempts) {
            throw err;
          }
        }
      }
    } catch (error) {
      console.error('Error adding condolence:', error);
      setError('Failed to add condolence. Please try again later.');
      await loadCondolences();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteCondolence(id);
      setCondolences(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting condolence:', error);
      setError('Failed to delete condolence. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookContainer>
      <BookSpine />
      <MainContent>
        <Header>
          <Title>Book of Condolences</Title>
          <Subtitle>
            Share your condolences and messages of support in this
            digital book of remembrance.
          </Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {user ? (
          <FormSection>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel>Relationship</FormLabel>
                <Input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="Friend, Family, Colleague..."
                  required
                  disabled={isLoading}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Your Message</FormLabel>
                <TextArea
                  value={newCondolence}
                  onChange={(e) => setNewCondolence(e.target.value)}
                  placeholder="Share your condolences, memories, or words of comfort..."
                  required
                  disabled={isLoading}
                />
              </FormGroup>
              <ButtonContainer>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing...' : 'Sign the Book'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </ButtonContainer>
            </Form>
          </FormSection>
        ) : (
          <SignInPrompt>
            <PromptText>
              Sign in to share your condolences and messages of support with the family.
            </PromptText>
            <SignInButton to="/login" state={{ from: location }}>
              Sign In to Share
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </SignInButton>
          </SignInPrompt>
        )}

        {isLoading && !condolences.length ? (
          <LoadingMessage>Loading messages of condolence...</LoadingMessage>
        ) : (
          <CondolenceList>
            {condolences.map((condolence, index) => (
              <CondolenceCard key={condolence.id} style={{ '--index': index } as React.CSSProperties}>
                <CardContent>
                  <QuoteIcon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </QuoteIcon>
                  <CondolenceMessage>
                    <MessageText>{condolence.text}</MessageText>
                  </CondolenceMessage>
                  <CardFooter>
                    <AuthorDetails>
                      <AuthorNameText>{condolence.userName}</AuthorNameText>
                      {condolence.relation && (
                        <RelationText>{condolence.relation}</RelationText>
                      )}
                    </AuthorDetails>
                    {user && (user.id === condolence.userId || user.isAdmin) && (
                      <CardDeleteButton
                        onClick={() => handleDelete(condolence.id)}
                        title="Delete condolence"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </CardDeleteButton>
                    )}
                  </CardFooter>
                </CardContent>
              </CondolenceCard>
            ))}
          </CondolenceList>
        )}
      </MainContent>
      <BookEdge />
    </BookContainer>
  );
};

export default Condolences; 