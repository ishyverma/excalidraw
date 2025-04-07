import { ExistingShapes } from "@/components/ui/canvas";

export const makeLine = (canvas: HTMLCanvasElement, existingShapes: ExistingShapes[], startingX: number, startingY: number, endingX: number, endingY: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return
    }

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(endingX, endingY);
    ctx.stroke();
}