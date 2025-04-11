"use client";

import { useWebsocket } from "@/hooks/useWebsocket";
import { cn } from "@/lib/utils";
import { Circle, MoveRight, Pencil, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

type Objects = "rectangle" | "circle" | "line" | "pencil" | "arrow";
type Colors = "white" | "red" | "green" | "blue";

export interface Rectangle {
  shape: "rectangle";
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
  isDragging: boolean;
  color: Colors;
}

export interface Line {
  shape: "line";
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
  isDragging: boolean;
  color: Colors;
}

export interface Circle {
  shape: "circle";
  x: number;
  y: number;
  radius: number;
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
  isDragging: boolean;
  color: Colors;
}

export interface Arrow {
  shape: "arrow";
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
  isDragging: boolean;
  color: Colors;
}

export interface Pencil {
  shape: "pencil";
  points: { x: number; y: number }[];
  isDragging: boolean;
  color: Colors;
}

export type ExistingShapes = Rectangle | Circle | Line | Arrow | Pencil;

const Canvas = () => {
  const existingShapes = useRef<ExistingShapes[]>([]);
  const [color, setColor] = useState<Colors>("white");
  const canvas = useRef<HTMLCanvasElement>(null);
  const redrawCanvasRef = useRef<(() => void) | null>(null);
  const startingX = useRef<number>(0);
  const startingY = useRef<number>(0);
  const mouseDown = useRef<boolean>(false);
  const { connected, sendMessage } = useWebsocket("ws://localhost:8080");
  const [object, setObject] = useState<Objects>("rectangle");
  const shape = useRef<Objects>("rectangle");
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const currentShape = useRef<ExistingShapes | null>(null);

  useEffect(() => {
    shape.current = object;
  }, [object]);

  useEffect(() => {
    if (canvas.current && connected) {
      sendMessage({
        type: "join_canvas",
      });

      function keyboardClick(e: KeyboardEvent) {
        switch (e.key) {
          case "1": {
            setObject("rectangle");
            break;
          }
          case "2": {
            setObject("circle");
            break;
          }
          case "3": {
            setObject("line");
            break;
          }
          case "4": {
            setObject("pencil");
            break;
          }
          case "5": {
            setObject("arrow");
            break;
          }
          case "r": {
            setColor("red");
            break;
          }
          case "b": {
            setColor("blue");
            break;
          }
          case "w": {
            setColor("white");
            break;
          }
          case "g": {
            setColor("green");
            break;
          }
        }
      }

      window.addEventListener("keydown", keyboardClick);

      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;

      function drawShape(ctx: CanvasRenderingContext2D, shape: ExistingShapes) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2 / scale;
        // Use the shape's stored color instead of the current color
        ctx.strokeStyle = shape.color;

        switch (shape.shape) {
          case "rectangle": {
            ctx.rect(
              shape.startingX,
              shape.startingY,
              shape.endingX - shape.startingX,
              shape.endingY - shape.startingY
            );
            break;
          }
          case "circle": {
            let radiusX = (shape.endingX - shape.startingX) * 0.5;
            let radiusY = (shape.endingY - shape.startingY) * 0.5;
            let centerX = shape.startingX + radiusX;
            let centerY = shape.startingY + radiusY;

            ctx.moveTo(
              centerX + radiusX * Math.cos(0),
              centerY + radiusY * Math.sin(0)
            );

            for (let i = 0; i <= 360; i += 5) {
              const radian = (i * Math.PI) / 180;
              ctx.lineTo(
                centerX + radiusX * Math.cos(radian),
                centerY + radiusY * Math.sin(radian)
              );
            }
            break;
          }
          case "line": {
            ctx.moveTo(shape.startingX, shape.startingY);
            ctx.lineTo(shape.endingX, shape.endingY);
            break;
          }
          case "arrow": {
            let headlen = 10 / scale;
            let dx = shape.endingX - shape.startingX;
            let dy = shape.endingY - shape.startingY;
            let angle = Math.atan2(dy, dx);

            ctx.moveTo(shape.startingX, shape.startingY);
            ctx.lineTo(shape.endingX, shape.endingY);

            ctx.lineTo(
              shape.endingX - headlen * Math.cos(angle - Math.PI / 6),
              shape.endingY - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(shape.endingX, shape.endingY);
            ctx.lineTo(
              shape.endingX - headlen * Math.cos(angle + Math.PI / 6),
              shape.endingY - headlen * Math.sin(angle + Math.PI / 6)
            );
            break;
          }
          case "pencil": {
            const points = (shape as Pencil).points;
            if (points && points.length > 0) {
              ctx.moveTo(points[0].x, points[0].y);
              for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
              }
            }
            break;
          }
        }

        ctx.stroke();
        ctx.restore();
      }

      function redrawCanvas() {
        if (!canvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

        ctx.setTransform(
          scale,
          0,
          0,
          scale,
          canvas.current.width / 2 + offsetX * scale,
          canvas.current.height / 2 + offsetY * scale
        );

        ctx.fillStyle = "black";
        ctx.fillRect(
          -canvas.current.width / 2 / scale,
          -canvas.current.height / 2 / scale,
          canvas.current.width / scale,
          canvas.current.height / scale
        );

        for (const shape of existingShapes.current) {
          drawShape(ctx, shape);
        }

        if (currentShape.current) {
          drawShape(ctx, currentShape.current);
        }
      }

      function getTransformedPoint(x: number, y: number) {
        if (!canvas.current) return { x, y };

        const rect = canvas.current.getBoundingClientRect();

        const scaleX = canvas.current.width / rect.width;
        const canvasX = (x - rect.left) * scaleX;
        const scaleY = canvas.current.height / rect.height;
        const canvasY = (y - rect.top) * scaleY;

        const centerX = canvas.current.width / 2;
        const centerY = canvas.current.height / 2;
        const transformedX = (canvasX - centerX) / scale - offsetX;
        const transformedY = (canvasY - centerY) / scale - offsetY;

        return { x: transformedX, y: transformedY };
      }

      function onMouseWheel(event: WheelEvent) {
        if (!canvas.current) return;
        event.preventDefault();

        const deltaY = event.deltaY;
        const scaleAmount = -deltaY / 500;
        const newScale = Math.max(0.1, Math.min(10, scale * (1 + scaleAmount)));

        const rect = canvas.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const canvasCenterX = canvas.current.width / 2;
        const pointX = (mouseX - canvasCenterX) / scale - offsetX;
        const newOffsetX = offsetX - pointX * (newScale - scale);
        const canvasCenterY = canvas.current.height / 2;
        const pointY = (mouseY - canvasCenterY) / scale - offsetY;
        const newOffsetY = offsetY - pointY * (newScale - scale);

        setScale(newScale);
        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);

        requestAnimationFrame(() => redrawCanvas());
      }

      redrawCanvas();

      function onMouseDown(event: MouseEvent) {
        if (event.button === 1 || event.button === 2) {
          setIsDragging(true);
          setLastX(event.clientX);
          setLastY(event.clientY);
          event.preventDefault();
        } else if (event.button === 0) {
          const { x, y } = getTransformedPoint(event.clientX, event.clientY);
          startingX.current = x;
          startingY.current = y;
          mouseDown.current = true;

          switch (shape.current) {
            case "rectangle": {
              currentShape.current = {
                shape: "rectangle",
                startingX: x,
                startingY: y,
                endingX: x,
                endingY: y,
                isDragging: false,
                color: color,
              };
              break;
            }
            case "circle": {
              currentShape.current = {
                shape: "circle",
                x: x,
                y: y,
                radius: 0,
                startingX: x,
                startingY: y,
                endingX: x,
                endingY: y,
                isDragging: false,
                color: color,
              };
              break;
            }
            case "line": {
              currentShape.current = {
                shape: "line",
                startingX: x,
                startingY: y,
                endingX: x,
                endingY: y,
                isDragging: false,
                color: color,
              };
              break;
            }
            case "arrow": {
              currentShape.current = {
                shape: "arrow",
                startingX: x,
                startingY: y,
                endingX: x,
                endingY: y,
                isDragging: false,
                color: color,
              };
              break;
            }
            case "pencil": {
              currentShape.current = {
                shape: "pencil",
                points: [{ x, y }],
                isDragging: false,
                color: color,
              };
              break;
            }
          }
        }
      }

      function onMouseMove(event: MouseEvent) {
        if (isDragging) {
          const dx = event.clientX - lastX;
          const dy = event.clientY - lastY;

          setOffsetX(offsetX + dx / scale);
          setOffsetY(offsetY + dy / scale);

          setLastX(event.clientX);
          setLastY(event.clientY);

          requestAnimationFrame(redrawCanvas);
          event.preventDefault();
        } else if (mouseDown.current && currentShape.current) {
          const { x, y } = getTransformedPoint(event.clientX, event.clientY);

          switch (currentShape.current.shape) {
            case "pencil": {
              (currentShape.current as Pencil).points.push({ x, y });
              break;
            }
            case "rectangle":
            case "circle":
            case "line":
            case "arrow": {
              currentShape.current.endingX = x;
              currentShape.current.endingY = y;
              break;
            }
          }

          requestAnimationFrame(redrawCanvas);
        }
      }

      function onMouseUp(event: MouseEvent) {
        if (isDragging) {
          setIsDragging(false);
        } else if (mouseDown.current && currentShape.current) {
          const { x, y } = getTransformedPoint(event.clientX, event.clientY);

          switch (currentShape.current.shape) {
            case "pencil": {
              (currentShape.current as Pencil).points.push({ x, y });
              break;
            }
            case "rectangle":
            case "circle":
            case "line":
            case "arrow": {
              currentShape.current.endingX = x;
              currentShape.current.endingY = y;
              break;
            }
          }

          existingShapes.current.push(currentShape.current);
          currentShape.current = null;
          mouseDown.current = false;

          requestAnimationFrame(redrawCanvas);
        }
      }

      function onContextMenu(event: MouseEvent) {
        event.preventDefault();
      }

      canvas.current.addEventListener("wheel", onMouseWheel);
      canvas.current.addEventListener("mousedown", onMouseDown);
      canvas.current.addEventListener("mousemove", onMouseMove);
      canvas.current.addEventListener("mouseup", onMouseUp);
      canvas.current.addEventListener("contextmenu", onContextMenu);

      return () => {
        canvas.current?.removeEventListener("wheel", onMouseWheel);
        canvas.current?.removeEventListener("mousedown", onMouseDown);
        canvas.current?.removeEventListener("mousemove", onMouseMove);
        canvas.current?.removeEventListener("mouseup", onMouseUp);
        canvas.current?.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("keydown", keyboardClick);
      };
    }
  }, [
    canvas,
    connected,
    scale,
    offsetX,
    offsetY,
    isDragging,
    lastX,
    lastY,
    color,
  ]);

  return (
    <>
      <div className="relative">
        <canvas className="bg-black" ref={canvas}></canvas>
        <div className="absolute bg-[#232329] w-[22vw] -translate-x-[50%] left-[50%] h-[50px] top-4 rounded-lg flex items-center gap-1 px-1 py-1">
          <div
            onClick={() => {
              setObject("rectangle");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              object === "rectangle"
                ? "bg-[#403E6A]"
                : "active:border active:border-[#B1AEFF]"
            )}
          >
            <Square className="text-white w-5 h-5" />
            <p className="text-neutral-400 text-[10px] absolute self-end pb-[5px] left-[34px]">
              1
            </p>
          </div>
          <div
            onClick={() => {
              setObject("circle");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              object === "circle"
                ? "bg-[#403E6A]"
                : "active:border active:border-[#B1AEFF]"
            )}
          >
            <Circle className="text-white w-5 h-5" />
            <p className="text-neutral-400 text-[10px] absolute self-end pb-[5px] left-[34px]">
              2
            </p>
          </div>
          <div
            onClick={() => {
              setObject("line");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              object === "line"
                ? "bg-[#403E6A]"
                : "active:border active:border-[#B1AEFF]"
            )}
          >
            <div className="w-4 h-px bg-white" />
            <p className="text-neutral-400 text-[10px] absolute self-end pb-[5px] left-[32px]">
              3
            </p>
          </div>
          <div
            onClick={() => {
              setObject("pencil");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              object === "pencil"
                ? "bg-[#403E6A]"
                : "active:border active:border-[#B1AEFF]"
            )}
          >
            <Pencil className="text-white w-5 h-5" />
            <p className="text-neutral-400 text-[10px] absolute self-end pb-[5px] left-[34px]">
              4
            </p>
          </div>
          <div
            onClick={() => {
              setObject("arrow");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              object === "arrow"
                ? "bg-[#403E6A]"
                : "active:border active:border-[#B1AEFF]"
            )}
          >
            <MoveRight className="text-white w-5 h-5" />
            <p className="text-neutral-400 text-[10px] absolute self-end pb-[5px] left-[34px]">
              5
            </p>
          </div>
          <div className="h-full w-px bg-[#2D2D2D] mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B] hover:border-[#B1AEFF]">
              <Palette className="text-white w-5 h-5" />
              <div
                className="w-2 h-2 rounded-full ml-2"
                style={{ backgroundColor: color }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#232329] border-[#2D2D2D]">
              {[
                { color: "white", label: "White" },
                { color: "red", label: "Red" },
                { color: "green", label: "Green" },
                { color: "blue", label: "Blue" },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.color}
                  onClick={() => setColor(item.color as Colors)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#31303B] focus:bg-[#31303B]"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white">{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-4 left-4 bg-[#1C1C1C] rounded-md flex items-center select-none">
          <button
            onClick={() => {
              const newScale = Math.max(0.1, scale - 0.1);
              setScale(newScale);
              if (redrawCanvasRef.current) {
                requestAnimationFrame(redrawCanvasRef.current);
              }
            }}
            className="px-3 py-2 hover:bg-[#2D2D2D] transition-colors"
          >
            <span className="text-white text-lg">−</span>
          </button>

          <div className="px-3 py-2 border-x border-[#2D2D2D]">
            <span className="text-white text-sm">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <button
            onClick={() => {
              const newScale = Math.min(10, scale + 0.1);
              setScale(newScale);
              if (redrawCanvasRef.current) {
                requestAnimationFrame(redrawCanvasRef.current);
              }
            }}
            className="px-3 py-2 hover:bg-[#2D2D2D] transition-colors"
          >
            <span className="text-white text-lg">+</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Canvas;
