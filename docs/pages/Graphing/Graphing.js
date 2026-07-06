//graph.js — Part 1A

"use strict";
/*==================================================
   GraphLab
   graph.js
==================================================*/

/*==================================================
   DOM References
==================================================*/
const UI = Object.freeze({
   canvas: document.getElementById("graphCanvas"),
   equationInput: document.getElementById("equationInput"),
   drawButton: document.getElementById("drawButton"),
   defaultToolButton: document.getElementById("defaultToolButton"),
   grabToolButton: document.getElementById("grabToolButton"),
   zoomInToolButton: document.getElementById("zoomInToolButton"),
   zoomOutToolButton: document.getElementById("zoomOutToolButton"),
   statusX: document.getElementById("statusX"),
   statusY: document.getElementById("statusY"),
   statusScale: document.getElementById("statusScale"),
   statusTool: document.getElementById("statusTool")
});

/*==================================================
   Canvas
==================================================*/
const ctx = UI.canvas.getContext("2d");

/*==================================================
   Graph State
==================================================*/
const Graph = {
   //------------------------------------------------
   // View
   //------------------------------------------------
   scale: 40,
   offsetX: 0,
   offsetY: 0,
   //------------------------------------------------
   // Rendering
   //------------------------------------------------
   epsilon: 0.15,
   evaluator: null,
   //------------------------------------------------
   // Canvas Metrics
   //------------------------------------------------
   width: 0,
   height: 0,
   centerX: 0,
   centerY: 0,
   devicePixelRatio: 1,
   //------------------------------------------------
   // Tool
   //------------------------------------------------
   tool: "default"
};

/*==================================================
   Pointer State
==================================================*/
const Pointer = {
   x: 0,
   y: 0,
   mathX: 0,
   mathY: 0,
   down: false,
   pointerId: null,
   startX: 0,
   startY: 0,
   startOffsetX: 0,
   startOffsetY: 0
};


//graph.js — Part 1B
/*==================================================
   Canvas Initialisation
==================================================*/
function resizeCanvas()
{
   const dpr = window.devicePixelRatio || 1;
   const cssWidth  = UI.canvas.clientWidth;
   const cssHeight = UI.canvas.clientHeight;
   UI.canvas.width  = Math.round(cssWidth * dpr);
   UI.canvas.height = Math.round(cssHeight * dpr);
   ctx.setTransform(1, 0, 0, 1, 0, 0);
   ctx.scale(dpr, dpr);
   Graph.devicePixelRatio = dpr;
   Graph.width  = cssWidth;
   Graph.height = cssHeight;
   Graph.centerX = cssWidth / 2;
   Graph.centerY = cssHeight / 2;
}

/*==================================================
   Canvas Utilities
==================================================*/
function clearCanvas()
{
   ctx.clearRect(
       0,
       0,
       Graph.width,
       Graph.height
   );
}

/*==================================================
   Canvas State Helpers
==================================================*/
function saveContext()
{
   ctx.save();
}

function restoreContext()
{
   ctx.restore();
}

//graph.js — Part 1C
/*==================================================

    Coordinate Conversion

==================================================*/

/**

 * Converts a canvas pixel location to a mathematical

 * coordinate.

 *

 * Canvas:

 *      +X → Right

 *      +Y → Down

 *

 * Math:

 *      +X → Right

 *      +Y → Up

 */

function pixelToMath(px, py)

{

    return {

        x:

            (px - Graph.centerX) / Graph.scale

            + Graph.offsetX,

        y:

            (Graph.centerY - py) / Graph.scale

            + Graph.offsetY

    };

}


/**

 * Converts a mathematical coordinate to a canvas

 * pixel location.

 */

function mathToPixel(x, y)

{

    return {

        x:

            Graph.centerX

            + (x - Graph.offsetX) * Graph.scale,

        y:

            Graph.centerY

            - (y - Graph.offsetY) * Graph.scale

    };

}


/*==================================================

    Pointer Helpers

==================================================*/

/**

 * Updates the mathematical coordinates corresponding

 * to the current pointer position.

 */

function updatePointerMathCoordinates()

{

    const point =

        pixelToMath(

            Pointer.x,

            Pointer.y

        );

    Pointer.mathX = point.x;

    Pointer.mathY = point.y;

}
 
