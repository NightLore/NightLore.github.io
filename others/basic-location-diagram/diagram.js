
var points = [];
var ENTER = 13;
var selected = false;
// --------------------------------------------------------------- //
window.onload = function() {
    setupVariables('diagram_canvas');
    setupInput(document);
//    setupInput(canvas);

    // ------------------- initialize right overlay ------------------- //
    var d1 = document.createElement('div');
    var s1 = createPointIntegerInput(origin,'span','x','x','20%',true,true);
    var s2 = createPointIntegerInput(origin,'span','y','y','20%',true,true);

    var s3 = document.createElement('span');
    s3.appendChild(document.createTextNode('....'));
    s3.style.visibility = "hidden";

    d1.appendChild(s1);
    d1.appendChild(s3);
    d1.appendChild(s2);

    document.getElementById('origin').appendChild(d1);
}

var setupVariables = function(c) {
    mouse = {
        x: 0,
        y: 0,
        clicked: [false, false, false],
        down: [false, false, false]
    };
    mouse_coords = document.createTextNode("0,0");
    document.getElementById('mouse_coordinates').appendChild(mouse_coords);
    
    canvas = document.getElementById(c);
    context2D = canvas.getContext('2d');
    var div = document.getElementById('canvas_div');
    canvas.width = div.clientWidth;
    canvas.height = div.clientHeight;
    origin = {
        x: 0,
        y: 0
    }
}

var setupInput = function(element) {

    element.addEventListener('mousemove', function(e) {
//        var pos = getMousePos(canvas,e);
        mouse.x = Math.round(e.clientX - canvas.width/2 + origin.x);
        mouse.y = Math.round(e.clientY - canvas.height/2 + origin.y);
        mouse_coords.nodeValue = mouse.x + "," + mouse.y;
        update();
    });

    element.addEventListener('mousedown', function(e) {
        mouse.clicked[e.which-1] = !mouse.down[e.which-1];
        mouse.down[e.which-1] = true;
        update();
    });

    element.addEventListener('mouseup', function(e) {
        mouse.down[e.which-1] = false;
        mouse.clicked[e.which-1] = false;
        update();
    });

    document.addEventListener('keyup', function(e) {update();});
//    document.addEventListener('keydown', function(e) {update();});
    window.addEventListener('resize', function() {resize_canvas(canvas);});
}

var resize_canvas = function() {
//    var div = document.getElementById('canvas_div');
//    canvas.width = div.clientWidth;
//    canvas.height = div.clientHeight;
//            this.height = newHeight;
//
//            for (var i = 0; i < points.length; i++) {
//                if (points.resize)
//                    points.resize(this.canvas);
//            }
    update();
}

var update = function() {
    var div = document.getElementById('canvas_div');
    canvas.width = div.clientWidth;
    canvas.height = div.clientHeight;
    for (var i = 0; i < points.length; i++) {
        points[i].update(mouse);
    }
    draw();
}

var draw = function() {
    context2D.setTransform(1,0,0,1,0,0); // reset the transform matrix as it is cumulative
    context2D.clearRect(0, 0, canvas.width, canvas.height);//clear the viewport AFTER the matrix is reset

//            this.cam.x = 0;
//            this.cam.y = 0;
//            //Clamp the camera position to the world bounds while centering the camera around the player   
//            if ( this.player )
//            {
//                this.cam.x = -this.player.x + this.canvas.width/2;
//                this.cam.y = -this.player.y + this.canvas.height/2;
//                if ( this.world )
//                {
//                    this.cam.x = clamp(this.cam.x, -this.world.rightSide() + this.canvas.width, -this.world.leftSide());
//                    this.cam.y = clamp(this.cam.y, -this.world.bottomSide() + this.canvas.height, -this.world.topSide());
//                }
//            }
    context2D.translate( canvas.width/2 - origin.x, canvas.height/2 - origin.y );

    if (selected) {
        selected.drawDistances(context2D,points);
    }
    for (var i = 0; i < points.length; i++) {
        points[i].draw(context2D,points);
    }
}

// ----------------------------- HTML Element Functions -------------------------------- //

function resetBackgroundField(textfield) {
    textfield.value = document.getElementById('overlay').style.backgroundColor;
}

function setBackground(textfield, element) {
    if (event.keyCode == ENTER) {
        element.style.backgroundColor = textfield.value;
    }
}

function addPoint() {
    var point_num = points.length;

    var p = new Sprite(origin.x, origin.y);
    p.index = point_num;
    p.text = "Point " + (point_num + 1);
    p.handler[0] = function() {
        selected = (selected === p) ? false : p;
    }
    points.push(p);

    var title = document.createTextNode('Point ' + (point_num + 1) + ': ');

    var coords_div = document.createElement('div');
    var x_span = createPointIntegerInput(p,'span','x','x','20%',true,true);
    var y_span = createPointIntegerInput(p,'span','y','y','20%',true,true);

    var space = document.createElement('span');
    space.appendChild(document.createTextNode('....'));
    space.style.visibility = "hidden";

    coords_div.appendChild(x_span);
    coords_div.appendChild(space);
    coords_div.appendChild(y_span);
    
    var radius_div = createPointIntegerInput(p,'div','Radius','radius','40%',true,true);
    var color_div = createPointInput(p,'div','Set Color','fillColor','40%',true);

    var pointDiv = document.createElement('div');
    pointDiv.appendChild(title);
    pointDiv.appendChild(coords_div);
    pointDiv.appendChild(radius_div);
    pointDiv.appendChild(color_div);
    pointDiv.appendChild(document.createElement('br'));
    document.getElementById('points').appendChild(pointDiv);

    update();
}

function createPointInput(p, container, text, value, width, keyup, blur) {
    var c = document.createElement(container);
    var t = document.createTextNode(text + ': ');
    var i = document.createElement('input');
    i.style.width = width;
    i.value = p[value];
    i.addEventListener('click', function(e) {this.select()});
    if (keyup) {
        if (typeof keyup != 'function') {
            keyup = function(e) {
                if (e.keyCode == ENTER) {
                    p[value] = i.value;
                }
            };
        }
        i.addEventListener('keyup', keyup);
    }
    if (blur) {
        if (typeof blur != 'function') {
            blur = function(e) {
                p[value] = i.value;
                update();
            }
        }
        i.addEventListener('blur', blur);
    }
    c.appendChild(t);
    c.appendChild(i);
    return c;
}

function createPointIntegerInput(p,container, text, value, width, keyup, blur) {
    var c = createPointInput(p, container, text, value, width);
    var i = c.getElementsByTagName('input')[0];
    if (keyup) {
        if (typeof keyup != 'function') {
            keyup = function(e) {
                if (e.keyCode == ENTER) {
                    if (isInt(i.value)) {
                        p[value] = parseFloat(i.value);
                        update();
                    }
                }
            };
        }
        i.addEventListener('keyup', keyup);
    }
    if (blur) {
        if (typeof blur != 'function') {
            blur = function(e) {
                if (isInt(i.value)) 
                    p[value] = parseFloat(i.value);
                else
                    i.value = p[value];
                update();
            }
        }
        i.addEventListener('blur', blur);
    }
    return c;
}