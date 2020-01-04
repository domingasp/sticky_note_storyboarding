// Reference to the note in the HTML
var elementDragged;

// Variable to control whether a mouse button has been pressed. Used to allow the dragging of notes over other notes.
var mouseDown = false;

// Used to ensure that buttons do not activate when the user starts dragging from the button
var originalMouseX = 0;
var originalMouseY = 0;
var newMouseX = 0;
var newMouseY = 0;

var xOnLeave = 0;
var yOnLeave = 0;

// Used for layering of notes
var highestZIndex = 1;

// Keeps track of the color of all notes
var colorOfAllNotes = "Yellow";

// Used to check if the brush/eraser tool is activated
var activatedTool = "pointer";
var brushActivated = false;
var eraserToolActivated = false;
var dropperToolActivated = false;

// ########################################## Drawing on the canvas ########################################## //

// Variables for different components of the drawing functionality
var canvas, ctx, canvasCtx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

    var canvasElement, cursorCanvasElement;

// Sets the color and width of the brush, and width of the eraser (in px)
var brushColor = "black";
var brushStrokeWidth = 4;
var eraserStrokeWidth = 20;

// Waits until the page has loaded to intialize the canvas
$(document).ready(function() {
    canvasElement = document.getElementById("can");
    cursorCanvasElement = document.getElementById("cursorCan");
    canvasElement.setAttribute("height", "3000px");
    canvasElement.setAttribute("width", document.body.scrollWidth);

    cursorCanvasElement.setAttribute("height", "3000px");
    cursorCanvasElement.setAttribute("width", document.body.scrollWidth);

    intializeCanvas();
});

// Adds evet listeners to the canvas to enable drawing
function intializeCanvas() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    cursorCtx = document.getElementById("cursorCan").getContext("2d");
    ctx.lineCap = "round";
    w = canvas.width;
    h = canvas.height;
    
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);

    canvas.addEventListener("touchmove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("touchstart", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("touchend", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("touchcancel", function (e) {
        findxy('out', e)
    }, false);
}

var buffer = document.getElementById("buffer");

window.onresize = function (event) {
    var newW = $(window).width();
    buffer.width = newW;
    buffer.getContext("2d").drawImage(canvas, 0, 0);

    canvasElement.width = newW;
    canvasElement.getContext("2d").drawImage(buffer, 0, 0);

    this.ctx.lineCap = "round";

    cursorCanvasElement.width = newW;

    w = newW;
}

// Calculates the XY to enable drawing
function findxy(res, e) {
    // Can only run if one of the tools has been activated
    if (brushActivated || eraserToolActivated || dropperToolActivated) {
        e = e || window.event;
        e.preventDefault();
        
        // When dropper tool not activated allow mouse down event on the canvas
        if (!dropperToolActivated) {
            // Runs when the mouse is clicked
            if (res == 'down') {
                prevX = currX;
                prevY = currY;
                currX = e.pageX - canvas.offsetLeft; //clientX
                currY = e.pageY - canvas.offsetTop; //clientY

                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    ctx.beginPath();
                    ctx.fillStyle = brushColor;
                    ctx.fillRect(currX, currY, 2, 2);
                    ctx.closePath();;

                    // Used to draw a circle on mouse click
                    prevX = currX;
                    prevY = currY;
                    currX = e.pageX - canvas.offsetLeft; //clientX
                    currY = e.pageY - canvas.offsetTop; //clientY
                    draw();

                    dot_flag = false;
                }
            }
        }

        // Runs when the mouse button is lifted up or the mouse leaves the canvas
        if (res == 'up' || res == "out") {
            flag = false;

            xOnLeave = e.pageX - canvas.offsetLeft; //clientX
            yOnLeave = e.pageY - canvas.offsetTop; //clientY

            // If dropper tool is activated then on mouse up get the color, set the brush color, the visual and the active tool to the pointer tool
            if (dropperToolActivated && res == "up") {
                brushColor = getPixelColor(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop); //clientX, clientY

                document.getElementById("brushColorBtn").value = brushColor;

                activatePreviouslyActivatedTool();
            }
        }

        // Runs everytime the mouse is moved
        if (res == 'move') {

            drawCircleAtMouse(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop); //clientX, clientY

            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.pageX - canvas.offsetLeft; //clientX
                currY = e.pageY - canvas.offsetTop; //clientY
                draw();
            }
        }
    }
}