//graph.js — Part 2A
 
/*==================================================

    Grid

==================================================*/

function drawGrid()

{

    saveContext();

    ctx.strokeStyle = "#dddddd";

    ctx.lineWidth = 1;

    ctx.beginPath();

    // ----- Vertical grid lines -----

    let startX =

        Graph.centerX

        - (Graph.offsetX * Graph.scale);

    while(startX > 0)

        startX -= Graph.scale;

    while(startX < Graph.width)

    {

        ctx.moveTo(startX, 0);

        ctx.lineTo(startX, Graph.height);

        startX += Graph.scale;

    }

    // ----- Horizontal grid lines -----

    let startY =

        Graph.centerY

        + (Graph.offsetY * Graph.scale);

    while(startY > 0)

        startY -= Graph.scale;

    while(startY < Graph.height)

    {

        ctx.moveTo(0, startY);

        ctx.lineTo(Graph.width, startY);

        startY += Graph.scale;

    }

    ctx.stroke();

    restoreContext();

}


/*==================================================

    Axes

==================================================*/

function drawAxes()

{

    saveContext();

    const origin = mathToPixel(0, 0);

    ctx.beginPath();

    ctx.strokeStyle = "#000000";

    ctx.lineWidth = 2;

    // Y axis

    ctx.moveTo(origin.x, 0);

    ctx.lineTo(origin.x, Graph.height);

    // X axis

    ctx.moveTo(0, origin.y);

    ctx.lineTo(Graph.width, origin.y);

    ctx.stroke();

    restoreContext();

}
 
//graph.js — Part 2B
/*==================================================
   Equation Renderer
==================================================*/
function drawEquation()
{
   if (typeof Graph.evaluator !== "function")
       return;
   saveContext();
   ctx.fillStyle = "#d00000";
   for (let py = 0; py < Graph.height; py++)
   {
       for (let px = 0; px < Graph.width; px++)
       {
           const point = pixelToMath(px, py);
           let value;
           try
           {
               value = Graph.evaluator(
                   point.x,
                   point.y
               );
           }
           catch (error)
           {
               restoreContext();
               alert(
                   "Runtime Error\n\n" +
                   error.message
               );
               return;
           }
           if (Number.isFinite(value) &&
               Math.abs(value) < Graph.epsilon)
           {
               ctx.fillRect(
                   px,
                   py,
                   1,
                   1
               );
           }
       }
   }
   restoreContext();
}

/*==================================================
   Drawing Pipeline
==================================================*/
function drawGraph()
{
   clearCanvas();
   drawGrid();
   drawAxes();
   drawEquation();
}

//graph.js — Part 3A
/*==================================================
   Status Bar
==================================================*/
function updateStatus()
{
   UI.statusX.textContent =
       Pointer.mathX.toFixed(3);
   UI.statusY.textContent =
       Pointer.mathY.toFixed(3);
   UI.statusScale.textContent =
       Graph.scale;
   switch (Graph.tool)
   {
       case "grab":
           UI.statusTool.textContent = "Grab";
           break;
       case "zoomin":
           UI.statusTool.textContent = "Zoom In";
           break;
       case "zoomout":
           UI.statusTool.textContent = "Zoom Out";
           break;
       default:
           UI.statusTool.textContent = "Default";
           break;
   }
}

/*==================================================
   Tool Selection
==================================================*/
function setTool(tool)
{
   Graph.tool = tool;
   UI.defaultToolButton.classList.remove("active");
   UI.grabToolButton.classList.remove("active");
   UI.zoomInToolButton.classList.remove("active");
   UI.zoomOutToolButton.classList.remove("active");
   switch (tool)
   {
       case "grab":
           UI.grabToolButton.classList.add("active");
           UI.canvas.style.cursor = "grab";
           break;
       case "zoomin":
           UI.zoomInToolButton.classList.add("active");
           UI.canvas.style.cursor = "zoom-in";
           break;
       case "zoomout":
           UI.zoomOutToolButton.classList.add("active");
           UI.canvas.style.cursor = "zoom-out";
           break;
       default:
           Graph.tool = "default";
           UI.defaultToolButton.classList.add("active");
           UI.canvas.style.cursor = "default";
           break;
   }
   updateStatus();
}

