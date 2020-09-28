let offset = 0.1 // 100ms 
let hit_notes = new Targets(offset);
let beat = 0;
let missed = [];
let wrong = [];

let formatArr = (arr) => {
    return (arr.map(e => e.note+","+e.time)).toString();
};

let leftPattern = [
    ['0:0', 'C3'],
    ['0:1', 'G3'],
    ['0:2', 'E3'],
    ['0:3', 'G3']
];

let lead = new Tone.Synth({
    oscillator: {type: 'sawtooth'},
    volume: -7
  });
let leadFilter = new Tone.Filter({type: 'lowpass', frequency:4000}).toDestination();
lead.connect(leadFilter);



let leadPart = new Tone.Part((time, note) => {
    let e = {note: note, time: time+offset};
    Tone.Transport.scheduleOnce(() => hit_notes.add(e), time);
    lead.triggerAttackRelease(note, 0.1, time+offset);
    // console.log(Tone.Transport.context.currentTime,time);
    Tone.Transport.scheduleOnce(() => {
        let i = hit_notes.remove(e)
        if (i != -1) {
            missed.push(e);
        }
        document.getElementById("missed_notes").innerText = formatArr(missed);
    }, time+2*offset);
    // console.log(hit_notes);
  }, leftPattern).start();
  
leadPart.loop = true;
leadPart.loopStart = 0;
leadPart.loopEnd = '1m';

new Tone.Loop(time => {
    document.getElementById("beat").innerText = 1 + beat;
    beat = (beat + 1) % 4;
}, "4n").start();

document.getElementById("start").onclick = async () => {
    await Tone.start();
    Tone.Transport.start();
};

document.getElementById("stop").onclick = async () => {
    Tone.Transport.stop();
};

document.getElementById("bpm").oninput = (evt) => {
  let newBpm = evt.target.value;
  Tone.Transport.bpm.value = newBpm;
}

// midi stuff
function listener(e) {
    // console.log(e);
    let n = {note: e.note.name+e.note.octave, time: Tone.Transport.context.currentTime};
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