// Creates the drawn line
function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = brushColor;
    
    // Checks which tool is activated (brush or eraser) and selects the appropriate stroke width
    if (brushActivated) {
        ctx.lineWidth = brushStrokeWidth;
    } else if (eraserToolActivated) {
        ctx.lineWidth = eraserStrokeWidth;
    }

    ctx.stroke();
    ctx.closePath();
}

// Used to draw the cursor at the mouse, takes a x and y coordinate to know the location of the mouse
function drawCircleAtMouse(xCoord, yCoord) {
    // Clears the upper canvas before redrawing a circle cursor at the mouse position
    cursorCtx.clearRect(0, 0, w, h);
    document.getElementById("cursorCan").style.pointerEvents = "auto";
    
    cursorCtx = document.getElementById("cursorCan").getContext("2d");
    cursorCtx.beginPath();

    // Checks which tool is activated and selectes the stroke width accordingly. It is divided by 2 to get the correct radius.
    if (brushActivated) {
        cursorCtx.arc(xCoord, yCoord, brushStrokeWidth/2, 0, 2 * Math.PI, false);
    } else if (eraserToolActivated) {
        cursorCtx.arc(xCoord, yCoord, eraserStrokeWidth/2, 0, 2 * Math.PI, false);
    }

    // Color set to black
    cursorCtx.strokeStyle = "#000000";
    cursorCtx.stroke();

    // Draws a circle half a pixel larger with a white moderately transparent color, used so that the cursor can be seen no matter the color
    cursorCtx.beginPath();
    if (brushActivated) {
        cursorCtx.arc(xCoord, yCoord, (brushStrokeWidth/2) + 1, 0, 2 * Math.PI, false);
    } else if (eraserToolActivated) {
        cursorCtx.arc(xCoord, yCoord, (eraserStrokeWidth/2) + 1, 0, 2 * Math.PI, false);
    }
    cursorCtx.strokeStyle = "#FFFFFF66";
    cursorCtx.stroke();

    // Draws a circle half a pixel smaller with a white moderately transparent color, used so that the cursor can be seen no matter the color
    cursorCtx.beginPath();
    if (brushActivated && brushStrokeWidth > 1) {
        cursorCtx.arc(xCoord, yCoord, (brushStrokeWidth/2) - 1, 0, 2 * Math.PI, false);
    } else if (eraserToolActivated && eraserStrokeWidth > 1) {
        cursorCtx.arc(xCoord, yCoord, (eraserStrokeWidth/2) - 1, 0, 2 * Math.PI, false);
    }
    cursorCtx.strokeStyle = "#FFFFFF66";
    cursorCtx.stroke();

    // Sets the cursorCan pointerEvents to none to ensure that the user interacts with the bottom drawing layer
    document.getElementById("cursorCan").style.pointerEvents = "none";
}

// Disables all tools and re-enables note interaction
function activatePointerTool(toolBtn) {
    activatedTool = "pointer";
    
    brushActivated = false;
    eraserToolActivated = false;
    dropperToolActivated = false;

    cursorCtx.clearRect(0, 0, w, h);
    document.getElementById("can").style.cursor = "default"
    
    showStrokeWidthInputs("none");

    noteInteraction(true);
    changeActiveToolHighlight(toolBtn);
}

