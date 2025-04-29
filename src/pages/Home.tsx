// src/pages/Home.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion, useAnimation, LayoutGroup, Variants } from 'framer-motion';
import ReadingModal from '../components/ReadingModal';

// ───── tweakable ─────
const groupTop = 240;      // px from top
const groupOverlap = 460;  // px overlap between cards
const autoScrollSpeed = 8; // px/frame when hovering edge
// ──────────────────────

const HomeContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: visible;
  position: relative;
  background: radial-gradient(
    ellipse at center,
    #342e38 0%,
    #30203e 39%,
    #1c0243 100%
  );
  padding-top: 24px;
`;

const Heading = styled.h1`
  color: #ffd500;
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  text-align: center;
  margin: 0;
`;

const SubHeading = styled.h2`
  color: white;
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  text-align: center;
  margin: 4px 0 16px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 20;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #ffd500;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background: #e6c200;
  }
`;

/* glow keyframes for final 5 */
const glow = keyframes`
  0%,100% { box-shadow: 0 0 24px 4px rgba(255,213,0,0.8); }
  50%    { box-shadow: 0 0 32px 8px rgba(255,213,0,1); }
`;

/* strips & scroll */
const StripWrapper = styled.div`
  position: absolute;
  top: ${groupTop}px;
  left: 0;
  width: 100vw;
  height: 420px;
  overflow-x: hidden;
  overflow-y: visible;
`;
const ScrollContainer = styled.div`
  width: 100%;
  height: 420px;
  overflow-x: auto;
  overflow-y: visible;
  cursor: grab;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

interface CardGroupProps { center: boolean }
const CardGroup = styled(motion.div)<CardGroupProps>`
  display: flex;
  align-items: flex-end;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
  gap: -${groupOverlap}px;
  height: 420px;
  user-select: none;
`;

const EdgeZone = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  top: ${groupTop}px;
  width: 15%;
  height: 380px;
  ${({ side }) => (side === 'left' ? 'left: 0;' : 'right: 0;')}
  z-index: 10;
`;

/* card backs */
const CardBack = styled(motion.img)<{ selected: boolean; glowOn: boolean }>`
  width: 208px;
  height: 360px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: ${({ selected }) =>
    selected
      ? '0 0 24px 4px rgba(255,213,0,0.8)'
      : '0 4px 16px rgba(0,0,0,0.5)'};
  z-index: ${({ selected }) => (selected ? 100 : 1)};
  ${({ glowOn }) =>
    glowOn &&
    css`
      animation: ${glow} 1s infinite;
    `}
`;

/* simple IDs 0–21 */
const defaultCards = Array.from({ length: 22 }, (_, i) => i);

/* variants for the shuffle wiggle (only x & rotate!) */
const groupVariants: Variants = {
  shuffle: { transition: { staggerChildren: 0.03 } }
};
const cardVariants: Variants = {
  shuffle: (i: number) => ({
    x: [0, (Math.random() - 0.5) * 30, 0],
    rotate: [0, (Math.random() - 0.5) * 20, 0],
    transition: { duration: 0.5 }
  })
};

const Home: React.FC = () => {
  const [cards, setCards] = useState(defaultCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const controls = useAnimation();

  // refs for swipe/drag & edge hover
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const interval = useRef<number | null>(null);

  /* edge hover */
  const startAutoScroll = (dir: 'left' | 'right') => {
    if (interval.current) return;
    interval.current = window.setInterval(() => {
      if (scrollRef.current)
        scrollRef.current.scrollLeft +=
          dir === 'left' ? -autoScrollSpeed : autoScrollSpeed;
    }, 16);
  };
  const stopAutoScroll = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };
  useEffect(() => () => stopAutoScroll(), []);

  /* pointer drag */
  const onPointerDown = (e: React.PointerEvent) => {
    isDown.current = true;
    startX.current = e.clientX;
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const onPointerUp = () => { isDown.current = false; };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollLeft.current - (e.clientX - startX.current);
  };

  /* select/deselect */
  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev
    );
  };

  /* shuffle + wiggle */
  const shuffle = async () => {
    await controls.start('shuffle');
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setSelected([]);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelected([]);
    setCards([...defaultCards].sort(() => Math.random() - 0.5));
  };

  const headingText =
    selected.length === 0
      ? 'Reflect on your life situation right now'
      : `Select ${5 - selected.length} more card(s)`;

  const allChosen = selected.length === 5;

  return (
    <HomeContainer
      as="main"
      role="main"
      aria-label="Tarot card selection area"
    >
      <Heading>MakTarot</Heading>
      <SubHeading aria-live="polite">{headingText}</SubHeading>

      <Controls>
        {!allChosen && (
          <Button onClick={shuffle}>Shuffle Cards</Button>
        )}
        {allChosen && (
          <Button onClick={() => setShowModal(true)}>
            Read Your Cards
          </Button>
        )}
      </Controls>

      <EdgeZone
        side="left"
        onMouseEnter={() => startAutoScroll('left')}
        onMouseLeave={stopAutoScroll}
      />
      <EdgeZone
        side="right"
        onMouseEnter={() => startAutoScroll('right')}
        onMouseLeave={stopAutoScroll}
      />

      <StripWrapper>
        <ScrollContainer
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerUp}
          aria-label="Tarot cards carousel, use arrow keys to scroll"
          tabIndex={0}
        >
          <LayoutGroup>
            <CardGroup
              variants={groupVariants}
              animate={controls}
              center={allChosen}
            >
              {cards.map((id, i) => {
                const isSel = selected.includes(id);
                if (allChosen && !isSel) return null;
                return (
                  <CardBack
                    key={id}
                    layout
                    variants={cardVariants}
                    custom={i}
                    selected={isSel}
                    glowOn={isSel && allChosen}
                    src="/tarot/00card_back.png"
                    alt={`Tarot card back, card ${id + 1}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSel}
                    aria-label={`Card ${id + 1}, ${isSel ? 'selected' : 'not selected'}`}
                    onClick={() => toggleSelect(id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSelect(id);
                      }
                    }}
                    animate={{ y: isSel ? -20 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                );
              })}
            </CardGroup>
          </LayoutGroup>
        </ScrollContainer>
      </StripWrapper>

      {showModal && (
        <ReadingModal selectedIds={selected} onClose={handleClose} />
      )}
    </HomeContainer>
  );
};

export default Home;
