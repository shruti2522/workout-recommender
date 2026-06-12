import React, { useState, useEffect } from 'react';
import Chat from './Chat/Chat';
import '../../App.css';

export default function HeroPage({ onComplete }) {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    
    const fetchImage = async () => {
      try {
        
        const searchTerms = ['fitness', 'workout', 'gym', 'exercise', 'training', 'athlete'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        const randomPage = Math.floor(Math.random() * 5) + 1; 
        
        const response = await fetch(
          `https://www.pexels.com/api/v2/search?query=${randomTerm}&per_page=1&page=${randomPage}`,
          {
            headers: {
              'Authorization': 'dummy' 
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            
            const imageUrl = data.photos[0].src.large2x || data.photos[0].src.large;
            setBgImage(imageUrl);
            return;
          }
        }
      } catch (error) {
        console.log('Failed to fetch, using fallback');
      }

      
      const fallbackImages = [
        'https://images.pexels.com/photos/4327019/pexels-photo-4327019.jpeg?auto=compress&cs=tinysrgb&w=1000',
        'https://images.pexels.com/photos/4720256/pexels-photo-4720256.jpeg?auto=compress&cs=tinysrgb&w=1000',
		'https://images.pexels.com/photos/703010/pexels-photo-703010.jpeg?auto=compress&cs=tinysrgb&w=1000',
		'https://images.pexels.com/photos/3775526/pexels-photo-3775526.jpeg?auto=compress&cs=tinysrgb&w=1000',
      ];
      
      const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
      setBgImage(randomImage);
    };

    fetchImage();
  }, []);

  return (
    <div className="hero2-root">
      <div 
        className="hero2-copy" 
        style={{ 
          backgroundImage: bgImage ? `url('${bgImage}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="hero2-copy-overlay">
          <div className="hero-logo">
            <span className="hero-logo-icon">T</span>
            <span className="hero-logo-text">Trainr</span>
          </div>
          <h1 className="hero2-heading">
            A workout built<br />
            around <em>you.</em><br />
            In seconds.
          </h1>
          <hr className="hero2-divider" />
          <p className="hero2-body">
            Answer a few quick questions. We'll match you with a plan from 873 exercises.
          </p>
          <ul className="hero2-checklist">
            <li>
              <span className="hero2-check">✓</span>
              873 exercises, body-only to full gym
            </li>
            <li>
              <span className="hero2-check">✓</span>
              Adapts as you improve week by week
            </li>
            <li>
              <span className="hero2-check">✓</span>
              Earn points and level up your profile
            </li>
          </ul>
        </div>
      </div>
      <div className="hero2-chat-container">
        <Chat onComplete={onComplete} />
      </div>
    </div>
  );
}