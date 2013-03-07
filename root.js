
// {{{ Headers

// Author: Shou
// Version: 0.39
// License: GPL3
// Description: Colorful platform jumping game using HTML5 canvas.

// }}}

// TODO

// FIXME
// - Everything

// XXX


// {{{ Data
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d") // 3DPD!!!!!

// colors :: Object String String
var colors = { "red": "rgba(255, 0, 0, 0.7)"
             , "orange": "rgba(255, 165, 0, 0.7)"
             , "yellow": "rgba(255, 255, 0, 0.7)"
             , "green": "rgba(0, 255, 0, 0.7)"
             , "blue": "rgba(0, 0, 255, 0.7)"
             , "purple": "rgba(128, 0, 128, 0.7)"
             }

// Interval variable
var loop

// Color index for blocks; makes it generate colors in order.
// index :: Int
var index = 0

// Keyboard keydown holding object
// Keyboard :: Object Int Bool
var Keyboard = {}

// Movement on x
var movementX = 0
// Movement on y
var movementY = 0

// score :: Int
var score = 0

// starttime :: Int
var starttime = getPOSIXTime()

// | This is the array that keeps all the on-screen blocks in it.
// steps :: [Graphics]
var steps

// ball :: Graphics
var ball


// Coords :: Number -> Number -> Coords
function Coords(x, y){
    this.x = x
    this.y = y
}

// Graphics :: Coords -> String -> String -> Graphics
function Graphics(coords, color, speedX, speedY){
    this.coords = coords
    this.color = color
    this.speedX = speedX
    this.speedY = speedY
}

// }}}

// {{{ Utils

// | Get current POSIX time; seconds since 1970.
// getPOSIXTime :: IO Integer
function getPOSIXTime(){
    return Math.round((new Date()).getTime() / 1000)
}

// Making this part of the Array object prototype isn't ＣＲＡＺＹ enough.
// | Get the keys of an object.
// keys :: Object a b -> [a]
function keys(obj){
    var tmp = []
    for (var k in obj) tmp.push(k)
    return tmp
}

// | Map a function `f' over every element in a list.
// map :: (a -> b) -> [a] -> [b]
function map(f, xs){
    var tmp = []
    for (var i = 0; i < xs.length; i++) tmp.push(f(xs[i]))
    return tmp
}

// }}}

// {{{ Graphics functions

// | Generates a new block based on an old one.
// gen :: Graphics -> Graphics
function gen(block){
    // Color index
    if (index >= 5) index = 0
    else index += 1
    var color = keys(colors)[index]
    // Indent block by 200 pixels every six blocks
    var indent = Math.floor(steps.length / 6) * 200
    // Wizardry
    var x = Math.floor(Math.random() * 200) + indent
    var y = block.coords.y + (Math.floor(Math.random() * 400) - 200)
    // TODO make this good (and not bad)
    y = y > 100 && y < 1000 ? y : 500
    speedX = Math.random() * 4 + 5

    return new Graphics(new Coords(x, y), color, speedX, 0)
}

// | Renders a block on the canvas.
// ren :: Graphics -> IO ()
function ren(block){
    ctx.fillStyle = colors[block.color]
    ctx.fillRect(block.coords.x, block.coords.y, 200, 38)
    ctx.save()
}

// | Render the goddamn ball.
// makeBall :: Graphics -> IO ()
function makeBall(ball){
    var x = ball.coords.x
    var y = ball.coords.y
    ctx.beginPath()
    ctx.fillStyle = colors[ball.color]
    ctx.moveTo(x + 50, y + 30)
    ctx.bezierCurveTo(x + 50, y, x, y, x, y + 30)
    ctx.bezierCurveTo(x, y + 60, x + 50, y + 65, x + 50, y + 90)
    ctx.bezierCurveTo(x + 50, y + 65, x + 100, y + 60, x + 100, y + 30)
    ctx.bezierCurveTo(x + 100, y, x + 50, y, x + 50, y + 30)
    ctx.fill()
    ctx.moveTo(0, 0)
}

// }}}

// {{{ Events

// Key down listener
document.body.addEventListener("keydown", function(e){
    // Add the keycode to the `keyboard' object.
    Keyboard[e.keyCode] = true
    // only do this if it's an arrow key and the game ended
    if (e.keyCode > 36 && e.keyCode < 41 && starttime === 0) {
        main()
        starttime = getPOSIXTime()
        var img = document.getElementsByTagName("img")[0]
        img.parentNode.style.display = "none"
    }
})

