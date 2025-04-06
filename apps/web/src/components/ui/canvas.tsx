"use client";

import { useWebsocket } from "@/hooks/useWebsocket";
import { getMousePosition } from "@/lib/get-mouse-position";
import { showRectangle } from "@/lib/show-rectangle";
import { makeRectangle } from "@/lib/make-rectangle";
import { cn } from "@/lib/utils";
import { Circle, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { showCircle } from "@/lib/show-circle";
import { makeCircle } from "@/lib/make-circle";

type Objects = "rectangle" | "circle";

export type ExistingShapes = {
  shape: "rectangle";
  startingX: number;
  startingY: number;
  endingX: number;
  endingY: number;
} | {
    shape: "circle";
    x: number;
    y: number;
    radius: number;
    startingX: number;
    startingY: number
}

const Canvas = () => {
  const existingShapes = useRef<ExistingShapes[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const startingX = useRef<number>(0);
  const startingY = useRef<number>(0);
  const mouseDown = useRef<boolean>(false);
  const { connected, data, error, sendMessage } = useWebsocket(
    "ws://localhost:8080"
  );
  const [shape, setShape] = useState<Objects>("circle");

  useEffect(() => {
    if (canvas.current && connected) {
      sendMessage({
        type: "join_canvas",
      });

      // Setting the height and the width of the canvas as of the current window size
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
      
      canvas.current.addEventListener("mousedown", (e) => {
        const { x, y } = getMousePosition(canvas.current!, e);
        // Setting starting X and Y
        startingX.current = x;
        startingY.current = y;
        mouseDown.current = true;
      });

      canvas.current.addEventListener("mousemove", (e) => {
        if (mouseDown.current) {
          const { x, y } = getMousePosition(canvas.current!, e);
          switch (shape) {
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
              showCircle(x, y, Math.abs(x - y), 0, 2 * Math.PI, canvas.current!, startingX.current, startingY.current, existingShapes.current)
              break;
            }
          }
        }
      });

      canvas.current.addEventListener("mouseup", (e) => {
        const { x, y } = getMousePosition(canvas.current!, e);
        switch (shape) {
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
                  });
              break;
            }
            case "circle": {
              makeCircle(x, y, canvas.current!, startingX.current, startingY.current)
              existingShapes.current.push({
                shape: "circle",
                x: x,
                y: y,
                startingX: startingX.current,
                startingY: startingY.current,
                radius: Math.abs(x - y),
            })
              break;
            }
        }

        mouseDown.current = false;
      });
    }
  }, [canvas, connected]);

  return (
    <>
      <div className="relative">
        <canvas className="bg-black" ref={canvas}></canvas>
        <div className="absolute bg-[#232329] w-[50vw] translate-x-[50%] h-[50px] top-4 rounded-lg flex items-center gap-1 px-1 py-1">
          <div
            onClick={() => {
              setShape("rectangle");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              shape === "rectangle"
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
              setShape("circle");
            }}
            className={cn(
              "flex items-center gap-px h-full cursor-pointer bg-[#31303B] px-3 rounded-lg relative border border-[#31303B]",
              shape === "circle"
                ? "bg-[#403E6A]"
                : "active:border active:border-[#B1AEFF]"
            )}
          >
            <Circle className="text-white w-5 h-5" />
            <p className="text-neutral-400 text-[10px] absolute self-end pb-[5px] left-[34px]">
              2
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Canvas;
