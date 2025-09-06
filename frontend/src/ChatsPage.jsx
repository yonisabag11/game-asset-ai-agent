import React, { useState, useEffect, useRef } from 'react';

// Configuration - Update this URL if your backend runs on a different port
const BACKEND_URL = 'http://127.0.0.1:5000';

const ChatsPage = (props) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [awaitingNewImage, setAwaitingNewImage] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Initialize with AI greeting
  useEffect(() => {
    if (!chatStarted) {
      setTimeout(() => {
        addAIMessage('Hello! I\'m your Game Asset AI Agent. What background image or game asset would you like me to create for you today?');
        setChatStarted(true);
      }, 500);
    }
  }, [chatStarted]);

  // Auto-scroll to bottom when messages change (only if user hasn't scrolled up)
  useEffect(() => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isUserScrolling]);

  // Handle scroll detection
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      setIsUserScrolling(!isAtBottom);
    }
  };

  // Scroll to bottom manually
  const scrollToBottom = () => {
    setIsUserScrolling(false);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addAIMessage = (text, image = null) => {
    const newMessage = {
      id: Date.now(),
      sender: 'AI',
      text: text,
      timestamp: new Date(),
      image: image
    };
    setMessages(msgs => [...msgs, newMessage]);
  };

  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      sender: props.user.username,
      text: text,
      timestamp: new Date()
    };
    setMessages(msgs => [...msgs, newMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    addUserMessage(input);
    const messageText = input;
    setInput('');
    setIsLoading(true);
    
    // Reset scroll state when user sends a message
    setIsUserScrolling(false);

    try {
      // Handle AI logic
      if (awaitingNewImage) {
        if (messageText.trim().toLowerCase() === 'yes') {
          addAIMessage('Great! What would you like me to create for you? You can ask for another variation of what we just made, or describe something completely new.');
          setAwaitingNewImage(false);
        } else if (messageText.trim().toLowerCase() === 'no') {
          addAIMessage('Alright! Feel free to ask me anything else or request a new image anytime.');
          setAwaitingNewImage(false);
        } else {
          // User provided a specific request instead of yes/no
          addAIMessage('Perfect! Let me work on that for you.');
          setAwaitingNewImage(false);
          // Process the new request as a normal prompt enhancement
          await enhancePrompt(messageText);
        }
      } else if (awaitingConfirmation) {
        if (messageText.trim().toLowerCase() === 'yes') {
          // Generate image
          await generateImage();
        } else if (messageText.trim().toLowerCase() === 'no') {
          addAIMessage('Please type your new request.');
          setAwaitingConfirmation(false);
        } else {
          addAIMessage("Please type 'yes' to proceed or 'no' to try again.");
        }
      } else {
        // Enhance prompt
        await enhancePrompt(messageText);
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      addAIMessage('Sorry, there was an error processing your request. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const enhancePrompt = async (messageText) => {
    try {
      const res = await fetch(`${BACKEND_URL}/enhance-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageText })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setEnhancedPrompt(data.enhanced_prompt);
      addAIMessage(`Here is an improved prompt for your asset:\n\n${data.enhanced_prompt}\n\nIs this good? Type 'yes' to proceed or 'no' to try again.`);
      setAwaitingConfirmation(true);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      addAIMessage('Sorry, there was an error enhancing your prompt. Please check that the backend server is running.');
    }
  };

  const generateImage = async () => {
    addAIMessage('Generating your image...');
    try {
      const res = await fetch(`${BACKEND_URL}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.error) {
        addAIMessage(`Sorry, there was an error generating the image: ${data.error}`);
      } else if (data.image) {
        addAIMessage('Here is your generated image!', data.image);
        // Ask if they want another image
        setTimeout(() => {
          addAIMessage('Would you like me to create another image? You can ask for:\n• Another variation of the same type\n• Something completely new\n• Or type "no" if you\'re done');
          setAwaitingNewImage(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      addAIMessage('Sorry, there was an error generating the image. Please check that the backend server is running and your API keys are configured.');
    }
    setAwaitingConfirmation(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#36393f', color: 'white', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', backgroundColor: '#2f3136', borderRight: '1px solid #202225' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #202225' }}>
          <h2 style={{ margin: 0, color: 'white' }}>Game Asset AI Agent</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{
            backgroundColor: '#5865f2',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#7289da',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              AI
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>AI Agent</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Asset Generator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #40444b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#7289da',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            AI
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>AI Game Asset Generator</div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: msg.sender === 'AI' ? '#7289da' : '#43b581',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {msg.sender === 'AI' ? 'AI' : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: msg.sender === 'AI' ? '#7289da' : '#43b581'
                  }}>
                    {msg.sender === 'AI' ? 'AI Agent' : 'You'}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.6 }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
                {msg.image && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={`data:image/png;base64,${msg.image}`} 
                      alt="Generated" 
                      style={{ 
                        maxWidth: '400px', 
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setFullscreenImage(msg.image)}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <a
                        href={`data:image/png;base64,${msg.image}`}
                        download="generated-asset.png"
                        style={{ 
                          color: '#00aff4', 
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        💾 Save Image
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#7289da',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                AI
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: '#7289da'
                  }}>
                    AI Agent
                  </span>
                </div>
                <div style={{ opacity: 0.7 }}>
                  Processing...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {isUserScrolling && (
          <button
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '100px',
              right: '30px',
              backgroundColor: '#5865f2',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              zIndex: 1000
            }}
            title="Scroll to bottom"
          >
            ↓
          </button>
        )}

        {/* Input */}
        <div style={{ 
          padding: '20px',
          borderTop: '1px solid #40444b'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            backgroundColor: '#40444b',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the game asset you want to create..."
              disabled={isLoading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#666' : '#5865f2',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fullscreen-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
            padding: '60px'
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <div style={{ 
            position: 'relative', 
            maxWidth: 'calc(100vw - 120px)', 
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={`data:image/png;base64,${fullscreenImage}`}
              alt="Fullscreen"
              style={{ 
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '20px',
              padding: '8px 16px'
            }}>
              <a
                href={`data:image/png;base64,${fullscreenImage}`}
                download="generated-asset.png"
                style={{ 
                  color: '#00aff4', 
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                💾 Save Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
