class Midi {
	constructor(selector, listener){
        this.NONE = "None"
        this._isEnabled = false;
        this.selector = selector;
        this.listener = listener;

		WebMidi.enable((err) => {
			if (!err){
				this._isEnabled = true;
                this._updateSelector();
				// if (WebMidi.inputs){
					// WebMidi.inputs.forEach((input) => this._bindInput(input))
				// }
				WebMidi.addListener('connected', (device) => {
					if (device.port.type == "input"){
                        this._updateSelector();
						// this._bindInput(device.port)
					}
				});
                WebMidi.addListener('disconnected', (device) => {
                    this._updateSelector();
                    // if (device.port.type == "input"){
                        // device.port.removeListener('noteon')
                        // device.port.removeListener('noteoff')
                    // }
                });
			}
            this.selector.addEventListener('change', ev => this.updateSelectedInput(ev));
        });
    }
    
    updateSelectedInput(event) {
        for (let i=0; i < WebMidi.inputs.length; i++) {
            WebMidi.inputs[i].removeListener('noteon');
        }
        let selected = event.target.value;
        if (selected != this.NONE) {
            WebMidi.getInputByName(selected).addListener('noteon', 'all', this.listener);
        }

    }
    _updateSelector() {
        for(let i=this.selector.length-1; i >= 0; i--) {
            this.selector.remove(i);
        }
        let el = document.createElement("option"); // get name
        el.text = this.NONE;
        this.selector.add(el);
        // for(let i=0; i < WebMidi.inputs.length; i++) {
        //     let el = document.createElement("option"); // get name
        //     el.text = WebMidi.inputs[i].name;
        //     this.selector.add(el);
        // }
        for (let input of WebMidi.inputs) {
            let el = document.createElement("option"); // get name
            el.text = input.name;
            this.selector.add(el);
        }
    }

	_bindInput(inputDevice){
		if (this._isEnabled){
			// inputDevice.addListener('noteon', 'all', this.listener);
			// inputDevice.addListener('noteoff', 'all',  (event) => {
			// 	try {
			// 		this.emit('keyUp', event.note.number)
			// 	} catch(e){
			// 		console.warn(e)
			// 	}
			// })
		}
	}
}

export {Midi};