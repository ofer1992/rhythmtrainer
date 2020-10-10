const NoteStatus = {
    HIT: "hit",
    MISSED: "missed",
    UNDEFINED: "undefined"
}
class Note {
    constructor(note, dur) {
        this.note = note;
        this.dur = dur;
        this.status = NoteStatus.UNDEFINED;
        this.callbacks = [];
    }

    setHit() {
        this.status = NoteStatus.HIT;
        this.emit();
    }

    setMissed() {
        this.status = NoteStatus.MISSED;
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

function Targets(offset) {
    this._a = [];
    this.print_a = () => {
        return (this._a.map(e => e.note+","+e.time)).toString()
    }
    this.add = (e) => {
        this._a.push(e)
        document.getElementById("hit_notes").innerText = this.print_a();
    };
    this.remove = (e) => {
        for(let i = 0; i < this._a.length; i++) {
            if (this._a[i].time == e.time && this._a[i].note == e.note) {
                this._a.splice(i,1)
                e.note.setMissed();
                document.getElementById("hit_notes").innerText = this.print_a();
                return i;
            }
        }
        document.getElementById("hit_notes").innerText = this.print_a();
        return -1;
    };
    this.hit = (e) => { // TODO: rename e to Midi something
        for(let i = 0; i < this._a.length; i++) {
            if (Math.abs(this._a[i].time - e.time) < 2*offset && this._a[i].note.note == e.note) {
                this._a[i].note.setHit();
                this._a.splice(i,1)
                document.getElementById("hit_notes").innerText = this.print_a();
                return true;
            }
        }
        document.getElementById("hit_notes").innerText = this.print_a();
        return false;
    };
}

export {Targets, Note, NoteStatus};