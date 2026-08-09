export const CHILDREN = {
  max: {
    id: 'max',
    name: 'Max',
    avatar: 'M',
    theme: {
      bg: '#efe2f5',
      accent: '#a8689a',
      dashed: '#d3bce6',
      shadow: 'rgba(168,104,154,.16)',
      shadowDeep: 'rgba(168,104,154,.22)',
      textMuted: '#8a5a8a',
      targetColor: '#8a6890',
    },
  },
  hendrix: {
    id: 'hendrix',
    name: 'Hendrix',
    avatar: 'H',
    theme: {
      bg: '#d8e6f5',
      accent: '#4f7099',
      dashed: '#b3cdea',
      shadow: 'rgba(90,108,132,.16)',
      shadowDeep: 'rgba(90,108,132,.22)',
      textMuted: '#4f7099',
      targetColor: '#5f7898',
    },
  },
  felix: {
    id: 'felix',
    name: 'Felix',
    avatar: 'F',
    theme: {
      bg: '#e7f0e4',
      accent: '#5b8a5c',
      dashed: '#c2dabe',
      shadow: 'rgba(91,138,92,.16)',
      shadowDeep: 'rgba(91,138,92,.22)',
      textMuted: '#4e7a4f',
      targetColor: '#6f8a6a',
    },
  },
}

export const CHILD_ORDER = ['max', 'hendrix', 'felix']

export const QUESTS = {
  morning: [
    { id: 'make-bed', icon: '🛏️', title: 'Make your bed', tickets: 2 },
    { id: 'brush-teeth', icon: '🪥', title: 'Brush teeth', tickets: 1 },
    { id: 'reading', icon: '📚', title: 'Reading — 20 mins', tickets: 3 },
    { id: 'laundry', icon: '🧺', title: 'Put away laundry', tickets: 2 },
    { id: 'set-table', icon: '🍽️', title: 'Set the table', tickets: 2 },
  ],
  afternoon: [
    { id: 'homework', icon: '📖', title: 'Do your homework', tickets: 3 },
    { id: 'tidy-room', icon: '🧹', title: 'Tidy your bedroom', tickets: 2 },
    { id: 'unpack-bag', icon: '🎒', title: 'Unpack school bag', tickets: 1 },
  ],
  evening: [
    { id: 'shower', icon: '🚿', title: 'Have a shower', tickets: 1 },
    { id: 'pack-bag', icon: '🎒', title: 'Pack school bag', tickets: 1 },
    { id: 'read-bed', icon: '📖', title: 'Read before bed', tickets: 2 },
  ],
}

export const SIDE_QUESTS = [
  { id: 'feed-dog', icon: '🐶', title: 'Feed the dog', tickets: 2, bg: '#f7d6dd', dashed: '#ecb9c5', textColor: '#b06378' },
  { id: 'dishwasher', icon: '🍽️', title: 'Empty dishwasher', tickets: 2, bg: '#fae7c4', dashed: '#e6cf9a', textColor: '#9c7a36' },
  { id: 'bins', icon: '🗑️', title: 'Take out bins', tickets: 3, bg: '#d8e6f5', dashed: '#b3cdea', textColor: '#4f7099' },
]

export const NOTICES = [
  { id: 1, text: 'After school care this afternoon! 🎒', rotation: -1, tape: 'rgba(224,160,47,.32)', tapeBorder: 'rgba(224,160,47,.5)' },
  { id: 2, text: 'Swimming today — pack your towel 🏊', rotation: 0.8, tape: 'rgba(79,156,99,.3)', tapeBorder: 'rgba(79,156,99,.5)' },
  { id: 3, text: "Grandma's here for dinner 💛", rotation: -0.5, tape: 'rgba(201,123,138,.3)', tapeBorder: 'rgba(201,123,138,.5)' },
]

export const ROUTINES = [
  { id: 'out-the-door', icon: '🏫', title: 'Out the door', target: '8:15', ampm: 'am', bg: '#e7f0e4', targetColor: '#6f8a6a', onTimeText: '#4e7a4f' },
  { id: 'ready-for-bed', icon: '🛁', title: 'Ready for bed', target: '7:30', ampm: 'pm', bg: '#d8e6f5', targetColor: '#5f7898', onTimeText: '#4f7099' },
]

