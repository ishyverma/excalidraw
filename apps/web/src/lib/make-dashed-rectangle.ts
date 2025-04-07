export const makeDashedRectangle = (startingX: number, startingY: number, width: number, height: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")

    if (!ctx || !canvas) {
        console.log("No Convas Is There")
        return;
    }

    ctx.strokeStyle = '#9492d6'
    ctx.strokeRect(startingX, startingY, width, height)
    ctx.stroke();
}
