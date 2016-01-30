(function(){

            /* constants */
            var ESCAPE_BOUND; //canvas / 2
            var CANVAS_BOUND;

            var canvas, ctx;
            var resizeId;
            var star_num = 500;
            var stars = [];       //create stars
            var rate = 4000;//100
            var target; //move towards target
            var seek = true;     //move away from
            var avoid = false;  //seek vs hide
            var lagger = 0;
            var STATE = {
                FLOCK : 1,
                REST : 2,
                EXPLODE : 3,
                HIDE : 4,
            };

            var SUB = {
                FLOCK_IN : 11,
                FLOCK_OUT : 12,
                HIDE: 13,
                EXPLODE: 14
            }

            var current_state = STATE.FLOCK;
            //STATE

            $(document).ready(function(){

                canvas = document.getElementById('starzone');
               
                if (canvas.getContext){
                    
                    ctx = canvas.getContext('2d');

                    configureCanvas();

                    target = {x: Math.floor((Math.random() * canvas.width) + 1), y: Math.floor((Math.random() * canvas.height) + 1)};

                    createStars();

                    drawStars();

                    canvas.addEventListener("mousemove", function(eventInfo) {
                        
                        switch (current_state){

                            case STATE.HIDE:
                                break;
                            case STATE.EXPLODE:
                            case STATE.FLOCK:
                            case STATE.REST:
                                current_state = STATE.FLOCK;
                        };

                        target = {x: eventInfo.offsetX || eventInfo.layerX, y:eventInfo.offsetY || eventInfo.layerY};
                    });

                    canvas.addEventListener("mouseup", function(eventInfo){
                        //may want to do more here ... EXPLODE
                        switch (current_state){
                
                            // case STATE.HIDE:
                            //     current_state = STATE.FLOCK;
                            //     break;
                            case STATE.EXPLODE:
                                current_state = STATE.REST;
                                //current_state = STATE.HIDE;
                                break;
                            case STATE.FLOCK:
                                current_state = STATE.EXPLODE;
                                lagger = 150;
                                target = {x: eventInfo.offsetX || eventInfo.layerX, y:eventInfo.offsetY || eventInfo.layerY};                        
                                break;
                            case STATE.REST:
                                current_state = STATE.FLOCK;
                                break;
                        };
                    });

                    canvas.addEventListener("mouseout", function(eventInfo){
                        current_state = STATE.REST;

                    });

                    $(window).resize(function(){
                        clearTimeout(resizeId);
                        resizeId = setTimeout(onResizeDraw, 300);
                    });

                    loop();
                }
            });


            function Star(i) {

                this.x = Math.floor((Math.random() * canvas.width) + 1);
                this.y = Math.floor((Math.random() * canvas.height) + 1);

                this.lag = Math.random() < 0.8 ? Math.floor((Math.random() * 13) + 2) : ( Math.random() * 48 + 2 );//Math.floor((Math.random() * 48) + 2);
                this.t = {x: Math.floor((Math.random() * canvas.width) + 1), y: Math.floor((Math.random() * canvas.height) + 1)};

                this.r = 5;
                this.color = getColor(i);
                this.subState = SUB.FLOCK_IN;



                this.React = function(){
        
                    //abrupt change from resting to this
                    var ratio = (Math.sqrt( square(target.x - this.x) + square(target.y - this.y) ) / (canvas.width));
                    
                    /* attempt to smooth REST -> FLOCK */
                    if(current_state == STATE.REST) this.r = ((Math.floor ( 25 * ratio ) + 1) + this.r * 3) / 4;
                    else this.r = Math.floor ( 25 * ratio ) + 1;

                    switch(current_state){

                        case STATE.HIDE:

                            var ratio = (Math.sqrt( square( this.t.x - this.x ) + square( this.t.y - this.y ) ) / ( canvas.width ));
                            this.r =  Math.floor ( 25 * ratio ) + 1;

                            this.x += (this.t.x - this.x) * .5 / (this.r + this.lag);
                            this.y += (this.t.y - this.y) * .5 / (this.r + this.lag);

                            break;

                            // var xx = (target.x - this.x);
                            // var yy = (target.y - this.y);
                            // var rr = (Math.sqrt( square(xx) + square(yy) ) / (canvas.width / 2));
                            // this.r =  Math.floor ( 25 * ratio ) + 1;
                            
                            // this.x += (xx * 2) / (this.r + this.lag);
                            // this.y += (yy * 2) / (this.r + this.lag);
                            // break;

                        case STATE.FLOCK:
                            
                            switch(this.subState){
                               
                                case SUB.FLOCK_OUT:
                                    //TODO: make this smoother / better arcs
                                    this.x += (Math.round(Math.random()) * 2 - 1) * (Math.floor((Math.random() * 5) + 1)) * .5 /  ( this.r );
                                    this.y += (Math.round(Math.random()) * 2 - 1) * (Math.floor((Math.random() * 5) + 1)) * .5 /  ( this.r );

                                    if (Math.abs(target.x - this.x) > 35 || Math.abs(target.y - this.y) > 35 ){
                                        this.subState = SUB.FLOCK_IN;
                                    }

                                    break;

                                case SUB.REST:

                                    var ratio = (Math.sqrt( square(this.t.x - this.x) + square(this.t.y - this.y) ) / (canvas.width));
                                    this.r =  Math.floor ( 25 * ratio ) + 1;

                                    this.x += (this.t.x - this.x) * .5 / (this.r + this.lag);
                                    this.y += (this.t.y - this.y) * .5 / (this.r + this.lag);

                                    if (Math.abs(target.x - this.x) > ESCAPE_BOUND.X || Math.abs(target.y - this.y) > ESCAPE_BOUND.Y ){
                                        this.subState = SUB.FLOCK_IN;
                                        break;
                                    }

                                    break;
                                case SUB.FLOCK_IN:
                                default:
                                    
                                    /* ESCAPE DISTANCE */
                                    // if (Math.abs(target.x - this.x) > ESCAPE_BOUND.X || Math.abs(target.y - this.y) > ESCAPE_BOUND.Y ){
                                    //     this.subState = SUB.REST;
                                    //     break;
                                    // }

                                    this.x += (target.x - this.x) * .5 / (this.r + this.lag + lagger);
                                    this.y += (target.y - this.y) * .5 / (this.r + this.lag + lagger);

                                    if (Math.abs(target.x - this.x) < 3 && Math.abs(target.y - this.y) < 3){
                                        this.subState = SUB.FLOCK_OUT;
                                    }
                            }

                        case STATE.EXPLODE:

                            switch (this.subState){

                                case SUB.REST:

                                    var ratio = (Math.sqrt( square(this.t.x - this.x) + square(this.t.y - this.y) ) / (canvas.width));
                                    
                                    this.r =  Math.floor ( 25 * ratio ) + 1;

                                    this.x += (this.t.x - this.x) * .5 / (this.r + this.lag);
                                    this.y += (this.t.y - this.y) * .5 / (this.r + this.lag);
                                    
                                    break;

                                case SUB.EXPLODE:
                                default:

                                    var xx = (target.x - this.x);
                                    var yy = (target.y - this.y);

                                    if ( xx > canvas.width / 4 || yy > canvas.height / 4 ) {
                                        this.subState = SUB.REST;
                                        break;
                                    }
                                                                        
                                    this.y += 2 * yy;
                                    this.x += 2 * xx;

                                    break;
                                };

                        case STATE.REST:

                            var ratio = (Math.sqrt( square( this.t.x - this.x ) + square( this.t.y - this.y ) ) / ( canvas.width ));
                            this.r =  Math.floor ( 25 * ratio ) + 1;

                            this.x += (this.t.x - this.x) * .5 / (this.r + this.lag);
                            this.y += (this.t.y - this.y) * .5 / (this.r + this.lag);

                            break;

                    };

              
                    // if (avoid){

                    //     console.log("avoid");


                    // } else if (seek) {
        
                    //     if (this.i == 0){
                            
                    //         this.x += (Math.round(Math.random()) * 2 - 1) * (Math.floor((Math.random() * 5) + 1)) * .5 /  ( this.r );
                    //         this.y += (Math.round(Math.random()) * 2 - 1) * (Math.floor((Math.random() * 5) + 1)) * .5 /  ( this.r );

                    //         if (Math.abs(target.x - this.x) > 35 || Math.abs(target.y - this.y) > 35 ){
                    //             this.i = 1;
                    //         }

                    //     } else {

                    //         this.x += (target.x - this.x) * .5 / (this.r + this.lag + lagger);
                    //         this.y += (target.y - this.y) * .5 / (this.r + this.lag + lagger);


                    //         if (Math.abs(target.x - this.x) < 3 && Math.abs(target.y - this.y) < 3){
                    //             this.i = 0;
                    //         }

                    //     }

                    // } else {

                    //     var xx = (target.x - this.x);
                    //     var yy = (target.y - this.y);

                    //     if (this.i == 2 || xx > canvas.width / 4 || yy > canvas.height / 4){
                            
                    //        this.i = 2;

                    //         var ratio = (Math.sqrt( square(this.t.x - this.x) + square(this.t.y - this.y) ) / (canvas.width));
                    //         this.r =  Math.floor ( 25 * ratio ) + 1;

                    //         this.x += (this.t.x - this.x) * .5 / (this.r + this.lag);
                    //         this.y += (this.t.y - this.y) * .5 / (this.r + this.lag);


                    //     } else {

                    //         this.x += 4 * xx; 
                    //         this.y += 4 * yy;

                    //     }

                    // }
                    
                    
                    ctx.fillStyle = this.color; //getShade(this.color, ratio); 
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

            function getShade(original, ratio){
                if (ratio < .2)  return "rgb( " + Math.min(255, original.r + 255 * 1.5 * ratio) + ", " + Math.min(255, original.g + 255 * 1.5 * ratio) + ", " + Math.min(255, original.b + 255 * 1.5 * ratio) + ")";// return "rgb(" + Math.min(255, c.r + 255 * ratio) + ", " + Math.min(255, c.g + 255 * ratio) + ", " + Math.min(255, c.b + 255 * ratio) + ")";
                else return "rgb(" + Math.max(original.r , original.r + 255 * 1.5 * .1 - 255 * ratio) + ", " + Math.max(original.g, original.r + 255 * 1.5 * .1 - 255 * ratio) + ", " + Math.max(original.b, original.r + 255 * 1.5 * .1 - 255 * ratio) + ")";
            }

            function createStars(){
                for ( var i = 0; i < star_num; i++) stars.push( new Star(i) );
            }


            function loop(){
                setTimeout(function(){
                    drawStars();
                    loop();
                    if (current_state == STATE.FLOCK && lagger > 0) lagger -= 10;

                }, 1000/rate);
            }


            function onResizeDraw(){
                configureCanvas();
                drawStars();
            }
 
            function getColor(n){
                var colors    = [ "#ccff66", "#FFD700","#66ccff", "#ff6fcf", "#ff6666", "#F70000", "#D1FF36", "#7FFF00", "#72E6DA", "#1FE3C7", "#4DF8FF", "#0276FD", "#FF00FF"];
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

                /* constants */
                ESCAPE_BOUND = {X: w / 2, Y: h / 2};
                CANVAS_BOUND = {X: w , Y: h };
            }

            function square(i){
                return i * i;
            }
        })(); 