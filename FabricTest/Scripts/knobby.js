var knobby = function() {

    var constrainToCircle = function (obj, center, radius) {
        var dX = obj.left - center.x;
        var dY = obj.top - center.y;
        var angle = Math.atan2(dY, dX);
        var pt = makeRadianCirle(angle, radius, center.x, center.y);
        obj.top = pt.y;
        obj.left = pt.x;
    };

    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    var makeRadianCirle=function(theta,r, x,y) {
        var cx = r * Math.cos(theta) + x;
        var cy = r * Math.sin(theta) + y;
        return new Point(cx, cy);
    };


    var drawTick = function(angle, center ,radius, length, canvas) {
        var p1 = makeRadianCirle(angle, radius, center.x, center.y);
        var p2 = makeRadianCirle(angle, radius + length, center.x, center.y);
        var line = new fabric.Line([p1.x, p1.y, p2.x, p2.y], {stroke:'#cccccc', originX:'center', originY:'center'});
        canvas.add(line);
    };

    var changer = function () {
        console.log('called');
        constrainToCircle(dragMe, center, radius);
        return canvas.renderAll.bind(canvas);
    };

    var moveObjectToPoint = function(obj, point, radius, center) {
        obj.animate({ top: point.y, left: point.x }, { onChange: changer() });

    };

    // create a wrapper around native canvas element (with id="c")
    var canvas = new fabric.Canvas('c');

    var center = new Point(250, 250);
    var radius = 200;

    var ticks = [0.2, 0.3, 0.4,0.5,1,2,3];

    var track = new fabric.Circle({
        radius: radius, stroke: 'green', fill: 'rgba(0,0,0,0)', strokeWidth: 2, left: center.x, top: center.y, hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center'
    });
    canvas.add(track);

    var dragMe = new fabric.Circle({ radius: 20, fill: 'green', top: center.y - radius, left: center.x , hasBorders: false, hasControls: false, originX:'center', originY:'center'  });
    dragMe.on('moving', function (options) {
        constrainToCircle(this,center,radius);
    });
    for (var i = 0; i < ticks.length; i++) {
        var tick = ticks[i];
        drawTick(tick, center, radius + 10, 20, canvas);
    }
    canvas.add(dragMe);

    var lastTick = ticks[ticks.length - 1];
    var pt = makeRadianCirle(lastTick, radius, center.x, center.y);
    moveObjectToPoint(dragMe, pt, radius, center);
}();