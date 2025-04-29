import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

export interface CardStackProps {
  /** array of image URLs */
  cards: string[]
  /** indexes of selected cards */
  selectedIds: number[]
  /** called when user clicks a card */
  onSelect: (idx: number) => void
  /** how many pixels each card overlaps the previous one */
  overlap?: number
}

const StackContainer = styled.div<{ overlap: number }>`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: fit-content;
  margin: 0 auto;

  > img {
    width: 208px;
    height: 360px;
    flex-shrink: 0;
    margin-left: -${p => p.overlap}px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s, box-shadow 0.2s;

    &.selected {
      transform: translateY(-20px);
      box-shadow: 0 0 24px 6px rgba(255,213,0,0.8);
    }
  }

  > img:first-child {
    margin-left: 0;
  }
`

const AnimatedImg = motion.img

const CardStack: React.FC<CardStackProps> = ({
  cards,
  selectedIds,
  onSelect,
  overlap = 160,
}) => {
  return (
    <StackContainer overlap={overlap}>
      {cards.map((src, idx) => (
        <AnimatedImg
          key={idx}
          src={src}
          alt={`card-${idx}`}
          className={selectedIds.includes(idx) ? 'selected' : ''}
          onClick={() => onSelect(idx)}
          initial={false}
          animate={{
            y: selectedIds.includes(idx) ? -20 : 0,
            boxShadow: selectedIds.includes(idx)
              ? '0px 0px 24px 6px rgba(255,213,0,0.8)'
              : '0px 4px 16px rgba(0,0,0,0.5)',
          }}
          whileHover={{ scale: 1.05 }}
        />
      ))}
    </StackContainer>
  )
}

export default CardStack
