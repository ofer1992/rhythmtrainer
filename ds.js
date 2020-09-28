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
                document.getElementById("hit_notes").innerText = this.print_a();
                return i;
            }
        }
        document.getElementById("hit_notes").innerText = this.print_a();
        return -1;
    };
    this.hit = (e) => {
        for(let i = 0; i < this._a.length; i++) {
            if (Math.abs(this._a[i].time - e.time) < 2*offset && this._a[i].note == e.note) {
                this._a.splice(i,1)
                document.getElementById("hit_notes").innerText = this.print_a();
                return true;
            }
        }
        document.getElementById("hit_notes").innerText = this.print_a();
        return false;
    };
}