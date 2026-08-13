import makeBed from '../make_bed.png'
import brushTeeth from '../brush_teeth.png'
import brushTeethBoy from '../brush_teeth_boy.png'
import brushTeethGirl from '../brush_teeth_girl.png'
import reading from '../reading.png'
import blueStorybook from '../blue_storybook_sticker.png'
import greenStorybook from '../green_storybook_sticker.png'
import foldLaundry from '../fold_laundry.png'
import setTheTable from '../set_the_table.png'
import doHomework from '../do_homework.png'
import tidyRoomBlue from '../tidy_room_blue.png'
import tidyRoomPink from '../tidy_room_pink.png'
import packBagMint from '../pack_school_bag_mint.png'
import packBagPurple from '../pack_school_bag_purple.png'
import packBagBlue from '../pack_schoolbag_blue.png'
import bathShower1 from '../bath_shower_1.png'
import bathShower2 from '../bath_shower_2.png'
import bedtimeStories from '../bedtime_stories.png'
import bedtime from '../bedtime.png'
import feedDog from '../feed_dog.png'
import dishwasherFace from '../dishwasher_cute_face.png'
import dishwasherNoFace from '../dishwasher_no_face.png'
import binsStars from '../bins_with_stars.png'
import binsSimple from '../bins_simplified.png'
import readyToGo from '../ready_to_go.png'

// Default image for each quest/side-quest/routine ID
export const QUEST_IMAGES = {
  'make-bed': makeBed,
  'brush-teeth': brushTeeth,
  'reading': reading,
  'laundry': foldLaundry,
  'set-table': setTheTable,
  'homework': doHomework,
  'tidy-room': tidyRoomBlue,
  'unpack-bag': packBagMint,
  'shower': bathShower1,
  'pack-bag': packBagPurple,
  'read-bed': bedtimeStories,
  'feed-dog': feedDog,
  'dishwasher': dishwasherFace,
  'bins': binsStars,
  'out-the-door': readyToGo,
  'ready-for-bed': bedtime,
}

// All available images — shown in the picker so parents can swap
export const ALL_QUEST_IMAGES = [
  { key: 'make_bed',          src: makeBed,         label: 'Make bed' },
  { key: 'brush_teeth',       src: brushTeeth,      label: 'Toothbrush' },
  { key: 'brush_teeth_boy',   src: brushTeethBoy,   label: 'Teeth (boy)' },
  { key: 'brush_teeth_girl',  src: brushTeethGirl,  label: 'Teeth (girl)' },
  { key: 'reading',           src: reading,         label: 'Books' },
  { key: 'blue_storybook',    src: blueStorybook,   label: 'Storybook (blue)' },
  { key: 'green_storybook',   src: greenStorybook,  label: 'Storybook (green)' },
  { key: 'fold_laundry',      src: foldLaundry,     label: 'Laundry' },
  { key: 'set_the_table',     src: setTheTable,     label: 'Set table' },
  { key: 'do_homework',       src: doHomework,      label: 'Homework' },
  { key: 'tidy_room_blue',    src: tidyRoomBlue,    label: 'Tidy room (blue)' },
  { key: 'tidy_room_pink',    src: tidyRoomPink,    label: 'Tidy room (pink)' },
  { key: 'pack_bag_mint',     src: packBagMint,     label: 'School bag (mint)' },
  { key: 'pack_bag_purple',   src: packBagPurple,   label: 'School bag (purple)' },
  { key: 'pack_bag_blue',     src: packBagBlue,     label: 'School bag (blue)' },
  { key: 'bath_shower_1',     src: bathShower1,     label: 'Shower (1)' },
  { key: 'bath_shower_2',     src: bathShower2,     label: 'Shower (2)' },
  { key: 'bedtime_stories',   src: bedtimeStories,  label: 'Bedtime reading' },
  { key: 'bedtime',           src: bedtime,         label: 'Bedtime' },
  { key: 'feed_dog',          src: feedDog,         label: 'Feed dog' },
  { key: 'dishwasher_face',   src: dishwasherFace,  label: 'Dishwasher (face)' },
  { key: 'dishwasher_plain',  src: dishwasherNoFace,label: 'Dishwasher (plain)' },
  { key: 'bins_stars',        src: binsStars,       label: 'Bins (stars)' },
  { key: 'bins_simple',       src: binsSimple,      label: 'Bins (simple)' },
  { key: 'ready_to_go',       src: readyToGo,       label: 'Out the door' },
]

// Resolve the src for a quest — imageKey overrides the default
export function resolveQuestImage(questId, imageKey) {
  if (imageKey) {
    return ALL_QUEST_IMAGES.find(i => i.key === imageKey)?.src ?? null
  }
  return QUEST_IMAGES[questId] ?? null
}
