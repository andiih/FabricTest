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

    var makeRadianCirle = function (theta, r, pt) {
        var cx = r * Math.cos(theta) + pt.x;
        var cy = r * Math.sin(theta) + pt.y;
        return new Point(cx, cy);
    };

    var  animateTo=function(pt,obj,center,radius, time) {
        time = time || 1000;
        var angle1 = calcAngle(obj, center);
        var angle2 = calcAnglePoints(pt, center);

        fabric.util.animate({
            startValue: angle1,
            endValue: angle2,
            duration: time,

            // linear movement
            // easing: function (t, b, c, d) { return c * t / d + b; },

            onChange: function (angle) {
                var newpt = makeRadianCirle(angle, radius, center);
                obj.set({ top: newpt.y, left: newpt.x }).setCoords();
                canvas.renderAll();
            }
        });
    };



    var constrainToCircle = function (obj, center, radius) {
        var angle = calcAngle(obj, center);
        var pt = makeRadianCirle(angle, radius, center);
        obj.set({ left: pt.x, top: pt.y }).setCoords();
    };




    var drawTick = function(angle, center ,radius, length, canvas) {
        var p1 = makeRadianCirle(angle, radius, center);
        var p2 = makeRadianCirle(angle, radius + length, center);
        var line = new fabric.Line([p1.x, p1.y, p2.x, p2.y], { stroke: '#cccccc', originX: 'center', originY: 'center', hasBorders: false, hasControls: false, selectable: false});
        canvas.add(line);
    };

    var nearestTick = function(angle, ticks) {
        var mindist = 99999;
        var found = 0;
        for (var i = 0; i < ticks.length; i++) {
            var atick = ticks[i];
            var thisdist = Math.abs(angle - atick);
            if (thisdist < mindist) {
                mindist=thisdist;
                found = i;
            }
            
        }
        return ticks[found];
    };


    var animateToNearest = function (obj, radius, center, time) {
        time = time || 1000;
        var angle = calcAngle(obj, center);
        var nearest = nearestTick(angle, ticks);
        var pt = makeRadianCirle(nearest, radius, center);
        animateTo(pt, obj, center, radius,time);

    };


    var drawOnACurve = function (s, angle, radius, center, spacing,fontadjust ,canvas) {
        var ang = (180 / Math.PI) * angle;
        var inc = (180 / Math.PI) * spacing;
        var fontadjustinc = (180 / Math.PI) * fontadjust;
        var font = { hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center', fontSize:20, fill:'#cccccc' };
        var em = new fabric.Text("M", font);
        var emwidth = em.getBoundingRectWidth();
        ang = ang + 90;
        if (ang > 360) ang -= 360;
        var group = [];
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            var posiitonForChar = makeRadianCirle(angle, radius, center);
            var text = new fabric.Text(c,font);
            var ratio =  text.getBoundingRectWidth() / emwidth;

            //console.log(c + ": " + ratio + " Em: " + text.getBoundingRectWidth()) + "/" + emwidth;
            
            text.set({ angle: ang, top: posiitonForChar.y, left: posiitonForChar.x, }).setCoords();
            //canvas.add(text);
            group.push(text);
            ang += inc + fontadjustinc * ratio;
            angle += spacing  + fontadjust* ratio;
        }
        canvas.add(new fabric.Group(group, { hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center' }));
    };

    // create a wrapper around native canvas element (with id="c")
    var canvas = new fabric.Canvas('c');

    var center = new Point(300, 300);
    var radius = 200;

    var ticks = [0.4, 0.5, 0.6,0.7,-0.1,-0.2,-0.3,-1.9, -3,3];

    var track = new fabric.Circle({
        radius: radius, stroke: 'green', fill: 'rgba(0,0,0,0)', strokeWidth: 4, left: center.x, top: center.y, hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center'
    });
    canvas.add(track);

    var maskwidth = 220;
    var mask = new fabric.Circle({
        radius: radius+1+maskwidth/2, stroke: '#006699', fill: 'rgba(0,0,0,0)', strokeWidth: maskwidth, left: center.x, top: center.y, hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center'
    });
    canvas.add(mask);

    var dragMe = new fabric.Circle({ radius: 20, fill: 'green', top: center.y - radius, left: center.x , hasBorders: false, hasControls: false, originX:'center', originY:'center'  });

    dragMe.on('moving', function (options) {
        constrainToCircle(this, center, radius);
    });
    dragMe.on('mouseup', function (options) {
        animateToNearest(dragMe, radius, center,250);
    });
    

    for (var i = 0; i < ticks.length; i++) {
        var tick = ticks[i];
        drawTick(tick, center, radius + 10, 20, canvas);
    }

    animateToNearest(dragMe, radius, center);
    canvas.add(dragMe);

    //drawOnACurve("Washing Machines", ticks[0], radius + 50, center, 0.04, 0.02, canvas);
    drawOnACurve("Dishwashers", ticks[6], radius + 50, center, 0.04, 0.02, canvas);
    //drawOnACurve("Start", ticks[7], radius + 50, center, 0.04, 0.02, canvas);
    //drawOnACurve("Regrigerators", ticks[9], radius + 50, center, 0.04, 0.02, canvas);
//    var rad = radius + 50;
//    var ct = new CurvedText(canvas, { radius: rad, top: center.y, left: center.x + rad, angle: 45, spacing: 3, text: "Washing Machines" });
//    var ct2 = new CurvedText(canvas, { radius: rad, top: center.y, left: center.x + rad, angle: 45, spacing: 3, text: "Dishwashers" });
//    var ct3 = new CurvedText(canvas, { radius: rad, top: center.y, left: center.x + rad, angle: 45, spacing: 3, text: "Tumble Dryers" });

    $('#behind').click(function() {
        alert('clicked');
    });

    var listener = function (e) {
        $('#anc').text(e.curTop);
        var angle = (e.curTop/8) * 0.0174532925- Math.PI;
        var time = 500;
        var nearest = nearestTick(angle, ticks);
        var pt = makeRadianCirle(nearest, radius, center);
        animateTo(pt, dragMe, center, radius, time);
    };

    skrollr.init({ forceHeight: true, beforerender: listener });
}();

