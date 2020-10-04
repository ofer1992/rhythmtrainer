let offset = 0.1 // 100ms 
let hit_notes = new Targets(offset);
let beat = 0;
let missed = [];
let wrong = [];
let midiInput;

let formatArr = (arr) => {
    return (arr.map(e => e.note+","+e.time)).toString();
};

let patterns = {};
const loadPatterns = async () => {
    const response = await fetch("patterns.json");
    const json = await response.json();
    patterns = json;
    let parsedLeft = parseEasyScore(patterns["testing"].notes);
    let leftPattern = parsedLeft.tone;
    let leftNotes = parsedLeft.notes;
    display.displayNotes(leftNotes);

    let leftPart = new Tone.Part((time, notes) => {
        note = notes[0]; // TODO handle chords eventually
        let e = { note: note, time: time + offset };
        Tone.Transport.scheduleOnce(() => hit_notes.add(e), time);
        lead.triggerAttackRelease(note, 0.1, time + offset);
        // console.log(Tone.Transport.context.currentTime,time);
        Tone.Transport.scheduleOnce(() => {
            let i = hit_notes.remove(e)
            if (i != -1) {
                missed.push(e);
            }
            document.getElementById("missed_notes").innerText = formatArr(missed);
        }, time + 2 * offset);
        // console.log(hit_notes);
    }, leftPattern).start();

    leftPart.loop = true;
    leftPart.loopStart = 0;
    leftPart.loopEnd = '1m';
}
loadPatterns();

let clickPlayer = new Tone.Player('assets/firewood-beat.wav').toDestination();

let display = new Display('sheet-display');
// let leftPattern = [
// ['0:0', 'C3'],
// ['0:1', 'G3'],
// ['0:2', 'E3'],
// ['0:3', 'G3']
// ];

let lead = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    volume: -7
});
let leadFilter = new Tone.Filter({ type: 'lowpass', frequency: 4000 }).toDestination();
lead.connect(leadFilter);

let rightPart = new Tone.Part((time, note) => {
    clickPlayer.start(time + offset);
}).start();

rightPart.loop = true;
rightPart.loopStart = 0;
rightPart.loopEnd = '1m';


new Tone.Loop(time => {
    Tone.Draw.schedule(() => {
        document.getElementById("beat").innerText = 1 + beat
        beat = (beat + 1) % 4;
    }, time + offset);
}, "4n").start();

document.getElementById("start").onclick = async () => {
    await Tone.start();
    Tone.Transport.start();
};

document.getElementById("stop").onclick = async () => {
    Tone.Transport.stop();
    hit_notes = new Targets(offset);
};

document.getElementById("bpm").oninput = (evt) => {
    let newBpm = evt.target.value;
    Tone.Transport.bpm.value = newBpm;
}

let sequencer = new Nexus.Sequencer("#sequencer", {
    columns: 16,
    rows: 1,
    size: [550, 40]
});


sequencer.on('change', ({ column, row, state }) => {
    let time = { '16n': column };
    let note = 'beat';
    if (state) {
        rightPart.add(time, note);
    } else {
        rightPart.remove(time, note);
    }
    console.log(time, note);
    display.displaySequencer(sequencer);
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

WebMidi.enable(function (err) {
    if (err) {
        console.log("WebMidi could not be enabled.", err);
    } else {
        console.log("WebMidi enabled!");
    }
    midiInput = WebMidi.getInputByName("Roland Digital Piano");
    midiInput.addListener('noteon', "all", listener);
});