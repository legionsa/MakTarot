// src/components/ReadingModal.tsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import html2canvas from 'html2canvas'

interface ReadingModalProps {
  selectedIds: number[]
  onClose: () => void
}

// Full list of filenames in public/tarot, in the same order 0–21
const FILE_NAMES = [
  'The_Fool.png',
  'The_Magician.png',
  'The_Priestess.png',
  'The_Empress.png',
  'The_Emperor.png',
  'The_Hierophant.png',
  'The_Lovers.png',
  'The_Chariot.png',
  'Justice.png',
  'The_Hermit.png',
  'Wheel_of_Fortune.png',
  'Strength.png',
  'The_Hanged_Man.png',
  'Death.png',
  'Temperance.png',
  'The_Devil.png',
  'The_Star.png',
  'The_Moon.png',
  'The_Sun.png',
  'Judgement.png',
  'The_Tower.png',
  'The_World.png',
]

// Your five positional meanings:
const POSITIONS = [
  'Where you are now',
  'What fears are holding you back',
  'Your strengths',
  'Weaknesses you need to address',
  'Your potential',
]

// Styled‐components
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Modal = styled.div`
  background: #1c023e;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    width: 90%;
  }
`

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #ffd500;
  font-size: 24px;
  cursor: pointer;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin: 16px 0;
`

const CardSlot = styled.div`
  background: #2a1b41;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`

const CardImg = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`

const Title = styled.h3`
  margin: 8px 0 4px;
  font-size: 16px;
`

const Desc = styled.p`
  font-size: 14px;
  line-height: 1.3;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`

const LinkButton = styled.a`
  padding: 8px 12px;
  background: #ffd500;
  color: black;
  border-radius: 6px;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  &:hover {
    background: #e6c200;
  }
`

export default function ReadingModal({
  selectedIds,
  onClose,
}: ReadingModalProps) {
  const [meanings, setMeanings] = useState<Record<string, string>>({})

  // Fetch all cards from tarotapi.dev and map name→meaning_up
  useEffect(() => {
    fetch('https://tarotapi.dev/api/v1/cards')
      .then(res => res.json())
      .then((data: { cards: Array<{ name: string; meaning_up: string }> }) => {
        const map: Record<string, string> = {}
        data.cards.forEach(card => {
          // API name is e.g. "The Fool"
          map[card.name] = card.meaning_up
        })
        setMeanings(map)
      })
      .catch(console.error)
  }, [])

  // Build Google Calendar link 3 months from now:
  const makeGCalLink = () => {
    const now = new Date()
    const three = new Date(now)
    three.setMonth(three.getMonth() + 3)
    const fmt = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0]
    const start = fmt(three)
    const end = fmt(new Date(three.getTime() + 60 * 60 * 1000))
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      dates: `${start}/${end}`,
      text: 'Tarot+Reading+Reminder',
      details: 'Your+three-month+tarot+reading+reminder',
    })
    return `https://calendar.google.com/calendar/render?${params}`
  }

  // Download a 9:16 PNG of the modal’s content
  const handleDownload = async () => {
    const node = document.getElementById('tarot-summary')
    if (!node) return
    const canvas = await html2canvas(node, {
      width: 720,
      height: 1280,
      scale: 2,
      backgroundColor: '#1c023e',
    })
    const img = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = img
    a.download = 'tarot_summary.png'
    a.click()
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>×</CloseBtn>

        <div id="tarot-summary">
          <h2>Your Tarot Reading</h2>
          <CardGrid>
            {selectedIds.map((id, idx) => {
              const fname = FILE_NAMES[id]
              const cardName = fname.replace('.png', '').replace(/_/g, ' ')
              return (
                <CardSlot key={id}>
                  <CardImg
                    src={`/tarot/${fname}`}
                    alt={cardName}
                  />
                  <Title>{POSITIONS[idx]}</Title>
                  <Desc>
                    {meanings[cardName] ||
                      'Loading interpretation…'}
                  </Desc>
                </CardSlot>
              )
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
          <LinkButton as="button" onClick={handleDownload}>
            Download Summary
          </LinkButton>
        </Actions>
      </Modal>
    </Overlay>
  )
}
