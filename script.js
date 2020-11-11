/* eslint-disable no-undef */
import {Targets, Note} from '/ds.js'
import {Midi} from '/midi.js'
import {parseEasyScore} from '/parser.js'
import {Display} from '/gui.js'

const OFFSET = 0.1; // 100ms 
let hit_notes = new Targets(OFFSET);
let beat = 0;
let missed = [];
let wrong = [];
new Midi(document.getElementById('midi-input'), listener);
Tone.Transport.bpm.value = 60;
const display = new Display('sheet-display');
let leftPart;

let leftSynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    volume: -7
});
let leftFilter = new Tone.Filter({ type: 'lowpass', frequency: 4000 }).toDestination();
leftSynth.connect(leftFilter);

let formatArr = (arr) => {
    return (arr.map(e => e.note+","+e.time)).toString();
};

function hittableSequence(pattern, length, player) {
    let part = new Tone.Part((time, notes) => {
        let note = notes; // TODO handle chords eventually
        let e = { note: note, time: time + OFFSET };
        Tone.Transport.scheduleOnce(() => hit_notes.add(e), time);
        player(note.note, 0.1, time + OFFSET);
        // leftSynth.triggerAttackRelease(note.note, 0.1, time + OFFSET);
        console.log(Tone.Transport.context.currentTime,time);
        Tone.Transport.scheduleOnce(() => {
            let i = hit_notes.remove(e)
            if (i != -1) {
                missed.push(e);
            }
            document.getElementById("missed_notes").innerText = formatArr(missed);
        }, time + 2 * OFFSET);
        // console.log(hit_notes);
    }, pattern).start();

    part.loop = true;
    part.loopStart = 0;
    part.loopEnd = length;
    return part;
}

let patterns = {};
const loadPatterns = async () => {
    const response = await fetch("patterns.json");
    const json = await response.json();
    patterns = json;
    let chosen_pattern = "chameleon_full"
    let pattern = patterns[chosen_pattern]
    let parsedLeft = parseEasyScore(pattern.notes);
    let leftPattern = parsedLeft.tone;
    let leftNotes = parsedLeft.notes;
    display.displayNotes(leftPattern, leftNotes);

    // let leftPart = new Tone.Part((time, notes) => {
    //     let note = notes; // TODO handle chords eventually
    //     let e = { note: note, time: time + offset };
    //     Tone.Transport.scheduleOnce(() => hit_notes.add(e), time);
    //     lead.triggerAttackRelease(note.note, 0.1, time + offset);
    //     // console.log(Tone.Transport.context.currentTime,time);
    //     Tone.Transport.scheduleOnce(() => {
    //         let i = hit_notes.remove(e)
    //         if (i != -1) {
    //             missed.push(e);
    //         }
    //         document.getElementById("missed_notes").innerText = formatArr(missed);
    //     }, time + 2 * offset);
    //     // console.log(hit_notes);
    // }, leftPattern).start();

    // leftPart.loop = true;
    // leftPart.loopStart = 0;
    // leftPart.loopEnd = '1m';
    leftPart = hittableSequence(leftPattern, pattern.length, (note,release,time) => leftSynth.triggerAttackRelease(note,release,time));
}
loadPatterns();

let clickPlayer = new Tone.Player('assets/firewood-beat.wav').toDestination();


// let rightPart = new Tone.Part((time, note) => {
//     clickPlayer.start(time + offset);
// }).start();

// rightPart.loop = true;
// rightPart.loopStart = 0;
// rightPart.loopEnd = '1m';

let rightPart = hittableSequence([], '1m', (note, release, time) => clickPlayer.start(time));


new Tone.Loop(time => {
    Tone.Draw.schedule(() => {
        document.getElementById("beat").innerText = 1 + beat
        beat = (beat + 1) % 4;
    }, time + OFFSET);
}, "4n").start();

document.getElementById("start").onclick = async () => {
    await Tone.start();
    Tone.Transport.start();
};

document.getElementById("stop").onclick = async () => {
    Tone.Transport.stop();
    hit_notes = new Targets(OFFSET);
};

document.getElementById("bpm").oninput = (evt) => {
    let newBpm = evt.target.value;
    Tone.Transport.bpm.value = newBpm;
    document.getElementById("bpm-num").innerText = newBpm;
}

let sequencer = new Nexus.Sequencer("#sequencer", {
    columns: 16,
    rows: 1,
    size: [550, 40]
});
let seq_notes = new Array(16).fill(null).map(()=> (new Note('C6', '16')));


sequencer.on('change', ({ column, row, state }) => {
    let time = { '16n': column };
    let note = seq_notes[column];
    if (state) {
        rightPart.add(time, note);
    } else {
        rightPart.remove(time, note);
    }
    console.log(time, note);
    display.displaySequencer(sequencer, seq_notes);
});

// midi stuff
function listener(e) {
    // console.log(e);
    let n = { note: e.note.name + e.note.octave, time: Tone.Transport.context.currentTime };
    let hit = hit_notes.hit(n);
    if (!hit) {
        wrong.push(n);
    }
    document.getElementById("wrong_hits").innerText = formatArr(wrong);
    // console.log(hit_notes.hit(n), n);
}
