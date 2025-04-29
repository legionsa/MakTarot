import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  selectedIds: number[];
}

// filenames in `public/tarot`
const FILE_NAMES = [
  'The_Fool.png','The_Magician.png','The_Priestess.png','The_Empress.png',
  'The_Emperor.png','The_Hierophant.png','The_Lovers.png','The_Chariot.png',
  'Justice.png','The_Hermit.png','Wheel_of_Fortune.png','Strength.png',
  'The_Hanged_Man.png','Death.png','Temperance.png','The_Devil.png',
  'The_Star.png','The_Moon.png','The_Sun.png','Judgement.png',
  'The_Tower.png','The_World.png',
];

const POSITIONS = [
  'Where you are now',
  'What fears are holding you back',
  'Your strengths',
  'Weaknesses you need to address',
  'Your potential',
];

const Overlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
`;
const Modal = styled.div`
  background: #1c023e; color: white;
  border-radius: 12px; padding: 24px;
  width: 80%; max-width: 900px; max-height: 90vh;
  overflow-y: auto; position: relative;
  @media (max-width:768px){ width:90%; }
`;
const CloseBtn = styled.button`
  position: absolute; top:12px; right:12px;
  background:transparent; border:none; color:#ffd500;
  font-size:24px; cursor:pointer;
`;
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(120px,1fr));
  gap:16px; margin:16px 0;
`;
const CardSlot = styled.div`
  background:#2a1b41; border-radius:8px;
  padding:12px; text-align:center;
`;
const CardImg = styled.img`
  width:100%; height:auto; border-radius:4px;
`;
const Title = styled.h3`
  margin:8px 0 4px; font-size:16px;
`;
const Desc = styled.p`
  font-size:14px; line-height:1.3;
`;
const Actions = styled.div`
  display:flex; justify-content:flex-end; gap:12px; margin-top:16px;
`;
const LinkButton = styled.a`
  padding:8px 12px; background:#ffd500; color:black;
  border-radius:6px; text-decoration:none; font-weight:bold;
  &:hover { background:#e6c200; }
`;

interface TarotCard {
  name: string;
  image: string;
  meaning_up: string;
  meaning_rev: string;
}

export default function ReadingPage() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const selectedIds = state?.selectedIds || [];
  const [cardsData, setCardsData] = useState<Record<string, TarotCard>>({});

  // fetch once
  useEffect(() => {
    fetch('https://tarotapi.dev/api/v1/cards')
      .then(res => res.json())
      .then((list: TarotCard[]) => {
        const map: Record<string, TarotCard> = {};
        list.forEach(c => {
          map[c.name] = c;
        });
        setCardsData(map);
      });
  }, []);

  const makeGCalLink = () => {
    const now = new Date();
    const three = new Date(now);
    three.setMonth(three.getMonth() + 3);
    const fmt = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0];
    const start = fmt(three);
    const end = fmt(new Date(three.getTime() + 60 * 60 * 1000));
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      dates: `${start}/${end}`,
      text: 'Tarot+Reading+Reminder',
      details: 'Your+three-month+tarot+reading+reminder',
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const downloadPNG = async () => {
    const node = document.getElementById('tarot-summary');
    if (!node) return;
    const canvas = await html2canvas(node, {
      width: 720, height: 1280, scale: 2, backgroundColor: '#1c023e',
    });
    const img = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = img; a.download = 'tarot_summary.png'; a.click();
  };

  return (
    <Overlay>
      <Modal>
        <CloseBtn onClick={() => navigate(-1)}>←</CloseBtn>
        <div id="tarot-summary">
          <h2>Your Tarot Reading</h2>
          <CardGrid>
            {selectedIds.map((id, idx) => {
              const fname = FILE_NAMES[id];
              const title = fname.replace('.png', '').replace(/_/g, ' ');
              const card = cardsData[title];
              return (
                <CardSlot key={id}>
                  <CardImg src={`/tarot/${fname}`} alt={title} />
                  <Title>{POSITIONS[idx]}</Title>
                  <Desc>
                    {card?.meaning_up ?? 'Loading interpretation…'}
                  </Desc>
                </CardSlot>
              );
            })}
          </CardGrid>
        </div>
        <Actions>
          <LinkButton
            href={makeGCalLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Add 3-Month Reminder
          </LinkButton>
          <LinkButton as="button" onClick={downloadPNG}>
            Download Summary
          </LinkButton>
        </Actions>
      </Modal>
    </Overlay>
  );
}
