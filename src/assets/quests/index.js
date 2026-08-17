// Chore stickers
import makeBed from '../make-bed.png'
import readingPictureBooks from '../reading-picture-books.png'
import brushTeeth from '../brush-teeth.png'
import bedtimeStory from '../bedtime-story.png'
import binsToStreet from '../bins-to-street.png'
import packSchoolBag from '../pack-school-bag.png'
import packLunchbox from '../pack-lunchbox.png'
import unpackRepackDishwasher from '../unpack-repack-dishwasher.png'
import getIntoBed from '../get-into-bed.png'
import foldLaundry from '../fold-laundry.png'
import homework from '../homework.png'
import feedDog from '../feed-dog.png'
import cleanWindows from '../clean-windows.png'
import packSoccerGear from '../pack-soccer-gear.png'
import eatDinner from '../eat-dinner.png'
import setTheTable from '../set-the-table.png'
import tidyRoom from '../tidy-room.png'
import haveAShower from '../have-a-shower.png'
import haveABath from '../have-a-bath.png'
import vacuumHouse from '../vacuum-house.png'
import playWithDog from '../play-with-dog.png'
import chargeWatch from '../charge-watch.png'
import chargeIpad from '../charge-ipad.png'
import sunscreenOn from '../sunscreen-on.png'
import hatOn from '../hat-on.png'
import uniformInWashingBasket from '../uniform-in-washing-basket.png'
import toysAway from '../toys-away.png'
import pickUpDogPoo from '../pick-up-dog-poo.png'
import cleanMirrors from '../clean-mirrors.png'
import emptyTrash from '../empty-trash.png'
import walkTheDog from '../walk-the-dog.png'
import deodorantOn from '../deodorant-on.png'
import washHair from '../wash-hair.png'
import putClothesAway from '../put-clothes-away.png'
import helpUnpackGroceries from '../help-unpack-groceries.png'
import helpCookDinner from '../help-cook-dinner.png'
import exercise from '../exercise.png'
import helpInGarden from '../help-in-garden.png'
import soccerBag from '../soccer-bag.png'
import vegemiteToast from '../vegemite-toast.png'
import lunchbox2 from '../lunchbox-2.png'
import makeBed2 from '../make-bed-2.png'
import sportUniformPastel from '../sport_uniform_pastel.png'
import toothbrush from '../toothbrush.png'
import weetbix from '../weetbix.png'
import jamToast from '../jam-toast.png'
import wpsUniform from '../WPS_normal_uniform.png'
import sportUniform from '../sport_uniform.png'
import barkerNormal from '../Barker_normal.png'
import barkerSportUniform from '../Barker_sport_uniform.png'
import medicationAM from '../medication_AM.png'
import medicationNight from '../medication_night.png'
import medicationPmFifi from '../medication_pm_fifi.png'
import sportFoldedUniform from '../sport_folded_uniform.png'

// Reward stickers
import soccerTraining from '../soccer-training.png'
import soccerGame from '../soccer-game.png'
import cricketTraining from '../cricket-training.png'
import cricketGame from '../cricket-game.png'
import birthdayParty from '../birthday-party.png'
import friendOver from '../friend-over.png'
import extraScreenTime from '../extra-screen-time.png'
import movieNight from '../movie-night.png'
import specialDinner from '../special-dinner.png'
import familyGame from '../family-game.png'
import craftTime from '../craft-time.png'
import oneOnOneParentTime from '../1-1-parent-time.png'
import specialActivity from '../special-activity.png'
import extraTvTime from '../extra-tv-time.png'
import stayUpLate from '../stay-up-late.png'
import canteenLunchOrder from '../canteen-lunch-order.png'
import nintendoTime from '../nintendo-time.png'
import nintendoGame from '../nintendo-game.png'
import newClothes from '../new-clothes.png'
import newShoes from '../new-shoes.png'
import giftVoucher from '../gift-voucher.png'
import specialBreakfast from '../special-breakfast.png'
import bubbleTea from '../bubble-tea.png'
import sushi from '../sushi.png'
import tacos from '../tacos.png'
import chickenSchnitzel from '../chicken-schnitzel.png'
import fishAndChips from '../fish-and-chips.png'
import kfc from '../kfc.png'
import mcdonalds from '../mcdonalds.png'
import iceBlock from '../ice-block.png'
import iceCream from '../ice-cream.png'
import slushie from '../slushie.png'
import fruit from '../fruit.png'
import vegetables from '../vegetables.png'

