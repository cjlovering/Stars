(function(){

            var canvas, ctx;
            var resizeId;
            var star_num = 50;
            var stars = [];       //create stars
            var rate = 50;
            var target; //move towards target
            var hide;     //move away from

            $(document).ready(function(){
                
                canvas = document.getElementById('starzone');
               
                if (canvas.getContext){
                    
                    ctx = canvas.getContext('2d');

                    configureCanvas();

                    target = {x: Math.floor((Math.random() * canvas.width) + 1), y: Math.floor((Math.random() * canvas.height) + 1)};

                    createStars();

                    drawStars();

                    canvas.addEventListener("mousemove", function(eventInfo) {
                        target = {x: eventInfo.offsetX || eventInfo.layerX, y:eventInfo.offsetY || eventInfo.layerY};
                    });

                    canvas.addEventListener("mouseup", function(eventInfo){
                        //may want to do more here ... EXPLODE
                        hide = {x: eventInfo.offsetX || eventInfo.layerX, y:eventInfo.offsetY || eventInfo.layerY};
                    });

                    $(window).resize(function(){
                        clearTimeout(resizeId);
                        resizeId = setTimeout(onResizeDraw, 300);
                    });

                    loop();
                }
            });


            function Star() {

                this.x = Math.floor((Math.random() * canvas.width) + 1);
                this.y = Math.floor((Math.random() * canvas.height) + 1);
                this.r = 5;
                this.color = "#" + ("000000" + (0xFFFFFF*Math.random()).toString(16)).substr(-6); //original random color

                this.React = function(){
        

                    this.r =      Math.floor (25 * Math.sqrt( square(target.x - this.x) + square(target.y - this.y) ) / (canvas.width) ) + 1;


                    // console.log("square(target.x - this.x) ", square(target.x - this.x) );
                    // console.log("square(target.y - this.y)", square(target.y - this.y));
                    // console.log("Math.sqrt( square(target.x - this.x) + square(target.y - this.y) )", Math.sqrt( square(target.x - this.x) + square(target.y - this.y) ));
                    // console.log("canvas", canvas.x / 2);
                    // console.log("ALL", Math.sqrt( square(target.x - this.x) + square(target.y - this.y) ) / (canvas.x / 2));
                    //Math.floor (5 * Math.sqrt( square(target.x - this.x) + square(target.y - this.y) ) / (canvas.x / 2) ) + 1;

                  //  console.log("r", this.r);
                    this.x += (target.x - this.x) * 2 / this.r;
                    this.y += (target.y - this.y) * 2 / this.r;
                    //console.log(this.x, this.y);

                    ctx.fillStyle = this.color; //
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fill();

                    //closer to hide -> faster move away

                    //closer to target -> faster move in

                    //closer to target -> smaller

                    //further from target -> more colorful
                }
            }

            function createStars(){
                for ( var i = 0; i < star_num; i++) stars.push( new Star() );
            }


            function loop(){
                setTimeout(function(){
                
                    drawStars();
                    loop();

                }, 1000/rate);
            }


            function onResizeDraw(){
                configureCanvas();
                drawStars();
            }
 
            function getColor(n){
                var colors    = [ "#ccff66", "#FFD700","#66ccff", "#ff6fcf", "#ff6666"];
                n %= colors.length;
                return colors[n];
            }

            function drawStars() {
                ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                for (s in stars) {
                    stars[s].React();
                }
            }

            function configureCanvas(){
                var h = $(window).height();
                var w = $(window).width();

                canvas.width = w;
                canvas.height = h; 
            }

            function square(i){
                return i * i;
            }
        })(); 


        /*
        ublic static Color Lighten(Color inColor, double inAmount)
{
  return Color.FromArgb(
    inColor.A,
    (int) Math.Min(255, inColor.R + 255 * inAmount),
    (int) Math.Min(255, inColor.G + 255 * inAmount),
    (int) Math.Min(255, inColor.B + 255 * inAmount) );
}
*/