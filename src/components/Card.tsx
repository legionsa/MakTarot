import { motion } from 'framer-motion'

interface CardProps {
  name: string
  angle: number
  selected: boolean
  onSelect: (name: string) => void
  revealed: boolean
}

const Card = ({ name, angle, selected, onSelect, revealed }: CardProps) => {
  return (
    <motion.div
      className="card-wrapper"
      style={{
        transform: `rotate(${angle}deg) translate(250px) rotate(-${angle}deg)`,
      }}
    >
      <motion.div
        className="card"
        onClick={() => onSelect(name)}
        style={{
          width: '90px',
          height: '140px',
          backgroundImage: `url(${revealed ? `/tarot/${name}.png` : '/tarot/00card_back.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '8px',
          boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
        animate={{
          y: selected ? -30 : 0,
          scale: selected ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      />
    </motion.div>
  )
}

export default Card
