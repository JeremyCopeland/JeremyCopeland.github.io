function highlight(className) {
    var elements = document.getElementsByClassName(className);

    for (const elem of elements) {
        elem.classList.add("span-color")
    }
}


function unhighlight(className) {
    var elements = document.getElementsByClassName(className);

    for (const elem of elements) {
        elem.classList.remove("span-color")
    }
}


function getDiagramObj(submissionID) {
    return window[`diagram_${submissionID}`]
}


function getBoardObj(submissionID) {
    return getDiagramObj(submissionID).board
}


function getPointLabels(diagramObj, points) {
    return points.map(function (p) {
        return diagramObj[p].name
    })
}


function unhighlightGeoEntities(submissionID) {
    let diagramObj = getDiagramObj(submissionID)

    for (geoEntity of diagramObj.temporaryObjects) {
        geoEntity.remove()
    }

    diagramObj.temporaryObjects = []
}


function highlightSegments(submissionID, color, ...args) {
    let diagramObj = getDiagramObj(submissionID)
    let boardObj = getBoardObj(submissionID)

    for (var i = 0; i < args.length; i += 2) {
        let points = getPointLabels(diagramObj, [args[i], args[i + 1]])

        diagramObj.temporaryObjects.push(boardObj.create('segment', points, {
            strokeWidth: 2,
            strokeColor: color
        }))
    }
}


function isOrderAnticlockwise(x1, y1, x2, y2, x3, y3) {
    return x1 * y2 + x2 * y3 + x3 * y1 > x1 * y3 + x2 * y1 + x3 * y2
}


function getOrderedPoints(submissionID, p1, p2, p3) {
    var points = [p1, p2, p3]
    let diagramObj = getDiagramObj(submissionID)

    let x1 = diagramObj[p1].coords.usrCoords[1]
    let y1 = diagramObj[p1].coords.usrCoords[2]

    let x2 = diagramObj[p2].coords.usrCoords[1]
    let y2 = diagramObj[p2].coords.usrCoords[2]

    let x3 = diagramObj[p3].coords.usrCoords[1]
    let y3 = diagramObj[p3].coords.usrCoords[2]

    if (isOrderAnticlockwise(x1, y1, x2, y2, x3, y3)) {
        points = [p3, p2, p1]
    }

    return getPointLabels(diagramObj, points)
}


function highlightAngle(submissionID, p1, p2, p3, r, color) {
    let points = getOrderedPoints(submissionID, p1, p2, p3)
    let boardObj = getBoardObj(submissionID)

    diagramObj.temporaryObjects.push(boardObj.create('angle', points, {
        name: function() { return '' },
        radius: r,
        fillColor: color,
        strokeColor: color
    }))

    highlightSegments(submissionID, color, p1, p2, p2, p3)
}


function highlightAngles(submissionID, color, ...args) {
    diagramObj = getDiagramObj(submissionID)

    for (var i = 0; i < args.length; i += 3) {
        let p1 = args[i]
        let p2 = args[i + 1]
        let p3 = args[i + 2]

        let segmentLengths = [
            diagramObj[p1].Dist(diagramObj[p2]), diagramObj[p3].Dist(diagramObj[p2])
        ]

        let rng = new aleaPRNG(`${p1}${p2}${p3}`)
        let scalingFactor = (rng.range(18, 25) + rng()) / 100
        let r = Math.min(...segmentLengths) * scalingFactor

        highlightAngle(submissionID, p1, p2, p3, r, color)
    }
}


function highlightTriangle(submissionID, p1, p2, p3, color) {
    let diagramObj = getDiagramObj(submissionID)
    let boardObj = getBoardObj(submissionID)
    let points = getPointLabels(diagramObj, [p1, p2, p3])

    diagramObj.temporaryObjects.push(boardObj.create('polygon', points, {
        color: color
    }))
}


function highlightTriangles(submissionID, color, ...args) {
    adjustedColor = color

    for (var i = 0; i < args.length; i += 3) {
        highlightTriangle(submissionID, args[i], args[i + 1], args[i + 2], adjustedColor)
        adjustedColor = pSBC(-0.6, adjustedColor)
    }
}
