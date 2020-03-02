let canvas = document.getElementById('test-canvas')
let ctx = canvas.getContext('2d')
ctx.canvas.width  = window.innerWidth
ctx.canvas.height = window.innerHeight

//Utils functions
const getRandomColor = () => {
    let letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

const drawRect = (x, y, width, height, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
}


let drawingMode = {active: false, downPos: {x: 0, y: 0}, color: 'black'}
let rects = []

const mouseDown = (e) => {
    drawingMode.active = true
    drawingMode.downPos.x = e.clientX
    drawingMode.downPos.y = e.clientY
    drawingMode.color = getRandomColor()
}

const mouseMove = (e) => {
    if(drawingMode.active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        rects.forEach((rect) => drawRect(rect.x, rect.y, rect.width, rect.height, rect.color))
        drawRect(
            drawingMode.downPos.x,
            drawingMode.downPos.y,
            e.clientX - drawingMode.downPos.x,
            e.clientY - drawingMode.downPos.y,
            drawingMode.color
        )
    }
}

const mouseUp = (e) => {
    if(drawingMode.active) {
        // square's origin (X;Y) can be equal to mouseUp position or mouseDown position
        let squareWidth = e.clientX - drawingMode.downPos.x,
            squareHeight = e.clientY - drawingMode.downPos.y,
            originPosX = squareWidth > 0 ? drawingMode.downPos.x : e.clientX,
            originPosY = squareHeight > 0 ? drawingMode.downPos.y : e.clientY

        if(squareWidth !== 0 || squareHeight !== 0) {
            rects.push({
                x: originPosX,
                y: originPosY,
                width: Math.abs(squareWidth),
                height: Math.abs(squareHeight),
                color: drawingMode.color,
                rotation: -1
            })
        }
    }
    drawingMode.active = false

}

const mouseDblClick = (e) => {

    // get selected indexes
    let clickedSquareIndexes = []
    rects.forEach((rect, index) => {
        if((e.clientX > rect.x) && (e.clientX < rect.x + rect.width) && (rect.y < e.clientY) && (e.clientY < rect.y + rect.height)) {
            clickedSquareIndexes.push(index)
        }
    })

    // if there are stacking of squares under click position. we search the square over the other, so the last in filtered array
    const selectedIndex = clickedSquareIndexes[clickedSquareIndexes.length - 1]


    if(selectedIndex !== undefined) {
        rects[selectedIndex].rotation = 0
        animateRotationAndDelete(selectedIndex)
    }
}

const animateRotationAndDelete = (selectedIndex) => {

    // recursive function will be called as long as the rotation is turning
    if(rects[selectedIndex].rotation <= 360) {

        // clear all canvas, redraw registred shape's, and draw shape with during rotation
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        rects.forEach((rect) => {
            if(rect.rotation === -1) {
                drawRect(rect.x, rect.y, rect.width, rect.height, rect.color)
            } else {
                // save context of canvas
                ctx.save()
                // translate canvas's pointer to shape's center (center of rotation what we want)
                ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2)
                // Rotate canvas pointer
                ctx.rotate( (Math.PI / 180) * rect.rotation)
                // translate canvas pointer to square's origin for drawing square
                ctx.translate( -rect.x - rect.width / 2, -rect.y - rect.height / 2)
                drawRect(rect.x, rect.y, rect.width, rect.height, rect.color)
                // Restore canvas context (get context what was saved by ctx.save())
                ctx.restore()
            }
        })
        if(rects[selectedIndex]) {
            rects[selectedIndex].rotation += 1
        }

        window.requestAnimationFrame(() => animateRotationAndDelete(selectedIndex))
    } else {
        // delete rotated square if all rotations were completed
        rects = rects.filter((rect) => {
            if(!rects.some((rect) => rect.rotation >=0 && rect.rotation <= 360)) {
                return !(rect.rotation > 360)
            }
            return true
        })
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        rects.forEach((rect) => drawRect(rect.x, rect.y, rect.width, rect.height, rect.color))
    }

}



canvas.onmousedown = mouseDown
canvas.onmousemove = mouseMove
canvas.onmouseup = mouseUp
canvas.ondblclick = mouseDblClick


