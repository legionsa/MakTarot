// src/components/ReadingModal.tsx
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { downloadReadingAsPNG } from './ReadingCardDownload';

interface ReadingModalProps {
  selectedIds: number[];
  onClose: () => void;
}

interface APICard {
  name: string;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
}

const FILE_NAMES = [
  'The_Fool.png', 'The_Magician.png', 'The_Priestess.png', 'The_Empress.png',
  'The_Emperor.png', 'The_Hierophant.png', 'The_Lovers.png', 'The_Chariot.png',
  'Justice.png', 'The_Hermit.png', 'Wheel_of_Fortune.png', 'Strength.png',
  'The_Hanged_Man.png', 'Death.png', 'Temperance.png', 'The_Devil.png',
  'The_Star.png', 'The_Moon.png', 'The_Sun.png', 'Judgement.png',
  'The_Tower.png', 'The_World.png'
];

const POSITIONS = [
  'Where you are now',
  'What fears are holding you back',
  'Your strengths',
  'Weaknesses you need to address',
  'Your potential'
];

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: #1c023e;
  color: white;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  border-radius: 12px;
  padding: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  outline: none;

  @media (max-width: 768px) {
    width: 90%;
    padding: 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 28px;
  background: none;
  border: none;
  color: #ffd500;
  cursor: pointer;

  &:focus {
    outline: 2px solid #ffd500;
  }
`;

const CardSection = styled.section`
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 64px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CardImg = styled.img`
  width: 180px;
  border-radius: 8px;
`;

const CardText = styled.div`
  flex: 1;
  text-align: left;
`;

const PositionTitle = styled.h2`
  font-size: 22px;
  color: #ffd500;
  margin-bottom: 12px;
`;

const CardName = styled.h3`
  font-size: 26px;
  font-family: 'Instrument Serif', serif;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 15px;
  margin-bottom: 16px;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const ActionButton = styled.a`
  padding: 10px 16px;
  background: #ffd500;
  color: black;
  text-decoration: none;
  font-weight: bold;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;

  &:hover {
    background: #e6c200;
  }
`;

const LiveRegion = styled.div.attrs({ role: 'status', 'aria-live': 'polite' })`
  position: absolute;
  left: -9999px;
`;

/** Turn “The Lovers” → “The_Lovers.png” */
function matchFilename(name: string): string {
  const key = name.toLowerCase();
  return (
    FILE_NAMES.find(f =>
      f.replace('.png', '').replace(/_/g, ' ').toLowerCase() === key
    ) || ''
  );
}

export default function ReadingModal({ selectedIds, onClose }: ReadingModalProps) {
  const [cards, setCards] = useState<APICard[]>([]);
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // Fetch & shuffle N major‐arcana cards
  useEffect(() => {
    fetch('https://tarotapi.dev/api/v1/cards')
      .then(res => res.json())
      .then(({ cards: all }: { cards: APICard[] }) => {
        const filtered = all.filter(c =>
          FILE_NAMES.some(f =>
            f.replace('.png','').replace(/_/g,' ').toLowerCase() === c.name.toLowerCase()
          )
        );
        const shuffled = filtered.sort(() => Math.random() - 0.5)
                                 .slice(0, selectedIds.length);
        setCards(shuffled);
        setTimeout(() => {
          if (liveRef.current) liveRef.current.textContent = 'Reading loaded';
        }, 300);
      })
      .catch(() => {
        if (liveRef.current) liveRef.current.textContent = 'Failed to load reading';
      })
      .finally(() => setLoading(false));
  }, [selectedIds.length]);

  // focus trap + Escape to close
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => void window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Build Google Calendar “Add reminder” link
  const makeGCalLink = () => {
    const now = new Date();
    const three = new Date(now);
    three.setMonth(now.getMonth() + 3);

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0];
    const dates = `${fmt(three)}/${fmt(new Date(three.getTime() + 60*60*1000))}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      dates,
      text: 'Tarot Reading Reminder',
      details: 'Your 3-month tarot reading reminder',
    });

    return `https://calendar.google.com/calendar/render?${params}`;
  };

  // Delegate PNG generation to our helper
  const handleDownload = () => {
    const downloadCards = cards.map(c => ({
      imageUrl: `/tarot/${matchFilename(c.name)}`,
      name: c.name,
    }));

    downloadReadingAsPNG({
      cards: downloadCards,
      titleText:      'This is my tarot card! Know your tarot now!',
      footerLinkText: 'https://maktarot.vercel.app',
      backgroundColor: '#FFA59E',
    });
  };

  return (
    <Overlay>
      <Dialog
        ref={dialogRef}
        tabIndex={-1}
        aria-labelledby="readingTitle"
        role="dialog"
        aria-modal="true"
      >
        <LiveRegion ref={liveRef} />
        <CloseButton onClick={onClose} aria-label="Close reading">×</CloseButton>
        <h1 id="readingTitle">Your Tarot Reading</h1>

        {loading ? (
          <p style={{ color: '#ffd500' }}>Loading your reading…</p>
        ) : (
          <>
            <div id="tarot-summary">
              {cards.map((card, i) => {
                const filename = matchFilename(card.name);
                return (
                  <CardSection key={i}>
                    <CardImg
                      src={`/tarot/${filename}`}
                      alt={`Tarot card illustration of ${card.name}`}
                    />
                    <CardText>
                      <PositionTitle>{POSITIONS[i]}</PositionTitle>
                      <CardName>{card.name}</CardName>
                      <Description>
                        <strong>Upright meaning:</strong> {card.meaning_up}
                      </Description>
                      <Description>
                        <strong>Reversed meaning:</strong> {card.meaning_rev}
                      </Description>
                      <Description>
                        <strong>General interpretation:</strong> {card.desc}
                      </Description>
                    </CardText>
                  </CardSection>
                );
              })}
            </div>

            <Actions>
              <ActionButton
                href={makeGCalLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add 3-Month Reminder
              </ActionButton>
              <ActionButton
  as="button"
  onClick={() =>
    downloadReadingAsPNG({
      cards: cards.map(c => ({
        imageUrl: `/tarot/${matchFilename(c.name)}`,
        name:      c.name,
      })),
      titleText:      'This is my tarot card! Know your tarot now!',
      footerLinkText: 'https://maktarot.vercel.app',
      backgroundColor:'#FFA59E',
    })
  }
>
  Download as PNG
</ActionButton>
            </Actions>
          </>
        )}
      </Dialog>
    </Overlay>
  );
}
