import html2canvas from 'html2canvas'

export const saveAsImage = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return
  
  html2canvas(element, { backgroundColor: null }).then(canvas => {
    const link = document.createElement('a')
    link.download = `tarot-reading-${Date.now()}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 1.0)
    link.click()
  })
}
