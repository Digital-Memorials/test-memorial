import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories, addMemory, deleteMemory, Memory } from '../services/api';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

declare global {
  interface Document {
    webkitExitFullscreen: () => Promise<void>;
    mozCancelFullScreen: () => Promise<void>;
    msExitFullscreen: () => Promise<void>;
    webkitFullscreenElement: Element | null;
    mozFullScreenElement: Element | null;
    msFullscreenElement: Element | null;
  }

  interface HTMLElement {
    webkitRequestFullscreen: () => Promise<void>;
    mozRequestFullScreen: () => Promise<void>;
    msRequestFullscreen: () => Promise<void>;
  }
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const TitleSection = styled.div`
  margin-bottom: 4rem;
  text-align: center;
`;

const Title = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: #332F2B;
  font-weight: normal;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;

  &::before,
  &::after {
    content: '';
    height: 1px;
    width: 4rem;
    background: linear-gradient(
      to right,
      transparent,
      rgba(223, 194, 164, 0.5) 50%,
      transparent
    );
  }

  &::after {
    transform: rotate(180deg);
  }
`;

const DividerDot = styled.div`
  height: 0.375rem;
  width: 0.375rem;
  border-radius: 9999px;
  background-color: rgba(223, 194, 164, 0.5);
`;

const MemoriesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MemoryCard = styled.article`
  background: rgba(253, 252, 250, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(235, 217, 196, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100%;
  position: relative;
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 200ms);

  &:hover {
    transform: translateY(-0.25rem);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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

const MediaContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  margin-bottom: 1.5rem;
  background: linear-gradient(
    45deg,
    rgba(250, 248, 245, 0.8),
    rgba(253, 252, 250, 0.9)
  );
  overflow: hidden;
  border-radius: 0.5rem;
`;

const MessageContainer = styled.div`
  margin-top: auto;
`;

const MessageContent = styled.div`
  position: relative;
`;

const Message = styled.blockquote`
  position: relative;
  padding-left: 1.25rem;
  margin: 0 0 0.75rem 0;
  color: #666059;
  font-size: 0.9375rem;
  line-height: 1.6;
  font-style: italic;
  font-family: 'Inter', sans-serif;
  overflow: visible;
  white-space: pre-wrap;
  border-left: 2px solid rgba(102, 96, 89, 0.2);

  &::before {
    content: '"';
    position: absolute;
    left: 0.375rem;
    top: 0;
    color: rgba(102, 96, 89, 0.3);
    font-size: 1rem;
  }
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  font-size: 0.8125rem;
  color: #666059;
  border-top: 1px solid rgba(235, 217, 196, 0.2);
`;

const AuthorName = styled.cite`
  font-style: normal;
  font-weight: 600;
  color: #96714B;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
  transition: color 0.3s ease;

  ${MemoryCard}:hover & {
    color: #755738;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
`;

const Form = styled.form`
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem;
  background: rgba(253, 252, 250, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(235, 217, 196, 0.15);
  box-shadow: 
    0 1.4px 2.2px rgba(0, 0, 0, 0.02),
    0 3.3px 5.3px rgba(0, 0, 0, 0.028),
    0 6.3px 10px rgba(0, 0, 0, 0.035),
    0 12.5px 17.9px rgba(0, 0, 0, 0.042),
    0 20.8px 33.4px rgba(0, 0, 0, 0.05),
    0 40px 80px rgba(0, 0, 0, 0.07),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transform: perspective(1000px) rotateX(0.5deg) translateY(-3px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @media (max-width: 768px) {
    padding: 1.25rem;
    margin: 0 1rem;
    transform: none;
    border-radius: 0.75rem;
  }

  &:hover {
    transform: perspective(1000px) rotateX(0.5deg) translateY(-5px);
    box-shadow: 
      0 1.4px 2.2px rgba(0, 0, 0, 0.025),
      0 3.3px 5.3px rgba(0, 0, 0, 0.035),
      0 6.3px 10px rgba(0, 0, 0, 0.045),
      0 12.5px 17.9px rgba(0, 0, 0, 0.055),
      0 20.8px 33.4px rgba(0, 0, 0, 0.065),
      0 40px 80px rgba(0, 0, 0, 0.09),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset;

    @media (max-width: 768px) {
      transform: none;
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.02),
        0 4px 8px rgba(0, 0, 0, 0.02);
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(235, 217, 196, 0.3);
  border-radius: 0.75rem;
  resize: vertical;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #666059;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:focus {
    outline: none;
    border-color: rgba(139, 107, 77, 0.4);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 
      0 0 0 3px rgba(139, 107, 77, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.02);
  }

  &::placeholder {
    color: #999999;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
`;

const FileInputWrapper = styled.div`
  flex: 1;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(235, 217, 196, 0.3);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  color: #666059;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(139, 107, 77, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke: #8B6B4D;
    transition: all 0.3s ease;
  }

  &:hover svg {
    transform: translateY(-1px);
  }
`;

const HiddenFileInput = styled.input.attrs({ type: 'file' })`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;

  &:focus + ${FileInputLabel} {
    border-color: rgba(139, 107, 77, 0.4);
    box-shadow: 
      0 0 0 3px rgba(139, 107, 77, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.02);
  }
`;

const FileName = styled.span`
  margin-left: 0.5rem;
  color: #8B6B4D;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;

  @media (max-width: 768px) {
    max-width: 150px;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background-color: #8B6B4D;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 2px 4px rgba(139, 107, 77, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
  }

  &:hover {
    background-color: #75593F;
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(139, 107, 77, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(139, 107, 77, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #8B6B4D;
  cursor: pointer;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;

  ${MemoryCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: #E53E3E;
    transform: translateY(0) scale(1.1);
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 1.125rem;
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

const UploadButton = styled.button`
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
  margin: 3rem auto;
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

interface FormContainerProps {
  $isVisible: boolean;
}

const FormContainer = styled.div<FormContainerProps>`
  max-height: ${props => props.$isVisible ? '1000px' : '0'};
  opacity: ${props => props.$isVisible ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: ${props => props.$isVisible ? '6rem' : '0'};
  padding-bottom: ${props => props.$isVisible ? '3rem' : '0'};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 3rem 0;
`;

const Media = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  filter: 
    contrast(1.02)
    brightness(1.02)
    saturate(1.02);
  border-radius: 0.5rem;

  ${MemoryCard}:hover & {
    transform: scale(1.02);
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  filter: 
    contrast(1.02)
    brightness(1.02)
    saturate(1.02);
  border-radius: 0.5rem;
  z-index: 2;
  position: relative;

  &::-webkit-media-controls-panel {
    z-index: 3;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  }

  &::-webkit-media-controls {
    z-index: 3;
  }

  &::-webkit-media-controls-start-playback-button {
    z-index: 3;
  }

  ${MemoryCard}:hover & {
    transform: scale(1.02);
  }
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: transparent;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0.5rem;

  &:hover .image-controls {
    opacity: 1;
  }
`;

const ImageControls = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  border-radius: 0 0 0.5rem 0.5rem;
  z-index: 3;
`;

const ImageControlButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;

  &[title="Full screen"] {
    @media (max-width: 768px) {
      display: none;
    }
  }

  &:hover {
    background: rgba(0, 0, 0, 0.7);
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

const FullScreenImage = styled.div<{ $isFullScreen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: ${props => props.$isFullScreen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  touch-action: none;

  img {
    max-width: 100vw;
    max-height: 100vh;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    
    @media (min-width: 768px) {
      max-width: 95vw;
      max-height: 95vh;
      width: auto;
      height: auto;
    }
  }

  .image-controls {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    opacity: 1;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.75rem;
    border-radius: 0.5rem;
    backdrop-filter: blur(10px);
    
    @media (min-width: 768px) {
      bottom: 2rem;
      right: 2rem;
    }
  }
`;

const MediaWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const MemoryWall: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadMemories();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImage && event.key === 'Escape') {
        handleExitFullScreen();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleExitFullScreen();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [selectedImage]);

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add retry logic for loading memories
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const response = await getMemories();
          if (response?.data) {
            const sortedMemories = response.data.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setMemories(sortedMemories);
            break;
          }
        } catch (err) {
          attempts++;
          if (attempts === maxAttempts) {
            throw err;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    } catch (err) {
      console.error('Error loading memories:', err);
      setError('Failed to load memories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile || !message.trim() || !user) return;

    try {
      setIsLoading(true);
      setError(null);
      const memoryData = {
        userId: user.id,
        name: user.name || 'Anonymous',
        message: message.trim(),
        mediaType: mediaFile.type.startsWith('image/') ? 'image' : 'video',
        mediaUrl: URL.createObjectURL(mediaFile),
        createdAt: new Date().toISOString()
      };
      await addMemory(memoryData);
        setMessage('');
        setMediaFile(null);
      setIsFormVisible(false);
      await loadMemories();
    } catch (err) {
      console.error('Error adding memory:', err);
      setError('Failed to add memory. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteMemory(id);
      await loadMemories();
    } catch (err) {
      console.error('Error deleting memory:', err);
      setError('Failed to delete memory. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const toggleForm = () => {
    if (!user) {
      // If user is not logged in, navigate to login
      return;
    }
    setIsFormVisible(!isFormVisible);
  };

  const handleImageClick = (mediaUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedImage(mediaUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'memory-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleFullScreen = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
    // Request fullscreen on the container
    const container = document.querySelector('.fullscreen-container');
    if (container && container.requestFullscreen) {
      container.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    }
  };

  const handleExitFullScreen = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
    
    if (document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <Container>
      <TitleSection>
        <Title>Memory Wall</Title>
        <Divider>
          <DividerDot />
          <DividerDot />
          <DividerDot />
        </Divider>
      </TitleSection>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {isLoading && !memories.length ? (
        <LoadingMessage>Loading memories...</LoadingMessage>
      ) : (
        <MemoriesGrid>
          {memories.map((memory) => (
            <MemoryCard key={memory.id}>
              {user && user.id === memory.userId && (
                <DeleteButton
                  onClick={() => handleDelete(memory.id)}
                  title="Delete memory"
                  aria-label="Delete memory"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </DeleteButton>
              )}
              {memory.mediaType === 'image' ? (
                <MediaContainer>
                  <ImageContainer>
                    <Media src={memory.mediaUrl} alt="Memory" />
                    <ImageControls className="image-controls">
                      <ImageControlButton
                        onClick={() => handleDownload(memory.mediaUrl)}
                        title="Download image"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </ImageControlButton>
                      <ImageControlButton
                        onClick={() => handleFullScreen(memory.mediaUrl)}
                        title="Full screen"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                      </ImageControlButton>
                    </ImageControls>
                  </ImageContainer>
                </MediaContainer>
              ) : memory.mediaType === 'video' ? (
                <MediaContainer>
                  <Video src={memory.mediaUrl} controls />
                </MediaContainer>
              ) : null}
              <ContentContainer>
                <MessageContainer>
                  <MessageContent>
                    <Message>{memory.message}</Message>
                  </MessageContent>
                </MessageContainer>
                <AuthorSection>
                  <AuthorName>{memory.name}</AuthorName>
                </AuthorSection>
              </ContentContainer>
            </MemoryCard>
          ))}
        </MemoriesGrid>
      )}

      <ButtonContainer>
        {user ? (
          <UploadButton onClick={toggleForm}>
            {isFormVisible ? 'Close Upload Form' : 'Upload a Memory'}
          </UploadButton>
        ) : (
          <SignInButton to="/login" state={{ from: location }}>
            Sign In to Upload a Memory
          </SignInButton>
        )}
      </ButtonContainer>

      <FormContainer $isVisible={isFormVisible}>
        <Form onSubmit={handleSubmit}>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your memory..."
            required
          />
          <FormActions>
            <FileInputWrapper>
              <HiddenFileInput
              accept="image/*,video/*"
              onChange={handleFileChange}
              />
              <FileInputLabel>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {mediaFile ? (
                  <FileName>{mediaFile.name}</FileName>
                ) : (
                  'Choose image or video'
                )}
              </FileInputLabel>
            </FileInputWrapper>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Share Memory'}
            </Button>
          </FormActions>
        </Form>
      </FormContainer>

      <FullScreenImage 
        $isFullScreen={!!selectedImage} 
        onClick={handleExitFullScreen}
        className="fullscreen-container"
      >
        {selectedImage && (
          <>
            <img 
              src={selectedImage} 
              alt="Memory" 
              onClick={(e) => e.stopPropagation()} 
            />
            <ImageControls className="image-controls">
              <ImageControlButton
                onClick={() => handleDownload(selectedImage)}
                title="Download image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </ImageControlButton>
              <ImageControlButton
                onClick={handleExitFullScreen}
                title="Exit full screen"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              </ImageControlButton>
            </ImageControls>
          </>
        )}
      </FullScreenImage>
    </Container>
  );
};

export default MemoryWall; 