export const MOODS = [
  { emoji: '😄', label: 'Amazing' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😟', label: 'Not great' },
  { emoji: '😢', label: 'Rough' },
]

export const STICKERS = [
  { id: 'cat',              emoji: '🐱', label: 'Cat',           category: 'animals' },
  { id: 'dog',              emoji: '🐶', label: 'Dog',           category: 'animals' },
  { id: 'bunny',            emoji: '🐰', label: 'Bunny',         category: 'animals' },
  { id: 'fox',              emoji: '🦊', label: 'Fox',           category: 'animals' },
  { id: 'bear',             emoji: '🐻', label: 'Bear',          category: 'animals' },
  { id: 'panda',            emoji: '🐼', label: 'Panda',         category: 'animals' },
  { id: 'koala',            emoji: '🐨', label: 'Koala',         category: 'animals' },
  { id: 'frog',             emoji: '🐸', label: 'Frog',          category: 'animals' },
  { id: 'unicorn',          emoji: '🦄', label: 'Unicorn',       category: 'animals' },
  { id: 'octopus',          emoji: '🐙', label: 'Octopus',       category: 'animals' },
  { id: 'dino',             emoji: '🦕', label: 'Dino',          category: 'animals' },
  { id: 'trex',             emoji: '🦖', label: 'T-Rex',         category: 'animals' },
  { id: 'strawberry',       emoji: '🍓', label: 'Strawberry',    category: 'treats'  },
  { id: 'pizza',            emoji: '🍕', label: 'Pizza',         category: 'treats'  },
  { id: 'icecream',         emoji: '🍦', label: 'Ice Cream',     category: 'treats'  },
  { id: 'donut',            emoji: '🍩', label: 'Donut',         category: 'treats'  },
  { id: 'cupcake',          emoji: '🧁', label: 'Cupcake',       category: 'treats'  },
  { id: 'taco',             emoji: '🌮', label: 'Taco',          category: 'treats'  },
  { id: 'star',             emoji: '⭐', label: 'Star',          category: 'magic'   },
  { id: 'sparkles',         emoji: '✨', label: 'Sparkles',      category: 'magic'   },
  { id: 'rainbow',          emoji: '🌈', label: 'Rainbow',       category: 'magic'   },
  { id: 'blossom',          emoji: '🌸', label: 'Blossom',       category: 'magic'   },
  { id: 'heart',            emoji: '💕', label: 'Heart',         category: 'magic'   },
  { id: 'balloon',          emoji: '🎈', label: 'Balloon',       category: 'magic'   },
  { id: 'fire',             emoji: '🔥', label: 'Fire',          category: 'vibes'   },
  { id: 'rocket',           emoji: '🚀', label: 'Rocket',        category: 'vibes'   },
  { id: 'soccer',           emoji: '⚽', label: 'Soccer',        category: 'vibes'   },
  { id: 'art',              emoji: '🎨', label: 'Art',           category: 'vibes'   },
  { id: 'game',             emoji: '🎮', label: 'Gaming',        category: 'vibes'   },
  { id: 'music',            emoji: '🎵', label: 'Music',         category: 'vibes'   },
  { id: 'banana-dancing',   image: true, label: 'Banana',        category: 'custom'  },
  { id: 'capybara',         image: true, label: 'Capybara',      category: 'custom'  },
  { id: 'fried-chicken',    image: true, label: 'KFC',           category: 'custom'  },
  { id: 'fries',            image: true, label: 'Fries',         category: 'custom'  },
  { id: 'mango',            image: true, label: 'Mango',         category: 'custom'  },
  { id: 'popcorn',          image: true, label: 'Popcorn',       category: 'custom'  },
  { id: 'ghost',            image: true, label: 'Ghost',         category: 'custom'  },
  { id: 'thumbtack',        image: true, label: 'Thumbtack',     category: 'custom'  },
  { id: 'gold-coin',        image: true, label: 'Gold Coin',     category: 'custom'  },
  { id: 'trex-custom',      image: true, label: 'T-Rex',         category: 'custom'  },
  { id: 'four-wheel-drive', image: true, label: '4WD',           category: 'custom'  },
  { id: 'heart-custom',     image: true, label: 'Heart',         category: 'custom'  },
  { id: 'cat-pink',         image: true, label: 'Cat',           category: 'custom'  },
  { id: 'crab',             image: true, label: 'Crab',          category: 'custom'  },
  { id: 'soccer-ball-custom', image: true, label: 'Soccer',      category: 'custom'  },
  { id: 'soccer-goalie',    image: true, label: 'Goalie',        category: 'custom'  },
  { id: 'sports-car',       image: true, label: 'Car',           category: 'custom'  },
  { id: 'star-cookie',      image: true, label: 'Star',          category: 'custom'  },
]

export const STICKER_CATEGORIES = [
  { id: 'custom',  label: '⭐ Custom'   },
  { id: 'animals', label: '🐾 Animals' },
  { id: 'treats',  label: '🍓 Treats'  },
  { id: 'magic',   label: '✨ Magic'   },
  { id: 'vibes',   label: '🔥 Vibes'   },
]

export const DEFAULT_SHOP_ITEMS = {
  max: [
    { id: 's1', icon: '🎮', title: 'Extra gaming — 1 hour', ticketPrice: 15 },
    { id: 's2', icon: '🍕', title: 'Choose Friday dinner', ticketPrice: 20 },
    { id: 's3', icon: '🎬', title: 'Movie night pick', ticketPrice: 25 },
    { id: 's4', icon: '💵', title: '$5 tuck shop money', ticketPrice: 30 },
    { id: 's5', icon: '🏄', title: 'Surfing lesson', ticketPrice: 60 },
  ],
  hendrix: [
    { id: 's1', icon: '🎮', title: 'Extra gaming — 1 hour', ticketPrice: 15 },
    { id: 's2', icon: '🍦', title: 'Ice cream trip', ticketPrice: 20 },
    { id: 's3', icon: '🏊', title: 'Extra swim session', ticketPrice: 25 },
    { id: 's4', icon: '💵', title: '$5 tuck shop money', ticketPrice: 30 },
    { id: 's5', icon: '⚽', title: 'New soccer ball', ticketPrice: 50 },
  ],
  felix: [
    { id: 's1', icon: '🎮', title: 'Extra gaming — 1 hour', ticketPrice: 15 },
    { id: 's2', icon: '🍕', title: 'Choose Friday dinner', ticketPrice: 20 },
    { id: 's3', icon: '🎨', title: 'Art supplies pack', ticketPrice: 25 },
    { id: 's4', icon: '💵', title: '$5 tuck shop money', ticketPrice: 30 },
    { id: 's5', icon: '🧸', title: 'New toy — your pick', ticketPrice: 40 },
  ],
}

export function makeInitialChildState(childId) {
  return {
    tickets: 0,
    completed: { morning: [], afternoon: [], evening: [] },
    routines: {
      'out-the-door': null,
      'ready-for-bed': null,
    },
    streak: 0,
    weekDays: [false, false, false, false, false, false, false],
    mood: null,
    voiceRecording: false,
    claimedSideQuests: [],
    shopItems: DEFAULT_SHOP_ITEMS[childId] || [],
    redemptions: [],
    suggestions: [],
    headerStickers: [],
    notePositions: [
      { id: 'note-1', x: 8,  y: 42, scale: 1, rotate: -1.5, text: 'After school care today! 🎒', color: '#fae7c4' },
      { id: 'note-2', x: 26, y: 12, scale: 1, rotate:  1.2, text: 'Swimming — pack your towel 🏊', color: '#fde8ef' },
      { id: 'note-3', x: 90, y: 40, scale: 1, rotate: -0.8, text: "Grandma's here for dinner 💛", color: '#e7f0e4' },
    ],
    disabledQuests: [],
  }
}

export function createInitialState() {
  return {
    max: {
      ...makeInitialChildState('max'),
      tickets: 3,
      completed: { morning: ['make-bed', 'brush-teeth'], afternoon: [], evening: [] },
      routines: {
        'out-the-door': { time: '8:12', onTime: true },
        'ready-for-bed': null,
      },
      streak: 5,
      weekDays: [true, true, true, true, true, false, false],
      headerStickers: [
        { id: 'unicorn', x: 12, y: 22, size: 72, rotate: -12 },
        { id: 'heart',   x: 87, y: 10, size: 68, rotate:   8 },
        { id: 'star',    x: 30, y: 80, size: 60, rotate:   5 },
      ],
    },
    hendrix: {
      ...makeInitialChildState('hendrix'),
      tickets: 1,
      completed: { morning: ['make-bed'], afternoon: [], evening: [] },
      streak: 3,
      weekDays: [true, true, true, false, false, false, false],
      headerStickers: [
        { id: 'rocket', x: 12, y: 22, size: 72, rotate: -12 },
        { id: 'soccer', x: 87, y: 10, size: 68, rotate:   8 },
        { id: 'dino',   x: 30, y: 80, size: 60, rotate:   5 },
      ],
    },
    felix: {
      ...makeInitialChildState('felix'),
      headerStickers: [
        { id: 'bunny',   x: 12, y: 22, size: 72, rotate: -12 },
        { id: 'rainbow', x: 87, y: 10, size: 68, rotate:   8 },
        { id: 'art',     x: 30, y: 80, size: 60, rotate:   5 },
      ],
    },
  }
}