// Activates the brush too and disables pointer events on the notes. This is to enable the drawing to go behind the notes.
function activateBrushTool(state, toolBtn) {
    if (state == "") {
        if (brushActivated) {
            activatePointerTool(document.getElementById("pointerToolBtn"));
        } else {
            activatedTool = "brush";
            brushActivated = true;
            eraserToolActivated = false;
            dropperToolActivated = false;

            document.getElementById("can").style.cursor = "none";
            
            showStrokeWidthInputs("brush");

            drawCircleAtMouse(xOnLeave, yOnLeave);
            
            noteInteraction(false);
            changeActiveToolHighlight(toolBtn);

            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = brushColor;
            ctx.strokeStyle = brushStrokeWidth;
        }
    } else if ("turnOff") {
        activatePointerTool(document.getElementById("pointerToolBtn"));
    } else if ("turnOn") {
        activatedTool = "brush";
        brushActivated = true;
        eraserToolActivated = false;
        dropperToolActivated = false;

        document.getElementById("can").style.cursor = "none";
        
        showStrokeWidthInputs("brush");

        drawCircleAtMouse(xOnLeave, yOnLeave);
        
        noteInteraction(false);
        changeActiveToolHighlight(toolBtn);

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = brushColor;
        ctx.strokeStyle = brushStrokeWidth;
    }
}

// Eraser tool
function activateEraserTool(toolBtn) {
    if (!eraserToolActivated) {
        activatedTool = "eraser";
        brushActivated = false;
        eraserToolActivated = true;
        dropperToolActivated = false;
        
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = 'rgba(255,0,0,0.5);';
        ctx.strokeStyle = 'rgba(255,0,0,0.5);';

        document.getElementById("can").style.cursor = "none"

        showStrokeWidthInputs("eraser");

        drawCircleAtMouse(xOnLeave, yOnLeave);

        noteInteraction(false);
        changeActiveToolHighlight(toolBtn);
    } else {
        activatePointerTool(document.getElementById("pointerToolBtn"));
    }
}

// Erases all lines from the canvas
function eraseWholeCanvas() {
    var m = confirm("Are you sure you want to clear the canvas? All current brush strokes will be lost!");
    if (m) {
        ctx.clearRect(0, 0, w, h);
    }

    activatePointerTool(document.getElementById("pointerToolBtn"));
}

// Eye dropper tool
function activateDropperTool(toolBtn) {
    if (!dropperToolActivated) {
        brushActivated = false;
        eraserToolActivated = false;
        dropperToolActivated = true;

        cursorCtx.clearRect(0, 0, w, h);

        document.getElementById("can").style.cursor = "crosshair"

        showStrokeWidthInputs("none");

        noteInteraction(false);
        changeActiveToolHighlight(toolBtn);
    } else {
        activatePointerTool(document.getElementById("pointerToolBtn"));
    }
}

// Returns the pixel color value in HEX
function getPixelColor(x, y) {
    var pxData = ctx.getImageData(x,y,1,1).data;

    var hexColor = "#";

    for (i = 0; i < 3; i++) {
        var currentHex = pxData[i].toString(16);
        if (currentHex.length == 1) {
            hexColor += "0" + currentHex;
        } else {
            hexColor += currentHex;
        }
    }

    return hexColor;
}

// Activates the tool that was active before the dropper tool was selected
function activatePreviouslyActivatedTool() {
    brushActivated = false;
    eraserToolActivated = false;
    dropperToolActivated = false;

    switch (activatedTool) {
        case "pointer":
            activatePointerTool(document.getElementById("pointerToolBtn"));
            break;
        case "brush":
            activateBrushTool("", document.getElementById("brushToolBtn"));
            break;
        case "eraser":
            activateEraserTool(document.getElementById("eraserToolBtn"))
            break;
    }
}

// Toggles whether note divs accept pointer events or not
function noteInteraction(notesUsable) {
    if (notesUsable) {
        for (let note of document.getElementsByClassName("div--draggable")) {
            note.style.pointerEvents = "";
        }
    } else {
        for (let note of document.getElementsByClassName("div--draggable")) {
            note.style.pointerEvents = "none";
        }
    }
}

// Changes the color of the selected tool, visual cue that shows the user their current tool
function changeActiveToolHighlight(toolSelected) {
    for (let tool of document.getElementsByClassName("top--banner__btn--tool")) {
        tool.classList = "";
        if (tool != toolSelected) {
            tool.classList.add("top--banner__btn--tool");
        }
    }

    for (let tool of document.getElementsByClassName("top--banner__btn--tool--selected")) {
        tool.classList = "";
        if (tool != toolSelected) {
            tool.classList.add("top--banner__btn--tool");
        }
    }

    toolSelected.classList.add("top--banner__btn--tool--selected");
}