/*==================================================
   Equation Compiler
==================================================*/
function compileEquation()
{
   try
   {
       Graph.evaluator =
           new Function(
               "x",
               "y",
               UI.equationInput.value
           );
       drawGraph();
   }
   catch (error)
   {
       Graph.evaluator = null;
       alert(
           "Compilation Error\n\n" +
           error.message
       );
   }
}

//graph.js — Part 3B
/*==================================================
   Pointer Events
==================================================*/
function updatePointerFromEvent(event)
{
   const rect = UI.canvas.getBoundingClientRect();
   Pointer.x = event.clientX - rect.left;
   Pointer.y = event.clientY - rect.top;
   Pointer.mathX =
       (Pointer.x - Graph.centerX) / Graph.scale
       + Graph.offsetX;
   Pointer.mathY =
       (Graph.centerY - Pointer.y) / Graph.scale
       + Graph.offsetY;
}

function canvasPointerMove(event)
{
   updatePointerFromEvent(event);
   if (Pointer.down && Graph.tool === "grab")
   {
       const dx =
           Pointer.x - Pointer.startX;
       const dy =
           Pointer.y - Pointer.startY;
       Graph.offsetX =
           Pointer.startOffsetX
           - dx / Graph.scale;
       Graph.offsetY =
           Pointer.startOffsetY
           + dy / Graph.scale;
       drawGraph();
   }
   updateStatus();
}

function canvasPointerDown(event)
{
   updatePointerFromEvent(event);
   Pointer.down = true;
   Pointer.pointerId = event.pointerId;
   UI.canvas.setPointerCapture(event.pointerId);
   Pointer.startX = Pointer.x;
   Pointer.startY = Pointer.y;
   Pointer.startOffsetX = Graph.offsetX;
   Pointer.startOffsetY = Graph.offsetY;
   // -------------------------
   // ZOOM+ TOOL
   // -------------------------
   if (Graph.tool === "zoomin")
   {
       Graph.scale += 10;
       Graph.offsetX = Pointer.mathX;
       Graph.offsetY = Pointer.mathY;
       drawGraph();
   }
   // -------------------------
   // ZOOM− TOOL
   // -------------------------
   if (Graph.tool === "zoomout")
   {
       Graph.scale =
           Math.max(1, Graph.scale - 10);
       Graph.offsetX = Pointer.mathX;
       Graph.offsetY = Pointer.mathY;
       drawGraph();
   }
   // -------------------------
   // GRAB TOOL
   // -------------------------
   if (Graph.tool === "grab")
   {
       UI.canvas.style.cursor = "grabbing";
   }
   updateStatus();
}

function canvasPointerUp(event)
{
   updatePointerFromEvent(event);
   if (Pointer.pointerId !== null)
   {
       UI.canvas.releasePointerCapture(
           Pointer.pointerId
       );
   }
   Pointer.pointerId = null;
   Pointer.down = false;
   if (Graph.tool === "grab")
   {
       UI.canvas.style.cursor = "grab";
   }
   updateStatus();
}

/*==================================================
   Event Registration
==================================================*/
UI.canvas.addEventListener(
   "pointermove",
   canvasPointerMove
);
UI.canvas.addEventListener(
   "pointerdown",
   canvasPointerDown
);
UI.canvas.addEventListener(
   "pointercancel",
   canvasPointerUp
);
window.addEventListener(
   "pointerup",
   canvasPointerUp
);

UI.drawButton.addEventListener(
   "click",
   compileEquation
);

UI.defaultToolButton.addEventListener(
   "click",
   () => setTool("default")
);
UI.grabToolButton.addEventListener(
   "click",
   () => setTool("grab")
);
UI.zoomInToolButton.addEventListener(
   "click",
   () => setTool("zoomin")
);
UI.zoomOutToolButton.addEventListener(
   "click",
   () => setTool("zoomout")
);

window.addEventListener(
   "resize",
   () =>
   {
       resizeCanvas();
       drawGraph();
   }
);

/*==================================================
   Application Startup
==================================================*/
function initialise()
{
   resizeCanvas();
   setTool("default");
   updatePointerMathCoordinates();
   updateStatus();
   compileEquation();
}

initialise();
