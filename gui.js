// const VF = Vex.Flow; // TODO this global will appear again..

class Display {
    constructor(divId) {
        let div = document.getElementById(divId)
        let renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
        renderer.resize(600, 200); //TODO
        this.context = renderer.getContext();
        this.stave = new VF.Stave(10, 40, 500);
        this.stave.addClef("treble").addTimeSignature("4/4");
        this.stave.setContext(this.context).draw();

        this.stave2 = new VF.Stave(10, 100, 500);
        this.stave2.addClef("treble").addTimeSignature("4/4");
        this.stave2.setContext(this.context).draw();

        this.groups = {};
    }

    displaySequencer(seq) {
        if (this.groups['seq']) {
            this.context.svg.removeChild(this.groups['seq']);
        }
        this.groups['seq'] = this.context.openGroup();
        let notes = [];
        for (let i = 0; i < seq.columns; i++) {
            let dur = seq.matrix.pattern[0][i] ? '16' : '16r';
            notes.push(
                new VF.StaveNote({clef: "treble", keys: ["c/5"], duration: dur})
            )
        }
        let voice = new VF.Voice({num_beats: 4, beat_value: 4});
        voice.addTickables(notes);
        let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 450);
        voice.draw(this.context, this.stave);
        this.context.closeGroup();
    }

    displayNotes(notes) {
        if (this.groups['notes']) {
            this.context.svg.removeChild(this.groups['notes']);
        }
        this.groups['notes'] = this.context.openGroup();
        let voice = new VF.Voice({num_beats: 4, beat_value: 4});
        voice.addTickables(notes);
        let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 450);
        voice.draw(this.context, this.stave2);
        this.context.closeGroup();
    }
}