import { ExistingShapes } from "@/components/ui/canvas";
import { getExistingShapes } from "./get-existing-shapes";

export const showLine = (canvas: HTMLCanvasElement, existingShapes: ExistingShapes[], startingX: number, startingY: number, endingX: number, endingY: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(endingX, endingY);
    ctx.stroke();

    getExistingShapes(existingShapes, canvas);
}