// Changes the brush/eraser tool width and updates the slider and input values to match each other
function changeToolWidth(newWidth, elementChanged) {
    var slider, input;

    if (brushActivated) {
        slider = document.getElementById("brushWidthSlider");
        input = document.getElementById("brushWidthInput");

        changeBrushWidth(newWidth);
    } else if (eraserToolActivated) {
        slider = document.getElementById("eraserWidthSlider");
        input = document.getElementById("eraserWidthInput");

        changeEraserWidth(newWidth);
    }

    drawCircleAtMouse(xOnLeave, yOnLeave);

    if (elementChanged == "slider") {
        // Update the input value
        input.value = slider.value;
    } else {
        // Update the slider value
        slider.value = input.value;
    }
}

// Change the brush width
function changeBrushWidth(newWidth) {
    brushStrokeWidth = newWidth;
}

// Change the eraser width
function changeEraserWidth(newWidth) {
    eraserStrokeWidth = newWidth;
}

// Changes the brushes color everytime a color is chosen from the color picker
function changeBrushColor(colorPicker) {
    brushColor = colorPicker.value;
}

// Shows the correct slider, input and units depending whether brush or eraser is selected
function showStrokeWidthInputs(brushOrEraserSelected) {
    if (brushOrEraserSelected == "brush") {
        document.getElementById("brushWidthSlider").style.display = "inline-block";
        document.getElementById("brushWidthInput").style.display = "inline-block";

        document.getElementById("eraserWidthSlider").style.display = "none";
        document.getElementById("eraserWidthInput").style.display = "none";

        document.getElementById("strokeWidthUnitsSpan").style.display = "inline-block";
    } else if (brushOrEraserSelected == "eraser") {
        document.getElementById("brushWidthSlider").style.display = "none";
        document.getElementById("brushWidthInput").style.display = "none";

        document.getElementById("eraserWidthSlider").style.display = "inline-block";
        document.getElementById("eraserWidthInput").style.display = "inline-block";

        document.getElementById("strokeWidthUnitsSpan").style.display = "inline-block";
    } else if (brushOrEraserSelected == "none") {
        document.getElementById("brushWidthSlider").style.display = "none";
        document.getElementById("brushWidthInput").style.display = "none";

        document.getElementById("eraserWidthSlider").style.display = "none";
        document.getElementById("eraserWidthInput").style.display = "none";

        document.getElementById("strokeWidthUnitsSpan").style.display = "none";
    }
}

// ########################################## END Drawing on the canvas ########################################## //

// ########################################## Note interactions ########################################## //

// Used to check whether a note textarea is being edited
var editingNoteTextarea = false;

// Sets the editingNoteTextarea to true and give the note textarea focus
function editingNoteText(noteTextarea) {
    editingNoteTextarea = true;

    noteTextarea.focus();

    // Ensures that the cursor is moved to the start of the textarea
    var currentValue = noteTextarea.value;
    noteTextarea.value = "";
    noteTextarea.value = currentValue;
}

// Sets the editingNoteTextarea to false
function cancelEditingNoteText() {
    editingNoteTextarea = false;
}

// Sets the element that is to be dragged, gives the element focus and sets the .onmousedown response
function dragElement(element) {
    if (!brushActivated) {
        if (!mouseDown) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            elementDragged = element;

            element.onmousedown = dragMouseDown;
        }
    }
}

