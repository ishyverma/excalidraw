import { ExistingShapes } from "@/components/ui/canvas";

export const getExistingShapes = (
  existingShapes: ExistingShapes[],
  canvas: HTMLCanvasElement
) => {
  existingShapes.map((shape) => {
    switch (shape.shape) {
      case "rectangle": {
        const ctx = canvas.getContext("2d");

        if (!ctx || !canvas) {
          console.log("No Convas Is There");
          return;
        }

        ctx.strokeStyle = "white";
        ctx.strokeRect(
          shape.startingX,
          shape.startingY,
          shape.endingX,
          shape.endingY
        );
        break;
      }
      case "circle": {
        const ctx = canvas.getContext("2d");

        if (!ctx || !canvas) {
          console.log("No Convas Is There");
          return;
        }

        let radiusX = (shape.x - shape.startingX) * 0.5,
          radiusY = (shape.y - shape.startingY) * 0.5,
          centerX = shape.startingX + radiusX,
          centerY = shape.startingY + radiusY,
          step = 0.01,
          a = step,
          pi2 = Math.PI * 2 - step;

        ctx.beginPath();

        ctx.moveTo(
          centerX + radiusX * Math.cos(0),
          centerY + radiusY * Math.sin(0)
        );

        for (; a < pi2; a += step) {
          ctx.lineTo(
            centerX + radiusX * Math.cos(a),
            centerY + radiusY * Math.sin(a)
          );
        }

        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.stroke();
        break;
      }
    }
  });
};