// Default image for each quest ID
export const QUEST_IMAGES = {
  'make-bed': makeBed,
  'brush-teeth': brushTeeth,
  'reading': readingPictureBooks,
  'laundry': foldLaundry,
  'set-table': setTheTable,
  'homework': homework,
  'tidy-room': tidyRoom,
  'unpack-bag': packSchoolBag,
  'shower': haveAShower,
  'pack-bag': packSchoolBag,
  'read-bed': bedtimeStory,
  'feed-dog': feedDog,
  'dishwasher': unpackRepackDishwasher,
  'bins': binsToStreet,
  'out-the-door': null,
  'ready-for-bed': getIntoBed,
}

// All available images shown in the picker so parents can swap
export const ALL_QUEST_IMAGES = [
  // Chores
  { key: 'make-bed',                   src: makeBed,                  label: 'Make bed' },
  { key: 'brush-teeth',                src: brushTeeth,               label: 'Brush teeth' },
  { key: 'reading-picture-books',      src: readingPictureBooks,      label: 'Reading' },
  { key: 'bedtime-story',              src: bedtimeStory,             label: 'Bedtime story' },
  { key: 'bins-to-street',             src: binsToStreet,             label: 'Bins to street' },
  { key: 'pack-school-bag',            src: packSchoolBag,            label: 'Pack school bag' },
  { key: 'pack-lunchbox',              src: packLunchbox,             label: 'Pack lunchbox' },
  { key: 'unpack-repack-dishwasher',   src: unpackRepackDishwasher,   label: 'Dishwasher' },
  { key: 'get-into-bed',              src: getIntoBed,               label: 'Get into bed' },
  { key: 'fold-laundry',              src: foldLaundry,              label: 'Fold laundry' },
  { key: 'homework',                   src: homework,                 label: 'Homework' },
  { key: 'feed-dog',                   src: feedDog,                  label: 'Feed dog' },
  { key: 'clean-windows',              src: cleanWindows,             label: 'Clean windows' },
  { key: 'pack-soccer-gear',           src: packSoccerGear,           label: 'Pack soccer gear' },
  { key: 'eat-dinner',                 src: eatDinner,                label: 'Eat dinner' },
  { key: 'set-the-table',             src: setTheTable,              label: 'Set the table' },
  { key: 'tidy-room',                 src: tidyRoom,                 label: 'Tidy room' },
  { key: 'have-a-shower',             src: haveAShower,              label: 'Have a shower' },
  { key: 'have-a-bath',               src: haveABath,                label: 'Have a bath' },
  { key: 'vacuum-house',               src: vacuumHouse,              label: 'Vacuum house' },
  { key: 'play-with-dog',             src: playWithDog,              label: 'Play with dog' },
  { key: 'charge-watch',              src: chargeWatch,              label: 'Charge watch' },
  { key: 'charge-ipad',               src: chargeIpad,               label: 'Charge iPad' },
  { key: 'sunscreen-on',              src: sunscreenOn,              label: 'Sunscreen on' },
  { key: 'hat-on',                     src: hatOn,                    label: 'Hat on' },
  { key: 'uniform-in-washing-basket', src: uniformInWashingBasket,   label: 'Uniform in basket' },
  { key: 'toys-away',                  src: toysAway,                 label: 'Toys away' },
  { key: 'pick-up-dog-poo',           src: pickUpDogPoo,             label: 'Pick up dog poo' },
  { key: 'clean-mirrors',              src: cleanMirrors,             label: 'Clean mirrors' },
  { key: 'empty-trash',               src: emptyTrash,               label: 'Empty trash' },
  { key: 'walk-the-dog',              src: walkTheDog,               label: 'Walk the dog' },
  { key: 'deodorant-on',              src: deodorantOn,              label: 'Deodorant on' },
  { key: 'wash-hair',                 src: washHair,                 label: 'Wash hair' },
  { key: 'put-clothes-away',          src: putClothesAway,           label: 'Put clothes away' },
  { key: 'help-unpack-groceries',     src: helpUnpackGroceries,      label: 'Unpack groceries' },
  { key: 'help-cook-dinner',          src: helpCookDinner,           label: 'Cook dinner' },
  { key: 'exercise',                   src: exercise,                 label: 'Exercise' },
  { key: 'help-in-garden',            src: helpInGarden,             label: 'Help in garden' },
  { key: 'soccer-bag',               src: soccerBag,                label: 'Soccer bag' },
  { key: 'vegemite-toast',           src: vegemiteToast,            label: 'Vegemite toast' },
  { key: 'lunchbox-2',               src: lunchbox2,                label: 'Lunchbox' },
  { key: 'make-bed-2',               src: makeBed2,                 label: 'Make bed 2' },
  { key: 'sport-uniform-pastel',     src: sportUniformPastel,       label: 'Sports uniform' },
  { key: 'toothbrush',               src: toothbrush,               label: 'Toothbrush' },
  { key: 'weetbix',                  src: weetbix,                  label: 'Weetbix' },
  { key: 'jam-toast',                src: jamToast,                 label: 'Jam toast' },
  { key: 'wps-uniform',              src: wpsUniform,               label: 'WPS uniform' },
  { key: 'sport-uniform',            src: sportUniform,             label: 'Sports uniform' },
  { key: 'barker-normal',            src: barkerNormal,             label: 'Barker uniform' },
  { key: 'barker-sport-uniform',     src: barkerSportUniform,       label: 'Barker sport' },
  { key: 'medication-am',            src: medicationAM,             label: 'Morning meds' },
  { key: 'medication-night',         src: medicationNight,          label: 'Night meds' },
  { key: 'medication-pm',            src: medicationPmFifi,         label: 'Afternoon meds' },
  { key: 'sport-folded-uniform',     src: sportFoldedUniform,       label: 'Folded uniform' },
  // Rewards
  { key: 'soccer-training',           src: soccerTraining,           label: 'Soccer training' },
  { key: 'soccer-game',               src: soccerGame,               label: 'Soccer game' },
  { key: 'cricket-training',          src: cricketTraining,          label: 'Cricket training' },
  { key: 'cricket-game',              src: cricketGame,              label: 'Cricket game' },
  { key: 'birthday-party',            src: birthdayParty,            label: 'Birthday party' },
  { key: 'friend-over',               src: friendOver,               label: 'Friend over' },
  { key: 'extra-screen-time',         src: extraScreenTime,          label: 'Extra screen time' },
  { key: 'movie-night',               src: movieNight,               label: 'Movie night' },
  { key: 'special-dinner',            src: specialDinner,            label: 'Special dinner' },
  { key: 'family-game',               src: familyGame,               label: 'Family game' },
  { key: 'craft-time',                src: craftTime,                label: 'Craft time' },
  { key: '1-1-parent-time',           src: oneOnOneParentTime,       label: '1:1 parent time' },
  { key: 'special-activity',          src: specialActivity,          label: 'Special activity' },
  { key: 'extra-tv-time',             src: extraTvTime,              label: 'Extra TV time' },
  { key: 'stay-up-late',              src: stayUpLate,               label: 'Stay up late' },
  { key: 'canteen-lunch-order',       src: canteenLunchOrder,        label: 'Canteen lunch' },
  { key: 'nintendo-time',             src: nintendoTime,             label: 'Nintendo time' },
  { key: 'nintendo-game',             src: nintendoGame,             label: 'Nintendo game' },
  { key: 'new-clothes',               src: newClothes,               label: 'New clothes' },
  { key: 'new-shoes',                 src: newShoes,                 label: 'New shoes' },
  { key: 'gift-voucher',              src: giftVoucher,              label: 'Gift voucher' },
  { key: 'special-breakfast',         src: specialBreakfast,         label: 'Special breakfast' },
  { key: 'bubble-tea',                src: bubbleTea,                label: 'Bubble tea' },
  { key: 'sushi',                     src: sushi,                    label: 'Sushi' },
  { key: 'tacos',                     src: tacos,                    label: 'Tacos' },
  { key: 'chicken-schnitzel',         src: chickenSchnitzel,         label: 'Chicken schnitzel' },
  { key: 'fish-and-chips',            src: fishAndChips,             label: 'Fish & chips' },
  { key: 'kfc',                       src: kfc,                      label: 'KFC' },
  { key: 'mcdonalds',                 src: mcdonalds,                label: "McDonald's" },
  { key: 'ice-block',                 src: iceBlock,                 label: 'Ice block' },
  { key: 'ice-cream',                 src: iceCream,                 label: 'Ice cream' },
  { key: 'slushie',                   src: slushie,                  label: 'Slushie' },
  { key: 'fruit',                     src: fruit,                    label: 'Fruit' },
  { key: 'vegetables',                src: vegetables,               label: 'Vegetables' },
]

// Resolve the src for a quest — imageKey overrides the default
export function resolveQuestImage(questId, imageKey) {
  if (imageKey) {
    return ALL_QUEST_IMAGES.find(i => i.key === imageKey)?.src ?? null
  }
  return QUEST_IMAGES[questId] ?? null
}
