export function canDragAble(obj) {
    // enable the obj to be interactive... this will allow it to respond to mouse and touch events
    obj.interactive = true;

    // this button mode will mean the hand cursor appears when you roll over the obj with your mouse
    obj.buttonMode = true;
    obj
        // events for drag start
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
    return obj;
};

function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;

    this.preP = this.data.getLocalPosition(this.parent);
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd() {
    this.alpha = 1;

    this.dragging = false;

    // set the interaction data to null
    this.data = null;
}

function onDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        var prePosition = this.preP;
        this.position.x += (newPosition.x - prePosition.x);
        this.position.y += (newPosition.y - prePosition.y);
        this.preP = newPosition;
    }
}