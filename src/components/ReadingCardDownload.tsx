// src/components/ReadingCardDownload.tsx
import html2canvas from 'html2canvas';

export interface DownloadCard {
  imageUrl: string;
  name: string;
}

export interface DownloadOptions {
  /** Up to 5 cards in the order you want them laid out */
  cards: DownloadCard[];
  /** "This is my tarot card! Know your tarot now!" */
  titleText: string;
  /** "https://maktarot.vercel.com" */
  footerLinkText: string;
  /** CSS color for the 1080×1920 background. Defaults to #FFA59E */
  backgroundColor?: string;
}

export async function downloadReadingAsPNG(opts: DownloadOptions): Promise<void> {
  const {
    cards,
    titleText,
    footerLinkText,
    backgroundColor = '#FFA59E',
  } = opts;

  // 1) build off-screen container
  const container = document.createElement('div');
  container.setAttribute('data-layer', 'IG-story');
  container.className = 'IgStory';
  Object.assign(container.style, {
    width: '1080px',
    height: '1920px',
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    background: backgroundColor,
    overflow: 'hidden',
  });

  // 2) place the 5 cards with your exact rotations/sizes
  const LAYOUT = [
    { w: 460, h: 796, left: 74.85,   top: -24.97, rotate:  15 },
    { w: 462, h: 799, left: 458,     top: 151,    rotate: -30 },
    { w: 464, h: 802, left: -166,    top: 848.09, rotate: -15 },
    { w: 444, h: 768, left: 780.77,  top: 728,    rotate:  15 },
    { w: 512, h: 886, left: 244,     top: 502.62, rotate:  -6 },
  ];

  cards.forEach((card, i) => {
    const L = LAYOUT[i];
    const img = document.createElement('img');
    img.setAttribute('data-layer', `${i + 1}. ${card.name}`);
    img.className = card.name.replace(/\W+/g, '');
    Object.assign(img.style, {
      width:           `${L.w}px`,
      height:          `${L.h}px`,
      left:            `${L.left}px`,
      top:             `${L.top}px`,
      position:        'absolute',
      transform:       `rotate(${L.rotate}deg)`,
      transformOrigin: 'top left',
    });
    img.src = card.imageUrl;
    container.appendChild(img);
  });

  // 3) frame for logo + title + footer
  const frame = document.createElement('div');
  frame.setAttribute('data-layer', 'Frame 91');
  frame.className = 'Frame91';
  Object.assign(frame.style, {
    width:         '810px',
    left:          '135px',
    top:           '1588px',
    position:      'absolute',
    display:       'inline-flex',
    flexDirection: 'column',
    justifyContent:'flex-start',
    alignItems:    'center',
    gap:           '44px',
  });

  // — PNG logo at top
  const logoImg = document.createElement('img');
  logoImg.setAttribute('data-layer', 'logo');
  logoImg.className = 'Logo';
  Object.assign(logoImg.style, {
    width:    '480px',
    height:   '120px',
    display:  'block',
  });
  logoImg.src = '/tarot/logo-maktarot.png';
  frame.appendChild(logoImg);

  // — text block under logo
  const textBlock = document.createElement('div');
  textBlock.setAttribute('data-layer', 'Frame 90');
  textBlock.className = 'Frame90';
  Object.assign(textBlock.style, {
    display:       'flex',
    flexDirection: 'column',
    justifyContent:'flex-start',
    alignItems:    'center',
    gap:           '12px',
  });

  const titleDiv = document.createElement('div');
  titleDiv.setAttribute('data-layer', 'This is my tarot card! Know your tarot now!');
  titleDiv.className = 'ThisIsMyTarotCardKnowYourTarotNow';
  Object.assign(titleDiv.style, {
    color:      '#242424',
    fontSize:   '40px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
    textAlign:  'center',
    wordWrap:   'break-word',
  });
  titleDiv.textContent = titleText;

  const linkDiv = document.createElement('div');
  linkDiv.setAttribute('data-layer', 'https://maktarot.vercel.com');
  linkDiv.className = 'HttpsMaktarotVercelCom';
  Object.assign(linkDiv.style, {
    color:      '#242424',
    fontSize:   '36px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    textAlign:  'center',
    wordWrap:   'break-word',
  });
  linkDiv.textContent = footerLinkText;

  textBlock.appendChild(titleDiv);
  textBlock.appendChild(linkDiv);
  frame.appendChild(textBlock);
  container.appendChild(frame);

  document.body.appendChild(container);

  // 4) snapshot and download
  const canvas = await html2canvas(container, {
    width:           1080,
    height:          1920,
    backgroundColor,   // will fill the same background
    scale:           1,
  });

  canvas.toBlob(blob => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tarot_story.png';
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(container);
  });
}
