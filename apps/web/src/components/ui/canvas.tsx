"use client";

import { useWebsocket } from "@/hooks/useWebsocket";
import { getMousePosition } from "@/lib/get-mouse-position";
import { showRectangle } from "@/lib/show-rectangle";
import { makeRectangle } from "@/lib/make-rectangle";
import { cn } from "@/lib/utils";
import { Circle, Pencil, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { showCircle } from "@/lib/show-circle";
import { makeCircle } from "@/lib/make-circle";
import { showLine } from "@/lib/show-line";
import { makeLine } from "@/lib/make-line";
import { makeDashedRectangle } from "@/lib/make-dashed-rectangle";

type Objects = "rectangle" | "circle" | "line" | "pencil";

export interface Rectangle {
  shape: "rectangle";
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
  isDragging: boolean;
}

export interface Line {
  shape: "line",
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
  isDragging: boolean;
}

export interface Circle {
  shape: "circle";
  x: number;
  y: number;
  radius: number;
  startingX: number;
  startingY: number;
  isDragging: boolean;
}

export interface Pencil {
  shape: "pencil"; 
}

export type ExistingShapes = Rectangle | Circle | Line;

const Canvas = () => {
  const existingShapes = useRef<ExistingShapes[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const startingX = useRef<number>(0);
  const startingY = useRef<number>(0);
  const mouseDown = useRef<boolean>(false);
  const mouseDownEvent = useRef<any>(null);
  const mouseUpEvent = useRef<any>(null);
  const mouseMoveEvent = useRef<any>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const { connected, sendMessage } = useWebsocket(
    "ws://localhost:8080"
  );
  const [object, setObject] = useState<Objects>("rectangle");
  const shape = useRef<Objects>("rectangle");

  useEffect(() => {
    shape.current = object;
  }, [object]);

  useEffect(() => {
    if (canvas.current && connected) {
      sendMessage({
        type: "join_canvas",
      });

      // Setting the height and the width of the canvas as of the current window size
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;

      mouseDownEvent.current = canvas.current.addEventListener(
        "mousedown",
        (e) => {
          const { x, y } = getMousePosition(canvas.current!, e);
          // Setting starting X and Y
          startingX.current = x;
          startingY.current = y;
          mouseDown.current = true;
          if (shape.current === 'pencil') {
            const ctx = canvas.current!.getContext("2d");
            if (!ctx) return;
            ctx.beginPath();
            ctx.moveTo(x, y);
            setDrawing(true);
          }
        }
      );

      mouseMoveEvent.current = canvas.current.addEventListener(
        "mousemove",
        (e) => {
          if (mouseDown.current) {
            const { x, y } = getMousePosition(canvas.current!, e);
            switch (shape.current) {
              case "rectangle": {
                showRectangle(
                  startingX.current,
                  startingY.current,
                  x - startingX.current,
                  y - startingY.current,
                  canvas.current!,
                  existingShapes.current
                );
                break;
              }
              case "circle": {
                showCircle(
                  x,
                  y,
                  Math.abs(x - y),
                  0,
                  2 * Math.PI,
                  canvas.current!,
                  startingX.current,
                  startingY.current,
                  existingShapes.current
                );
                break;
              }
              case "line": {
                const { x, y } = getMousePosition(canvas.current!, e);
                showLine(canvas.current!, existingShapes.current, startingX.current, startingY.current, x, y)
                break;
              }
              case "pencil": {
                const ctx = canvas.current!.getContext("2d");
                if (!ctx) return;
                ctx.lineTo(x, y);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.stroke();
                break;
              }
            }
          }
        }
      );

      mouseUpEvent.current = canvas.current.addEventListener("mouseup", (e) => {
        const { x, y } = getMousePosition(canvas.current!, e);
        console.log(x, y)
        console.log(startingX.current, startingY.current)
        switch (shape.current) {
          case "rectangle": {
            makeRectangle(
              startingX.current,
              startingY.current,
              x - startingX.current,
              y - startingY.current,
              canvas.current!
            );
            existingShapes.current.push({
              shape: "rectangle",
              startingX: startingX.current,
              startingY: startingY.current,
              endingX: x - startingX.current,
              endingY: y - startingY.current,
              isDragging: false,
            });
            if (x > startingX.current) {
              makeDashedRectangle(
                startingX.current - 10,
                startingY.current - 10,
                x - startingX.current + 20,
                y - startingY.current + 20,
                canvas.current!
              );
            } else {
              makeDashedRectangle(
                startingX.current + 10,
                startingY.current - 10,
                x - startingX.current - 20,
                y - startingY.current + 20,
                canvas.current!
              );
            }
            break;
          }
          case "circle": {
            makeCircle(
              x,
              y,
              canvas.current!,
              startingX.current,
              startingY.current
            );
            existingShapes.current.push({
              shape: "circle",
              x: x,
              y: y,
              startingX: startingX.current,
              startingY: startingY.current,
              radius: Math.abs(x - y),
              isDragging: false,
            });
            break;
          }
          case "line": {
            const { x, y } = getMousePosition(canvas.current!, e);
            makeLine(canvas.current!, existingShapes.current, startingX.current, startingY.current, x, y)
            existingShapes.current.push({
              shape: "line",
              startingX: startingX.current,
              startingY: startingY.current,
              endingX: x,
              endingY: y,
              isDragging: false,
            });
          }
          // TODO: Push the drawing to the ExisitingShapes array
          case "pencil": {
            const ctx = canvas.current!.getContext("2d");
            if (!ctx) return;
            ctx.closePath();
            setDrawing(false);
          }
        }

        mouseDown.current = false;
      });
    }

    return () => {
      canvas.current?.removeEventListener("mousedown", mouseDownEvent.current);
      canvas.current?.removeEventListener("mouseup", mouseUpEvent.current);
      canvas.current?.removeEventListener("mousemove", mouseMoveEvent.current);
    };
  }, [canvas, connected]);

  return (
    <>
      <div className="relative">
        <canvas className="bg-black" ref={canvas}></canvas>
        <div className="absolute bg-[#232329] w-[50vw] translate-x-[50%] h-[50px] top-4 rounded-lg flex items-center gap-1 px-1 py-1">
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
        </div>
      </div>
    </>
  );
};

export default Canvas;
