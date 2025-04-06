export const getMousePosition = (canvas: HTMLCanvasElement, event: MouseEvent) => {
    event.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    return {
        x, y
    }
}