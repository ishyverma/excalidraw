import { ExistingShapes } from "@/components/ui/canvas";
import { getExistingShapes } from "./get-existing-shapes";

export const showCircle = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  canvas: HTMLCanvasElement,
  startingX: number,
  startingY: number,
  existingShapes: ExistingShapes[]
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  let radiusX = (x - startingX) * 0.5, 
    radiusY = (y - startingY) * 0.5, 
    centerX = startingX + radiusX, 
    centerY = startingY + radiusY,
    step = 0.01,
    a = step, 
    pi2 = Math.PI * 2 - step;

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath();

  ctx.moveTo(centerX + radiusX * Math.cos(0), centerY + radiusY * Math.sin(0));

  for (; a < pi2; a += step) {
    ctx.lineTo(
      centerX + radiusX * Math.cos(a),
      centerY + radiusY * Math.sin(a)
    );
  }

  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.stroke();
  getExistingShapes(existingShapes, canvas)
};
