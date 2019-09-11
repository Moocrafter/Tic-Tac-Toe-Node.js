function setup() {
  var mycanvas = createCanvas(400, 400);
  mycanvas.parent(`gameCanvas`);
  strokeWeight(10);
}

var canvasState = 1;
var loadingData = {
  "waiting" : true,
}
function draw() {
  background(220);
  if (canvasState == 0) {
    drawGrid()
    drawMark(0, 1);
  }else if (loadingData.waiting) {
    textSize(50);
    text(`Waiting . . .`, 80, 70);
    textSize(50);
    text(`You`, 45, 200);
    stroke(255, 0, 0)
    line(30, 235, 153, 358);
    line(30, 358, 153, 235);
    noStroke();
  }
}

function drawGrid() {
  stroke(0);
  line(133, 0, 133, 400);
  line(266, 0, 266, 400);
  line(0, 133, 400, 133);
  line(0, 266, 400, 266);
}

function drawMark(loc, mark) {
  //X
  stroke(255, 0, 0);
  
  /*//Define val5
  var val5 = Math.floor((((width * height) * 0.0000625) * width) / 800);
  
  //Define val123
  var val123 = 133.252032520325203;
  
  //If the val123 needs changed then do that
  if (Math.floor(val123) < Math.round(val123)) {
    val123 -= 1;
  }else if (Math.floor(133.252032520325203) < Math.ceil(133.252032520325203)) {
    val123 += 2;
  }
  
  var val143 = (Math.round(width / 2.797202797202797) + ((width % 8 != 0) ? 4 : 0)) - ((width % -98 == 6) ? 6 : 0);
  
  var val257 = (width / 1.550387596899225) - ((Number((width % -99.1).toFixed(2)) == 4.5) ? 4.5  : 0);
  
  var val395 = Math.round(width / 1.0126582278481013) - ((width % 209 == 91) ? 91 : 0);
  
  var val277 = Math.round(width / 1.444043321299639) + ((width % 16 == 4) ? 4 : 0) + ((width % 75 == 0) ? 133.4482758620689653 : 0);
  */
  
  //First Row
  if (loc == 0 && mark == 0) {
    line(5, 5, 123, 123);
    line(5, 123, 123, 5);
  }else if (loc == 1 && mark == 0) {
    line(143, 5, 257, 123);
    line(257, 5, 143, 123);
  }else if (loc == 2 && mark == 0) {
    line(277, 5, 395, 123);
    line(395, 5, 277, 123);
  //Second Row
  }else if (loc == 3 && mark == 0) {
    line(5, 143, 123, 257);
    line(123, 143, 5, 257);
  }else if (loc == 4 && mark == 0) {
    line(143, 143, 257, 257);
    line(257, 143, 143, 257);
  }else if (loc == 5 && mark == 0) {
    line(277, 143, 395, 257);
    line(395, 143, 277, 257);
  //Third Row
  }else if (loc == 6 && mark == 0) {
    line(5, 277, 123, 395);
    line(123, 277, 5, 395);
  }else if (loc == 7 && mark == 0) {
    line(143, 277, 257, 395);
    line(257, 277, 143, 395);
  }else if (loc == 8 && mark == 0) {
    line(277, 277, 395, 395);
    line(395, 277, 277, 395);
  }
  
  if (mark == 0) {
    stroke(0);
    return;
  }
  
  //Y
  noFill();
  stroke(0, 128, 0);
  
  //First Row
  if (loc == 0 && mark == 1) {
    circle(64, 64, 90);
  }else if (loc == 1 && mark == 1) {
    circle(200.5, 64, 90);
  }else if (loc == 2 && mark == 1) {
    circle(336, 64, 90);
  //Second Row
  }else if (loc == 3 && mark == 1) {
    circle(64, 200, 90);
  }else if (loc == 4 && mark == 1) {
    circle(200.5, 200, 90);
  }else if (loc == 5 && mark == 1) {
    circle(336, 200, 90);
  //Third Row
  }else if (loc == 6 && mark == 1) {
    circle(64, 336, 90);
  }else if (loc == 7 && mark == 1) {
    circle(200.5, 336, 90);
  }else if (loc == 8 && mark == 1) {
    circle(336, 336, 90);
  }
  
}