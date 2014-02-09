var knobby = function() {

    var Point = function (x, y) {
        this.x = x;
        this.y = y;
    };

    var calcAngle = function (thisobj, thiscenter) {
        var thisdX = thisobj.left - thiscenter.x;
        var thisdY = thisobj.top - thiscenter.y;
        var thisangle = Math.atan2(thisdY, thisdX);
        return thisangle;
    };
    var calcAnglePoints = function (thisobj, thiscenter) {
        var thisdX = thisobj.x - thiscenter.x;
        var thisdY = thisobj.y - thiscenter.y;
        var thisangle = Math.atan2(thisdY, thisdX);
        return thisangle;
    };

    var  animateTo=function(pt,obj,center,radius, time) {
        time = time || 1000;
        var angle1 = calcAngle(obj, center);
        var angle2 = calcAnglePoints(pt, center);

        console.log("a1 " + angle1 + " a2 " + angle2);

        fabric.util.animate({
            startValue: angle1,
            endValue: angle2,
            duration: time,

            // linear movement
            easing: function (t, b, c, d) { return c * t / d + b; },

            onChange: function (angle) {
                var newpt = makeRadianCirle(angle, radius, center.x, center.y);
                obj.set({ top: newpt.y, left: newpt.x }).setCoords();
                canvas.renderAll();
            }
        });
    };


    var constrainToCircle = function (obj, center, radius) {
//        var dX = obj.left - center.x;
//        var dY = obj.top - center.y;
        //        var angle = Math.atan2(dY, dX);
        var angle = calcAngle(obj, center);
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
        //console.log("near " + angle);
        var mindist = 99999;
        var found = 0;
        for (var i = 0; i < ticks.length; i++) {
            var atick = ticks[i];
            var thisdist = Math.abs(angle - atick);
            //console.log("dist " + thisdist + " i " + i);
            if (thisdist < mindist) {
                mindist=thisdist;
                found = i;
            }
            
        }
        //console.log(found);
        return ticks[found];
    };


    var animateToNearest = function (obj, radius, center, time) {
        time = time || 1000;
        var angle = calcAngle(obj, center);
        var nearest = nearestTick(angle, ticks);
        var pt = makeRadianCirle(nearest, radius, center.x, center.y);
        animateTo(pt, obj, center, radius,time);

    };


    // create a wrapper around native canvas element (with id="c")
    var canvas = new fabric.Canvas('c');

    var center = new Point(250, 250);
    var radius = 200;

    var ticks = [0.2, 0.3, 0.4,0.5,-0.1,-0.2,-0.3,-1.9, -3,3];

    var track = new fabric.Circle({
        radius: radius, stroke: 'green', fill: 'rgba(0,0,0,0)', strokeWidth: 2, left: center.x, top: center.y, hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center'
    });
    canvas.add(track);

    var dragMe = new fabric.Circle({ radius: 20, fill: 'green', top: center.y - radius, left: center.x , hasBorders: false, hasControls: false, originX:'center', originY:'center'  });
    dragMe.on('moving', function (options) {
        constrainToCircle(this, center, radius);
        var angle = calcAngle(dragMe, center);
        //console.log(angle);
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