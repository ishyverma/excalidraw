import { ExistingShapes } from "@/components/ui/canvas";
import { getExistingShapes } from "./get-existing-shapes";

export const showArrow = (canvas: HTMLCanvasElement, existingShapes: ExistingShapes[], endingX: number, endingY: number, startingX: number, startingY: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return
    }

    let headlen = 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath();
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

    getExistingShapes(existingShapes, canvas);
}