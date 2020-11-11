const HitStatus = {
    HIT: "hit",
    MISSED: "missed",
    UNDEFINED: "undefined"
}

const Clef = {
    BASS: "bass",
    TREBLE: "treble"
}

const NoteName = {
    A: "A",
    Bb: "Bb",
    C: "C",
    Cs: "C#",
    Db: "Db",
    D: "D",
    Eb: "Eb",
    E: "E",
    F: "F",
    Fs: "F#",
    Gb: "Gb",
    G: "G",
    Ab: "Ab"
}

class Duration {
    constructor(length, dots=0) {
        this.non_dotted = math.fraction(length);
        this.dotted = math.fraction(0);
        for (let i=0; i<=dots; i++) {
            this.dotted = math.add(this.dotted, math.multiply(this.non_dotted, 0.5**i));
        }
        this.dots = dots;
    }

    static add(...durations) {
        return durations.reduce((a,b) => (math.add(a.dotted, b.dotted)));
    }

}

class Hittable {
    constructor() {
        this.status = HitStatus.UNDEFINED;
        this.callbacks = [];
    }

    setHit() {
        this.status = HitStatus.HIT;
        this.emit();
    }

    setMissed() {
        this.status = HitStatus.MISSED;
        this.emit();
    }

    connect(callback) {
        this.callbacks.push(callback);
    }

    emit() {
        for (let i=0; i < this.callbacks.length; i++) {
            this.callbacks[i](this.status);
        }
    }
}


class Note extends Hittable {
    constructor(note_name, octave, duration) {
        super();
        this.note_name = note_name; // NoteName
        this.octave = octave;  // int
        this.note = note_name+octave; // TODO: temp solution?
        this.dur = duration; // TODO: temp for back compat
        this.duration = duration;
    }
}

class Rest {
    constructor(duration) {
        this.duration = duration;
    }
}

class TiedNotes extends Hittable{
    // should delegate status to notes?
    constructor(notes) {
        super();
        this.notes = notes;
        this.duration = notes.map(n=>n.duration).reduce((a,b) => a+b);
    }
}

class Tuplets {
    // TODO
}

class Pattern {
    constructor() {
        this.ts = null; // string
        this.length = null; // int
        this.key = null;  // NoteName
        this.clef = null; // Clef
        this.notes = null;
    }
}

class Targets {
    constructor(offset) {
        this.offset = offset;
        this._a = [];
        this.print_a = () => {
            return (this._a.map(e => e.note + "," + e.time)).toString();
        };
    }
    add(e) {
        this._a.push(e);
        document.getElementById("hit_notes").innerText = this.print_a();
    }

    remove(e) {
        for (let i = 0; i < this._a.length; i++) {
            if (this._a[i].time == e.time && this._a[i].note == e.note) {
                this._a.splice(i, 1);
                e.note.setMissed();
                document.getElementById("hit_notes").innerText = this.print_a();
                return i;
            }
        }
        document.getElementById("hit_notes").innerText = this.print_a();
        return -1;
    }

    hit(e) {
        for (let i = 0; i < this._a.length; i++) {
            if (Math.abs(this._a[i].time - e.time) < 2 * this.offset && this._a[i].note.note == e.note) {
                this._a[i].note.setHit();
                this._a.splice(i, 1);
                document.getElementById("hit_notes").innerText = this.print_a();
                return true;
            }
        }
        document.getElementById("hit_notes").innerText = this.print_a();
        return false;
    }
}

export {Targets, Note, HitStatus as NoteStatus};