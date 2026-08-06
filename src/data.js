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

export function makeInitialChildState() {
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
  }
}

export function createInitialState() {
  return {
    max: {
      ...makeInitialChildState(),
      tickets: 3,
      completed: { morning: ['make-bed', 'brush-teeth'], afternoon: [], evening: [] },
      routines: {
        'out-the-door': { time: '8:12', onTime: true },
        'ready-for-bed': null,
      },
      streak: 5,
      weekDays: [true, true, true, true, true, false, false],
    },
    hendrix: {
      ...makeInitialChildState(),
      tickets: 1,
      completed: { morning: ['make-bed'], afternoon: [], evening: [] },
      streak: 3,
      weekDays: [true, true, true, false, false, false, false],
    },
    felix: {
      ...makeInitialChildState(),
    },
  }
}
