var knobby = function() {

    var Point = function (x, y) {
        this.x = x;
        this.y = y;
    };

    var  animateTo=function(pt,obj,center,radius, time) {
        var dX1 = obj.left - center.x;
        var dY1 = obj.top - center.y;
        var angle1 = Math.atan2(dY1, dX1);
        time = time || 1000;

        var dX2 = pt.x - center.x;
        var dY2 = pt.y - center.y;
        var angle2 = Math.atan2(dY2, dX2);
        var mult = 1;
        var add = 0;

        if (Math.abs(angle2 - angle1) > Math.PI) {
            mult = -1;
            var add = 0;
            angle1 = angle1 + Math.PI;
            angle2 = 2 * Math.PI - angle2;
        }

        fabric.util.animate({
            startValue: angle1,
            endValue: angle2,
            duration: time,

            // linear movement
            easing: function (t, b, c, d) { return c * t / d + b; },

            onChange: function (angle) {
                var newpt = makeRadianCirle(angle*mult+add, radius, center.x, center.y);
                obj.set({ top: newpt.y, left: newpt.x }).setCoords();
                canvas.renderAll();
            }
        });
    };

    var getAngle = function(obj, center) {
        var dX = obj.left - center.x;
        var dY = obj.top - center.y;
        var angle = Math.atan2(dY, dX);
        return angle;

    };

    var constrainToCircle = function (obj, center, radius) {
//        var dX = obj.left - center.x;
//        var dY = obj.top - center.y;
        //        var angle = Math.atan2(dY, dX);
        var angle = getAngle(obj, center);
        var pt = makeRadianCirle(angle, radius, center.x, center.y);
        obj.set({ left: pt.x, top: pt.y }).setCoords();
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

    var nearestTick = function(angle, ticks) {
        console.log("near " + angle);
        var mindist = 99999;
        var found = 0;
        for (var i = 0; i < ticks.length; i++) {
            var atick = ticks[i];
            var thisdist = Math.abs(angle - atick);
            console.log("dist " + thisdist + " i " + i);
            if (thisdist < mindist) {
                mindist=thisdist;
                found = i;
            }
            
        }
        console.log(found);
        return ticks[found];
    };


    var animateToNearest = function (obj, radius, center, time) {
        time = time || 1000;
        var angle = getAngle(obj, center);
        var nearest = nearestTick(angle, ticks);
        var pt = makeRadianCirle(nearest, radius, center.x, center.y);
        animateTo(pt, obj, center, radius,time);

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
        constrainToCircle(this, center, radius);
        var angle = getAngle(dragMe, center);
        console.log(angle);
    });
    dragMe.on('mouseup', function (options) {
        animateToNearest(dragMe, radius, center,250);
    });
    for (var i = 0; i < ticks.length; i++) {
        var tick = ticks[i];
        drawTick(tick, center, radius + 10, 20, canvas);
    }

    animateToNearest(dragMe, radius, center);
//    var startpt = makeRadianCirle(ticks[5], radius, center.x, center.y);
//    dragMe.set({ top: startpt.y, left: startpt.x }).setCoords();
    canvas.add(dragMe);



}();