// Registers the mouse down event, mouseDown variable is set to true. Assigns responses for document's .onmouseup and .onmousemove
function dragMouseDown(e) {
    if (!editingNoteTextarea) {
        e = e || window.event;
        e.preventDefault();

        document.activeElement.blur()

        // Used to prevent focus shifting to overlapping notes
        mouseDown = true;
            
        originalMouseX = e.pageX; //clientX
        originalMouseY = e.pageY; //clientY
        newMouseX = e.pageX; //clientX
        newMouseY = e.pageY; //clientY

        pos3 = e.pageX; //clientX
        pos4 = e.pageY; //clientY
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
}

// Updates the dragged elements position to move it but only if the mouse button has been pressed in other words if mouseDown variable is true
function elementDrag(e) {
    if (mouseDown) {
        e = e || window.event;
        e.preventDefault();
        
        pos1 = pos3 - e.pageX; //clientX
        pos2 = pos4 - e.pageY; //clientY
        pos3 = e.pageX; //clientX
        pos4 = e.pageY; //clientY

        elementDragged.style.top = (elementDragged.offsetTop - pos2) + "px";
        elementDragged.style.left = (elementDragged.offsetLeft - pos1) + "px";
    }
}

// Resets the documents response to the .onmouseup and .onmousemove. Also sets the mouseDown variable to false to allow notes to be dragged.
function closeDragElement(e) {
    document.onmouseup = null;
    document.onmousemove = null;

    newMouseX = e.pageX; //clientX
    newMouseY = e.pageY; //clientY

    mouseDown = false;
}

// Creates a new note div and adds it to the HTML
function createNewNote(e) {
    e = e || window.event;
    // Creates the div element and adds the correct classes and sets the attributes
    var newNoteMainDiv = document.createElement("div");
    newNoteMainDiv.classList.add("div--draggable");
    newNoteMainDiv.setAttribute("onmouseover", "dragElement(this)");
    newNoteMainDiv.style.top = (window.scrollY + 55) + "px";
    newNoteMainDiv.style.zIndex = ++highestZIndex;
   
    // Creates the div element and adds the correct classes
    var newNoteTopDiv = document.createElement("div");
    newNoteTopDiv.classList.add("div--draggable__top--banner");

    // Creates the button element and adds the correct classes, sets the attributes and adds "X" text
    var newNoteFWDButton = document.createElement("button");
    newNoteFWDButton.classList.add("div--draggable__top--banner__btn--moveup");
    newNoteFWDButton.setAttribute("onclick", "moveNoteLayerForward(this)");
    newNoteFWDButton.innerHTML = '<i class="fas fa-arrow-circle-up"></i>';

    // Creates the button element and adds the correct classes, sets the attributes and adds "X" text
    var newNoteBWDButton = document.createElement("button");
    newNoteBWDButton.classList.add("div--draggable__top--banner__btn--movedown");
    newNoteBWDButton.setAttribute("onclick", "moveNoteLayerBackwards(this)");
    newNoteBWDButton.innerHTML = '<i class="fas fa-arrow-circle-down"></i>';

    // Creates the separator line
    var newNoteSeparatorSpan = document.createElement("span");
    newNoteSeparatorSpan.classList.add("div--draggable__top--banner__separator");
    newNoteSeparatorSpan.innerHTML = "|";

    // Creates the color button and adds the correct classes
    var newNoteYellowButton = document.createElement("button");
    newNoteYellowButton.style.backgroundColor = "#FDFD96";
    newNoteYellowButton.setAttribute("onclick", "changeIndividualNoteColor('Yellow', this)");
    newNoteYellowButton.innerHTML = '<i class="far fa-sticky-note"></i>';

    // Creates the color button and adds the correct classes
    var newNotePinkButton = document.createElement("button");
    newNotePinkButton.style.backgroundColor = "#de528a";
    newNotePinkButton.setAttribute("onclick", "changeIndividualNoteColor('Pink', this)");
    newNotePinkButton.innerHTML = '<i class="far fa-sticky-note"></i>';

    // Creates the color button and adds the correct classes
    var newNoteBlueButton = document.createElement("button");
    newNoteBlueButton.style.backgroundColor = "#38a1c5";
    newNoteBlueButton.setAttribute("onclick", "changeIndividualNoteColor('Blue', this)");
    newNoteBlueButton.innerHTML = '<i class="far fa-sticky-note"></i>';

    // Creates the color button and adds the correct classes
    var newNoteGreenButton = document.createElement("button");
    newNoteGreenButton.style.backgroundColor = "#A6EF3E";
    newNoteGreenButton.setAttribute("onclick", "changeIndividualNoteColor('Green', this)");
    newNoteGreenButton.innerHTML = '<i class="far fa-sticky-note"></i>';

    // Creates the button element and adds the correct classes, sets the attributes and adds "X" text
    var newNoteDeleteButton = document.createElement("button");
    newNoteDeleteButton.classList.add("div--draggable__top--banner__btn--delete");
    newNoteDeleteButton.setAttribute("onclick", "deleteNote(this)");
    newNoteDeleteButton.innerHTML = "X";

    // Creates the textarea element and adds the correct classes, sets the attributes and adds "New Note" text
    var newNoteTextarea = document.createElement("textarea");
    newNoteTextarea.classList.add("div--draggable__textarea");
    newNoteTextarea.setAttribute("type", "input");
    newNoteTextarea.setAttribute("ondblclick", "editingNoteText(this)");
    newNoteTextarea.setAttribute("onblur", "cancelEditingNoteText(this)");
    newNoteTextarea.innerHTML = "New Note";

    // Adds elements to the top div in the note
    newNoteTopDiv.append(newNoteFWDButton);
    newNoteTopDiv.append(newNoteBWDButton);
    newNoteTopDiv.append(newNoteSeparatorSpan);
    newNoteTopDiv.append(newNoteYellowButton);
    newNoteTopDiv.append(newNotePinkButton);
    newNoteTopDiv.append(newNoteBlueButton);
    newNoteTopDiv.append(newNoteGreenButton);
    newNoteTopDiv.append(newNoteDeleteButton);
    
    // Adds the textarea and delete buttons to the div
    newNoteMainDiv.append(newNoteTopDiv);
    newNoteMainDiv.append(newNoteTextarea);

    // Adds the div to the main div
    document.getElementsByClassName("main--div")[0].appendChild(newNoteMainDiv);

    // Sets the correct color of a new note depending on the button selected
    switch (colorOfAllNotes) {
        case "Yellow":
            newNoteMainDiv.style.backgroundColor = "#FDFD96";
            newNoteMainDiv.style.borderColor = "#EAEA8A";
            newNoteTopDiv.style.backgroundColor = "#EAEA8A";

            newNoteYellowButton.classList.add("div--draggable__top--banner__btn--color--selected");
            newNotePinkButton.classList.add("div--draggable__top--banner__btn--color");
            newNoteBlueButton.classList.add("div--draggable__top--banner__btn--color");
            newNoteGreenButton.classList.add("div--draggable__top--banner__btn--color");
        break;
        case "Pink":
            newNoteMainDiv.style.backgroundColor = "#de528a";
            newNoteMainDiv.style.borderColor = "#c44176";
            newNoteTopDiv.style.backgroundColor = "#c44176";

            newNoteYellowButton.classList.add("div--draggable__top--banner__btn--color");
            newNotePinkButton.classList.add("div--draggable__top--banner__btn--color--selected");
            newNoteBlueButton.classList.add("div--draggable__top--banner__btn--color");
            newNoteGreenButton.classList.add("div--draggable__top--banner__btn--color");
        break;
        case "Blue":
            newNoteMainDiv.style.backgroundColor = "#38a1c5";
            newNoteMainDiv.style.borderColor = "#2d8dad";
            newNoteTopDiv.style.backgroundColor = "#2d8dad";

            newNoteYellowButton.classList.add("div--draggable__top--banner__btn--color");
            newNotePinkButton.classList.add("div--draggable__top--banner__btn--color");
            newNoteBlueButton.classList.add("div--draggable__top--banner__btn--color--selected");
            newNoteGreenButton.classList.add("div--draggable__top--banner__btn--color");
        break;
        case "Green":
            newNoteMainDiv.style.backgroundColor = "#A6EF3E";
            newNoteMainDiv.style.borderColor = "#90d134";
            newNoteTopDiv.style.backgroundColor = "#90d134";

            newNoteYellowButton.classList.add("div--draggable__top--banner__btn--color");
            newNotePinkButton.classList.add("div--draggable__top--banner__btn--color");
            newNoteBlueButton.classList.add("div--draggable__top--banner__btn--color");
            newNoteGreenButton.classList.add("div--draggable__top--banner__btn--color--selected");
        break;
    }

    // Activates the pointer tool any time a new note is created
    activatePointerTool(document.getElementById("pointerToolBtn"));

    // Ensures the brush/eraser cursor is always displayed on top of any notes
    document.getElementById("cursorCan").style.zIndex = highestZIndex + 1;
    document.getElementsByClassName("top--banner")[0].style.zIndex = highestZIndex + 2;
}

// Delete a note
function deleteNote(noteToDelete) {
    if (originalMouseX == newMouseX && originalMouseY == newMouseY) {
        document.getElementsByClassName("main--div")[0].removeChild(noteToDelete.parentNode.parentNode);
    }
}

// Deletes all notes
function deleteAllNotes() {
    var m = confirm("Are you sure you want to delete all notes? All current notes will be lost!");
    if (m) {
        var allNotes = document.getElementsByClassName("div--draggable")
    
        while (allNotes[0]) {
            allNotes[0].parentNode.removeChild(allNotes[0]);
        }

        highestZIndex = 0;

        activatePointerTool(document.getElementById("pointerToolBtn"));
    }
}

// Moves a note layer forward
function moveNoteLayerForward(element) {
    if (originalMouseX == newMouseX && originalMouseY == newMouseY) {
        var currentClosestElement = element.parentNode.parentNode;
        var currentClosestDifference = highestZIndex;

        // Searches for the closest difference between z-indexes
        $(".div--draggable").each(function(){;       
            var currentDifference = $(this).css("z-index") - parseInt(element.parentNode.parentNode.style.zIndex);
            if (currentDifference > 0) {
                if (currentDifference < currentClosestDifference) {
                    currentClosestElement = $(this)[0];
                    currentClosestDifference = parseInt(currentClosestElement.style.zIndex) - parseInt(element.parentNode.parentNode.style.zIndex);
                }
            }
        });

        // Swaps the z-index of the two closest elements
        if (parseInt(currentClosestElement.style.zIndex) - parseInt(element.parentNode.parentNode.style.zIndex) > 0) {
            var tempZIndex = parseInt(element.parentNode.parentNode.style.zIndex);

            element.parentNode.parentNode.style.zIndex = parseInt(currentClosestElement.style.zIndex);
            currentClosestElement.style.zIndex = tempZIndex;
        }
    }
}

// Moves a note layer backwards
function moveNoteLayerBackwards(element) {
    if (originalMouseX == newMouseX && originalMouseY == newMouseY) {
        var currentClosestElement = element.parentNode.parentNode;
        var currentClosestDifference = highestZIndex;

        // Searches for the closest difference between z-indexes
        $(".div--draggable").each(function(){;       
            var currentDifference = parseInt(element.parentNode.parentNode.style.zIndex) - $(this).css("z-index");
            if (currentDifference > 0) {
                if (currentDifference < currentClosestDifference) {
                    currentClosestElement = $(this)[0];
                    currentClosestDifference = parseInt(element.parentNode.parentNode.style.zIndex) - parseInt(currentClosestElement.style.zIndex);
                }
            }
        });

        // Swaps the z-index of the two closest elements
        if (parseInt(element.parentNode.parentNode.style.zIndex) - parseInt(currentClosestElement.style.zIndex) > 0) {
            var tempZIndex = parseInt(element.parentNode.parentNode.style.zIndex);

            element.parentNode.parentNode.style.zIndex = parseInt(currentClosestElement.style.zIndex);
            currentClosestElement.style.zIndex = tempZIndex;
        }
    }
}

// Changes the color of each individual note
function changeIndividualNoteColor(noteColor, noteToChange) {
    if (originalMouseX == newMouseX && originalMouseY == newMouseY) {
        switch (noteColor) {
            case "Yellow" :
                    noteToChange.parentNode.parentNode.style.backgroundColor = "#FDFD96";
                    noteToChange.parentNode.parentNode.style.borderColor = "#EAEA8A";
                    noteToChange.parentNode.style.backgroundColor = "#EAEA8A";

                    changeSelectedNoteColor(noteToChange.parentNode, "storyBoard", 1);
                break;
            case "Pink" :
                    noteToChange.parentNode.parentNode.style.backgroundColor = "#de528a";
                    noteToChange.parentNode.parentNode.style.borderColor = "#c44176";
                    noteToChange.parentNode.style.backgroundColor = "#c44176";

                    changeSelectedNoteColor(noteToChange.parentNode, "storyBoard", 2);
                break;
            case "Blue" :
                    noteToChange.parentNode.parentNode.style.backgroundColor = "#38a1c5";
                    noteToChange.parentNode.parentNode.style.borderColor = "#2d8dad";
                    noteToChange.parentNode.style.backgroundColor = "#2d8dad";

                    changeSelectedNoteColor(noteToChange.parentNode, "storyBoard", 3);
                break;
            case "Green" :
                    noteToChange.parentNode.parentNode.style.backgroundColor = "#A6EF3E";
                    noteToChange.parentNode.parentNode.style.borderColor = "#90d134";
                    noteToChange.parentNode.style.backgroundColor = "#90d134";

                    changeSelectedNoteColor(noteToChange.parentNode, "storyBoard", 4);
                break;
        }
    }
}

// Changes all notes to the same color
function changeAllNextNoteColor(noteColor, buttonPressed) {
    switch (noteColor) {
        case "Yellow" :
            changeSelectedNoteColor(buttonPressed.parentNode, "topBanner", 1);

            colorOfAllNotes = "Yellow";
            break;
        case "Pink" :
            changeSelectedNoteColor(buttonPressed.parentNode, "topBanner", 2);

            colorOfAllNotes = "Pink";
            break;
        case "Blue" :
            changeSelectedNoteColor(buttonPressed.parentNode, "topBanner", 3);

            colorOfAllNotes = "Blue";
            break;
        case "Green" :
            changeSelectedNoteColor(buttonPressed.parentNode, "topBanner", 4);

            colorOfAllNotes = "Green";
        break;
    }
}

// Changes the color of all notes to the same color
function changeAllNoteColors(mainNoteBackgroundColor, noteBorderColor, topnoteBannerColor, whichIsChecked ) {
    for (let note of document.getElementsByClassName("div--draggable")) {
        note.style.backgroundColor = mainNoteBackgroundColor;
        note.style.borderColor = noteBorderColor;
        note.children[0].style.backgroundColor = topnoteBannerColor;

        changeSelectedNoteColor(note.children[0], "storyBoard", whichIsChecked);
    }
}

// Changes the classes and innerHTML of all color buttons on the page
function changeSelectedNoteColor(locationInHTML, locationOnPage, whichIsChecked) {
    var colorButtons;
    var whichIsCheckedIndex;
    
    if (locationOnPage == "topBanner") {
        colorButtons = [3, 4, 5, 6];
        whichIsCheckedIndex = whichIsChecked + 2;
        colorButtons.splice(colorButtons.indexOf(whichIsCheckedIndex), 2);

    } else {
        colorButtons = [3, 4, 5, 6];
        whichIsCheckedIndex = whichIsChecked + 2;
        colorButtons.splice(colorButtons.indexOf(whichIsCheckedIndex), 1);
    }

    // Set up the selected button
    locationInHTML.children[whichIsCheckedIndex].classList = "";
    if (locationOnPage == "topBanner") {
        locationInHTML.children[whichIsCheckedIndex].classList.add("top--banner__btn--color--selected");
    } else {
        locationInHTML.children[whichIsCheckedIndex].classList.add("div--draggable__top--banner__btn--color--selected");
    }

    // Set up non selected buttons
    for (let buttonNotSelected of colorButtons) {
        locationInHTML.children[buttonNotSelected].classList = "";

        if (locationOnPage == "topBanner") {
            locationInHTML.children[buttonNotSelected].classList.add("top--banner__btn--color");
        } else {
            locationInHTML.children[buttonNotSelected].classList.add("div--draggable__top--banner__btn--color");
        }
    }
}

// ########################################## END Note interactions ########################################## //