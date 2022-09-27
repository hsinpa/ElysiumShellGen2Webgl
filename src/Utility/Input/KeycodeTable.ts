export const InputEventTitle = Object.freeze({
    up : "up",
    down : "down",
    left: "left",
    right : "right",
});

export const KeycodeLookupTable = Object.create({
    w : InputEventTitle.up,
    s : InputEventTitle.down,
    d : InputEventTitle.right,
    a : InputEventTitle.left,
    ArrowUp : InputEventTitle.up,
    ArrowDown : InputEventTitle.down,
    ArrowRight : InputEventTitle.right,
    ArrowLeft : InputEventTitle.left
});
