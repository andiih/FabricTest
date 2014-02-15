var knobby = function() {
    var conversionFactor = 0.0174532925;
    var sk={};
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

    var  animateTo=function(pt,obj,center,radius, time, canvas) {
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
        pixels = ((angle+ Math.PI)/conversionFactor)*8;
        sk.setScrollTop(pixels);
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


    var animateToNearest = function (obj, radius, center, time, ticks, canvas) {
        time = time || 1000;
        var angle = calcAngle(obj, center);
        var nearest = nearestTick(angle, ticks);
        var pt = makeRadianCirle(nearest, radius, center);
        animateTo(pt, obj, center, radius,time, canvas);

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
            text.set({ angle: ang, top: posiitonForChar.y, left: posiitonForChar.x, }).setCoords();
            canvas.add(text);
            //group.push(text);
            ang += inc + fontadjustinc * ratio;
            angle += spacing  + fontadjust* ratio;
        }
        //canvas.add(new fabric.Group(group, { hasBorders: false, hasControls: false, selectable: false, originX: 'center', originY: 'center' }));
    };


    var main = function() {

        // create a wrapper around native canvas element (with id="c")
        var canvas = new fabric.Canvas('c');

        var center = new Point(300, 300);
        var radius = 200;

        var ticks = [0.4, 0.5, 0.6, 0.7, -0.1, -0.2, -0.3, -1.9, -3, 3];

        var track = new fabric.Circle({
            radius: radius,
            stroke: 'green',
            fill: 'rgba(0,0,0,0)',
            strokeWidth: 4,
            left: center.x,
            top: center.y,
            hasBorders: false,
            hasControls: false,
            selectable: false,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(track);

        var maskwidth = 220;
        var mask = new fabric.Circle({
            radius: radius + 1 + maskwidth / 2,
            stroke: '#006699',
            fill: 'rgba(0,0,0,0)',
            strokeWidth: maskwidth,
            left: center.x,
            top: center.y,
            hasBorders: false,
            hasControls: false,
            selectable: false,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(mask);

        var dragMe = new fabric.Circle({ radius: 20, fill: 'green', top: center.y - radius, left: center.x, hasBorders: false, hasControls: false, originX: 'center', originY: 'center' });

        var constrain = false;

        dragMe.on('moving', function(options) {
            constrainToCircle(this, center, radius);
            constrain = true;
        });

        dragMe.on('mouseup', function(options) {
            animateToNearest(dragMe, radius, center, 250, ticks, canvas);
            constrain = false;
        });


        for (var i = 0; i < ticks.length; i++) {
            var tick = ticks[i];
            drawTick(tick, center, radius + 10, 20, canvas);
        }

        animateToNearest(dragMe, radius, center, 250, ticks, canvas);
        canvas.add(dragMe);

        var space = 50;
        drawOnACurve("Washing Machines", ticks[0], radius + space, center, 0.04, 0.02, canvas);
        drawOnACurve("Dishwashers", ticks[6], radius + space, center, 0.04, 0.02, canvas);
        drawOnACurve("Regrigerators", ticks[7], radius + space, center, 0.04, 0.02, canvas);
        drawOnACurve("Start", ticks[8], radius + space, center, 0.04, 0.02, canvas);

        $('#behind').click(function() {
            alert('clicked');
        });


        var snapBack = function(angle) {
            var time = 250;
            var nearest = nearestTick(angle, ticks);
            var pt = makeRadianCirle(nearest, radius, center);
            animateTo(pt, dragMe, center, radius, time, canvas);
            var pixels = ((nearest + Math.PI) / conversionFactor) * 8;
            sk.setScrollTop(pixels);
            console.log(pixels);
        };

        var snapBackHandle = null;
        var listener = function(e) {
            if (constrain) return;

            $('#anc').text(e.curTop);
            var angle = (e.curTop / 8) * conversionFactor - Math.PI;

            if (snapBackHandle) clearTimeout(snapBackHandle);
            snapBackHandle = window.setTimeout(function () { snapBack(angle); }, 250);
            var pt = makeRadianCirle(angle, radius, center);
            dragMe.set({ top: pt.y, left: pt.x }).setCoords();
            canvas.renderAll();
        };

        sk = skrollr.init({ forceHeight: true, beforerender: listener });
    }();

    
}();

