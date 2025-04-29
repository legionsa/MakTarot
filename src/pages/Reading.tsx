import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Loading from '../components/Loading'

interface CardData {
  name: string
  meaning_up: string
}

const Reading = () => {
  const location = useLocation()
  const { selected } = location.state as { selected: string[] }
  const [current, setCurrent] = useState(0)
  const [meanings, setMeanings] = useState<CardData[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://tarotapi.dev/api/v1/cards?ref=freepublicapis.com')
        const json = await res.json()
        const cards: CardData[] = json.cards

        const filtered = selected.map(name => {
          const originalName = name.replaceAll('_', ' ')
          return cards.find(c => c.name === originalName)
        }).filter(Boolean) as CardData[]

        setMeanings(filtered)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [selected])

  if (meanings.length === 0) return <Loading />

  const currentCard = meanings[current]

  return (
    <div>
      <h2>{currentCard.name}</h2>
      <img src={`/tarot/${selected[current]}.png`} alt={currentCard.name} style={{width:'200px', margin:'20px'}} />
      <p style={{ maxWidth: '600px', margin: 'auto' }}>{currentCard.meaning_up}</p>

      {current < meanings.length - 1 ? (
        <button onClick={() => setCurrent(current + 1)}>Next Card</button>
      ) : (
        <p><strong>End of Reading</strong></p>
      )}
    </div>
  )
}

export default Reading