// Key up listener
document.body.addEventListener("keyup", function(e){
    // Remove the keycode from the `keyboard' object.
    delete Keyboard[e.keyCode]
})

// }}}

// TODO: I should probably split this into more than one huge function.
// main :: IO ()
function main(){
    // initialize the level
    var block = new Graphics(new Coords(10, 10), "red", 20, 0)
    var ball = new Graphics(new Coords(400, -80), "red", 0, 0)
    steps = []
    while (block.coords.x < 2120){
        block = gen(block)
        steps.push(block)
    }
    // render every block
    map(ren, steps)
    loop = setInterval(function(){
        ctx.clearRect(0, 0, 1920, 1080)
        if (37 in Keyboard) {
            // I'm sorry Stallman-sama, I promise I won't break the 80-col limit
            // any more.
            movementX = (movementX < -9 ? -10 : (movementX < 0 ? movementX : -1) * 1.3)
        } else if (39 in Keyboard) {
            movementX = (movementX > 9 ? 10 : (movementX > 0 ? movementX : 1) * 1.3) // orz
        } else {
            movementX = Math.floor(movementX * 0.7)
        }
        var tmp = []
        for (var i = 0; i < steps.length; i++){
            var step = steps[i]
            if (step.coords.x < -200){
                step.coords.x = 2120
                step = gen(step)
            }
            // collision check
            if (ball.color === step.color){
                var xoff = ball.coords.x + 50 - step.coords.x
                var yoff = ball.coords.y + 85 - step.coords.y
                if (xoff > 0 && xoff < 200 && yoff > 0 && yoff < 10 && movementY > 0){ // time to commit sudoku
                    movementY *= Math.abs(movementY) * -1
                    // xXx420xXxW33DxXxXxXx4xLYFEx
                    if (score === 400) score += 20
                    else if (score === 420) score += 80
                    else score += 50
                    console.log(ball.color)
                    ball.color = keys(colors)[Math.floor(Math.random() * 6)]
                    console.log(ball.color)
                    console.log("タッチ！！")
                }
            }
            step.coords.x -= step.speedX
            tmp.push(step)
            ren(step)
        }
        steps = tmp
        // falling/jumping
        movementY = movementY > 9 ? 10 : (Math.round(movementY) == 0 ? 1 : movementY) * 1.3 // ;_;
        if (movementY < 0) movementY *= 0.60
        // always move the ball slowly with the blocks
        ball.coords.x += movementX - 2
        ball.coords.y += movementY
        makeBall(ball)

        // score
        ctx.font = "bold 40px Helvetica"
        ctx.fillText("Score: " + score, 900, 40)
        if (score >= 420) {
            var img = document.getElementsByTagName("img")[0]
            img.parentNode.style.display = "block"
        }

        // ball has fallen outside the screen
        if (ball.coords.y > 1080 || ball.coords.x < -200){
            // times the trippy text effect should be applied
            var i = 17
            var time = getPOSIXTime() - starttime
            // no accidental instant restart
            setTimeout(function(){ starttime = 0 }, 500)
            score = 0
            var tmp = setInterval(function(){
                ctx.fillStyle = colors[keys(colors)[i % 6]]
                var f = function(msg0, msg1){
                    ctx.font = "bold 70px Helvetica"
                    ctx.fillText(msg0, 500 + i, 400 + i)
                    ctx.fillText(msg0, 500 - i, 400 - i)
                    ctx.fillText(msg0, 500 - i, 400 + i)
                    ctx.fillText(msg0, 500 + i, 400 - i)
                    ctx.fillText(msg1, 500 + i, 500 + i)
                    ctx.fillText(msg1, 500 - i, 500 - i)
                    ctx.fillText(msg1, 500 - i, 500 + i)
                    ctx.fillText(msg1, 500 + i, 500 - i)
                    ctx.fillStyle = "black"
                    ctx.fillText(msg0, 503, 400)
                    ctx.fillText(msg1, 503, 500)
                    ctx.fillText(msg0, 500, 403)
                    ctx.fillText(msg1, 500, 503)
                    ctx.fillStyle = "white"
                    ctx.fillText(msg0, 500, 400)
                    ctx.fillText(msg1, 500, 500)
                    i--
                }
                f("GAME OVER, LOSER.", "You lasted " + time + " seconds.")
                if (i === 1) clearInterval(tmp)
            }, 1000 / 60)
            clearInterval(loop)
        }
    }, 1000 / 60) // MAXIMUM FPS!!!!!!! Unless your monitor is 120 Hz or higher.
}

// This whole thing is probably slow as hell because EXPERT PROGRAMMING.
main()

