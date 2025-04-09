export const makeArrow = (canvas: HTMLCanvasElement, endingX: number, endingY: number, startingX: number, startingY: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return
    }

    let headlen = 10;
    let dx = endingX - startingX;
    let dy = endingY - startingY;
    let angle = Math.atan2(dy, dx);
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(endingX, endingY);
    ctx.lineTo(endingX - headlen * Math.cos(angle - Math.PI / 6), endingY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endingX, endingY);
    ctx.lineTo(endingX - headlen * Math.cos(angle + Math.PI / 6), endingY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = "white";
    ctx.stroke();
}