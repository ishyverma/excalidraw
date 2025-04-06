import { ExistingShapes } from "@/components/ui/canvas";
import { getExistingShapes } from "./get-existing-shapes";

export const showRectangle = (startingX: number, startingY: number, width: number, height: number, canvas: HTMLCanvasElement, existingShapes: ExistingShapes[]) => {
    const ctx = canvas.getContext("2d")

    if (!ctx || !canvas) {
        console.log("No Canvas Is There")
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white'
    ctx.strokeRect(startingX, startingY, width, height)
    getExistingShapes(existingShapes, canvas)
}