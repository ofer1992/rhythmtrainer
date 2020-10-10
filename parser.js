/* Riding on VexFlow EasyScore parser to parse user pattern input and format for Tone.js
   TODO: combine parsing for vexflow and tone.js and attach each tone.js event to vexflow note
         that way we can color current note and missed and hits

    reference:
    - https://github.com/0xfe/vexflow/blob/f7197ee18fa3a5ee02b9fbb5cfbf1272dd788fba/src/easyscore.js
    - https://github.com/0xfe/vexflow/blob/master/src/tables.js (for duration stuff)
 */
import {Note} from '/ds.js'
const VF = Vex.Flow; // TODO this global will appear again..
const DEBUG_PARSER = false;
function L(...args) { if (DEBUG_PARSER) Vex.L('Vex.Flow.EasyScore', args); }



class Builder {
  constructor(factory) {
    this.factory = factory;
    this.commitHooks = [];
    this.reset();
  }

  reset(options = {}) {
    this.options = {
      stem: 'auto',
      clef: 'treble',
    };
    this.elements = {
      notes: [],
      accidentals: [],
      tone: []
    };
    this.rollingDuration = '8';
    this.resetPiece();
    Object.assign(this.options, options);
  }

  getFactory() { return this.factory; }

  getElements() { return this.elements; }

  addCommitHook(commitHook) {
    this.commitHooks.push(commitHook);
  }

  resetPiece() {
    L('resetPiece');
    this.piece = {
      chord: [],
      duration: this.rollingDuration,
      dots: 0,
      type: undefined,
      options: {},
    };
  }

  setNoteDots(dots) {
    L('setNoteDots:', dots);
    if (dots) this.piece.dots = dots.length;
  }

  setNoteDuration(duration) {
    L('setNoteDuration:', duration);
    this.rollingDuration = this.piece.duration = duration || this.rollingDuration;
  }

  setNoteType(type) {
    L('setNoteType:', type);
    if (type) this.piece.type = type;
  }

  addNoteOption(key, value) {
    L('addNoteOption: key:', key, 'value:', value);
    this.piece.options[key] = value;
  }

  addNote(key, accid, octave) {
    L('addNote:', key, accid, octave);
    this.piece.chord.push({ key, accid, octave });
  }

  addSingleNote(key, accid, octave) {
    L('addSingleNote:', key, accid, octave);
    this.addNote(key, accid, octave);
  }

  addChord(notes) {
    L('startChord');
    if (typeof (notes[0]) !== 'object') {
      this.addSingleNote(notes[0]);
    } else {
      notes.forEach(n => {
        if (n) this.addNote(...n);
      });
    }
    L('endChord');
  }

  commitPiece() {
    L('commitPiece');
    const { factory } = this;

    // if (!factory) return;

    const options = { ...this.options, ...this.piece.options };
    const { stem, clef } = options;
    const autoStem = stem.toLowerCase() === 'auto';
    const stemDirection = !autoStem && stem.toLowerCase() === 'up'
      ? VF.StaveNote.STEM_UP
      : VF.StaveNote.STEM_DOWN;

    // Build StaveNotes.
    const { chord, duration, dots, type } = this.piece;
    const keys = chord.map(note => note.key + '/' + note.octave);
    // /*
    const note = factory.StaveNote({
      keys,
      duration,
      dots,
      type,
      clef,
      auto_stem: autoStem,
    });

    if (!autoStem) note.setStemDirection(stemDirection);

    // Attach accidentals.
    const accids = chord.map(note => note.accid || null);
    accids.forEach((accid, i) => {
      if (accid) note.addAccidental(i, factory.Accidental({ type: accid }));
    });

    // Attach dots.
    for (let i = 0; i < dots; i++) note.addDotToAll();

    this.commitHooks.forEach(fn => fn(options, note, this));

    this.elements.notes.push(note);
    this.elements.accidentals.concat(accids);
    // */
    this.elements.tone.push([Tone.Time(VF.sanitizeDuration(duration)+'n'), chord.map(note => note.key+(note.accid ? note.accid : "") +note.octave)])
    this.resetPiece();
  }
}

function parseEasyScore(line) {
    // Create a VexFlow renderer attaced to the DIV element "boo"
    let vf = new VF.Factory({ renderer: { elementId: 'boo' } });
    let score = vf.EasyScore({builder: new Builder(vf)});
    score.parse(line);
    let pattern = score.builder.getElements().tone;
    let cumsum = (sum => value => sum += value)(-pattern[0][0]);
    return {tone: pattern.map(e => [cumsum(e[0]), new Note(e[1][0], e[0])]), notes: score.builder.getElements().notes};

}

export {parseEasyScore};