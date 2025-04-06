import { ExistingShapes } from "@/components/ui/canvas";

export const getExistingShapes = (existingShapes: ExistingShapes[], canvas: HTMLCanvasElement) => {
    existingShapes.map(shape => {
        switch (shape.shape) {
            case "rectangle": {
                const ctx = canvas.getContext("2d")

                if (!ctx || !canvas) {
                    console.log("No Convas Is There")
                    return;
                }

                ctx.strokeStyle = 'white'
                ctx.strokeRect(shape.startingX, shape.startingY, shape.endingX, shape.endingY)
                break;
            }
        }
    })
}