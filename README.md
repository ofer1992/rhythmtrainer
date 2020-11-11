## synopsis

Training left and right hand independence for pop, rock, blues etc genres. The idea is to drill the left hand pattern of choice over varying right hand rhythms.

Written in JS.


## Minimal prototype
User can input a left hand pattern using EasyScore grammar. User can choose right hand pattern using sequencer.
Once started, the user is scored on percentage of hit/total notes, for each hand separately.
Only supporting 4/4 time signature, 1 bar patterns.

## Modes
- practice pattern - honing in on one pattern, displayed with left hand pattern, and practicing to success.
- generate practice page - like the rhythm book, randomly generate a practice page, and score it.

## Dev

### Parts to tackle:
#### input from user
already done before using vexflow fast input and parsed. perhaps can be done again. hijacking easyscore parser.
turns out the easyscore notation lacks a lot of expressiveness. for example, i can't notate triplets or ties.
i think i should add a layer of abstraction, so i parse to my own representation of the pattern and use that as my data,
to display, play and hit. Then i can have as many parsers as i wish.

so, what is the pattern specification?
- time signature
- number of measures/length
- clef
- key
- notes (including chords) and rests, with supports for tuplets and ties

my assumptions:
- only one staff
- only one voice (no overlapping notes, except chords as a unit)
- one key
- whole number of measures

 

- display - vexflow or abcjs? abcjs might be easier to interact with but interactivity isn't crucial at first.
  - going with vexflow
- timing is handled with tone.js
- capturing and evalutating - webmidi, question is how to integrate with tone js
  - i delay every timing of tone js with an offset. is there a cleaner way?

### UI
In bootstrap? or maybe overkill..