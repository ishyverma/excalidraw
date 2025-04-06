export const makeCircle = (
    x: number,
    y: number,
    canvas: HTMLCanvasElement,
    startingX: number,
    startingY: number
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
  };
  