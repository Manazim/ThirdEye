import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Stream = () => {
    const [videoSrc, setVideoSrc] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const [message, setMessage] = useState(''); // Message state
    const navigate = useNavigate();

    // Function to start streaming
    const startStream = async () => {
        setLoading(true); // Show loading animation
        setMessage(''); // Clear previous message
        try {
            await axios.post('####################', {}, {
                headers: { 
                  Authorization: `Bearer ${localStorage.getItem('token')}` 
                }
              });
            setVideoSrc('http://thirdeyestream.share.zrok.io/video_feed');
            setStreaming(true);
            setMessage('Streaming started successfully!'); // Success message
        } catch (error) {
            setMessage('Error starting stream. Please try again.'); // Error message
        } finally {
            setLoading(false); // Hide loading animation
        }
    };

    // Function to stop streaming
    const stopStream = async () => {
        setLoading(true); // Show loading animation
        setMessage(''); // Clear previous message
        try {
            await axios.post('http://thirdeyestream.share.zrok.io/stop_stream');
            setStreaming(false);
            setVideoSrc('');
            setMessage('Streaming stopped successfully!'); // Success message
        } catch (error) {
            setMessage('Error stopping stream. Please try again.'); // Error message
        } finally {
            setLoading(false); // Hide loading animation
        }
    };

    return (
        <div className="app-container">
            <div className="header-container">
                <div className="back-icon" onClick={() => navigate('/Home')}>
                    <i className="fas fa-home back-icon-inner"></i>
                    <span className="back-text">Back to Home</span>
                </div>
                <h1
                    style={{
                        color: 'beige',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                        fontFamily: 'Orbitron',
                    }}
                >
Video Stream                </h1>
            </div>

            <div style={styles.buttonContainer}>
                <button
                    style={styles.streamButton}
                    onClick={startStream}
                    disabled={streaming || loading}
                >
                    {loading ? 'Starting Stream...' : 'Start Stream'}
                </button>
                <button
                    style={styles.streamButton}
                    onClick={stopStream}
                    disabled={!streaming || loading}
                >
                    {loading ? 'Stopping Stream...' : 'Stop Stream'}
                </button>
            </div>

            {message && <div style={styles.message}>{message}</div>} {/* Display message */}

            <div style={styles.videoFrame}>
                {streaming && (
                    <img
                        id="videoFeed"
                        src={videoSrc}
                        alt="Video feed will appear here"
                        style={styles.videoFeed}
                    />
                )}
            </div>
        </div>
    );
};

const styles = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a', // Dark background
        fontFamily: 'Arial, sans-serif',
    },
    headerContainer: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    backIcon: {
        cursor: 'pointer',
        fontSize: '18px',
        color: '#beige',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
    },
    backIconInner: {
        fontSize: '18px',
        color: '#beige',
    },
    backText: {
        marginLeft: '5px',
        fontSize: '14px',
        color: '#beige',
    },
    headerText: {
        color: 'beige',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        fontFamily: 'Orbitron',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px',
    },
    streamButton: {
        padding: '12px 24px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '50px',
        margin: '0 15px',
        transition: 'all 0.3s ease',
        backgroundColor: '#3f51b5',
        color: 'white',
        boxShadow: '0 0 10px rgba(63, 81, 181, 0.8)',
    },
    streamButtonDisabled: {
        backgroundColor: '#888',
        cursor: 'not-allowed',
    },
    buttonHover: {
        backgroundColor: '#5c6bc0',
        boxShadow: '0 0 20px rgba(63, 81, 181, 1)',
    },
    videoFrame: {
        width: '80%',
        height: '450px',
        border: '4px solid #3f51b5',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '40px', // Adjust the value to move it left
    },
    videoFeed: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    message: {
        color: '#ffcc00',
        fontSize: '18px',
        marginTop: '20px',
        textAlign: 'center',
    },
};

export default Stream;
