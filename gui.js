import {NoteStatus} from '/ds.js'
const VF = Vex.Flow; 

class Display {
    constructor(divId) {
        let kStaveVerticalDist = 100;
        let kStaveWidth = 500;
        let kFirstStaveY = 40;
        let div = document.getElementById(divId)
        let renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
        renderer.resize(600, 300); //TODO
        this.context = renderer.getContext();
        this.stave = new VF.Stave(10, kFirstStaveY, kStaveWidth);
        this.stave.addClef("treble").addTimeSignature("4/4");
        this.stave.setContext(this.context).draw();

        this.stave2 = new VF.Stave(10, kFirstStaveY+kStaveVerticalDist, kStaveWidth);
        this.stave2.addClef("bass").addTimeSignature("4/4");
        this.stave2.setContext(this.context).draw();

        let connector = new VF.StaveConnector(this.stave, this.stave2);
        connector.setType(VF.StaveConnector.type.SINGLE);
        connector.setContext(this.context).draw();
        this.groups = {};
    }

    displaySequencer(seq, seq_notes) {
        if (this.groups['seq']) {
            this.context.svg.removeChild(this.groups['seq']);
        }
        this.groups['seq'] = this.context.openGroup();
        let notes = [];
        for (let i = 0; i < seq.columns; i++) {
            let dur = seq.matrix.pattern[0][i] ? '16' : '16r';
            notes.push(
                new VF.StaveNote({ clef: "treble", keys: ["c/5"], duration: dur })
            )
            if (dur == '16') {
                seq_notes[i].callbacks = []
                seq_notes[i].connect((status) => {
                    if (status == NoteStatus.HIT) {
                        colorNote(notes[i], 'green');
                    } else if (status == NoteStatus.MISSED) {
                        colorNote(notes[i], 'red');
                    }
                });
            }
        }
        let voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);
        let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 450);
        voice.draw(this.context, this.stave);
        this.context.closeGroup();
    }

    displayNotes(tones, notes) {
        if (this.groups['notes']) {
            this.context.svg.removeChild(this.groups['notes']);
        }
        this.groups['notes'] = this.context.openGroup();
        let voice = new VF.Voice({ num_beats: 8, beat_value: 4 });
        voice.addTickables(notes);
        let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 450);
        voice.draw(this.context, this.stave2);
        this.context.closeGroup();
        for (let i=0; i < tones.length; i++) {
            tones[i][1].connect((status) => {
                if (status == NoteStatus.HIT) {
                    colorNote(notes[i], 'green');
                } else if (status == NoteStatus.MISSED) {
                    colorNote(notes[i], 'red');
                };
            });
        }
    }
}

function colorNote(note, color) {
  Vex.forEach($(note.getAttribute('el')).find('*'), function(child) {
    child.setAttribute("fill", color);
    child.setAttribute("stroke", color);
  });
}

export {Display};