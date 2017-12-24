function initLottery(pMsg) {

    var barHeight = 400,//边框的高度
        barWidth = 800,//边框的宽度
        barWeight = 5,//边框的厚度
        ballNum = 40,//球的数量
        ballRadius = 15,//球的半径
        fontHeight = 36,//文字的高度
        dropEndX = document.documentElement.clientWidth/4 *3,
        dropEndY = document.documentElement.clientHeight/8 * 7,
        canvasLeft = 0,//画布的左上角x坐标
        canvasTop = 0;//画布的左上角y坐标

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;


    //是否跳动
    var isActiveBall = false;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.getElementById('lotterySys'),
        engine: engine,
        options: {
            width: barWidth,
            height: barHeight,
            wireframes: false,
            background:'transparent',
            render:"red"
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // an example of using beforeUpdate event on an engine
    Events.on(engine, 'beforeUpdate', function(event) {
        var engine = event.source;

        // apply random forces every 5 secs
        if (event.timestamp % 500 < 50 && isActiveBall)
            applyForce(engine);
    });

    var bodyStyle = { fillStyle: '#9441cc' };

    // scene code
    World.add(world, [
        //上面的边
        Bodies.rectangle(barWidth/2, barWeight/2, barWidth, barWeight, { isStatic: true, render:bodyStyle }),
        //左边的边
        Bodies.rectangle(barWeight/2, barHeight/2, barWeight, barHeight, { isStatic: true, render: bodyStyle }),
        //下面的边
        Bodies.rectangle(barWidth/2, barHeight - barWeight/2, barWidth, barWeight, { isStatic: true, render: bodyStyle }),
        //右边的边
        Bodies.rectangle(barWidth - barWeight/2, barHeight/2, barWeight, barHeight, { isStatic: true, render: bodyStyle }),
        //设置文字的遮挡
        //Bodies.rectangle(barWidth/2, barHeight/2,220 , fontHeight, { isStatic: true, render: {fillStyle:'transparent'} })
        //(barWidth - barWeight*2)*0.5
        ]);

    //球的初始化位置信息
    var leftInit = ballRadius + barWeight;//球的初始化的靠近左边的x坐标
    var randomScopeX = barWidth - barWeight*2 - ballRadius*2;
    var topInit = ballRadius + barWeight;//球的初始化靠近上面的y坐标
    var randomScopeY =  (barHeight - barWeight*2 - ballRadius*2)/4;//随机的纵坐标

    //根据抽奖的奖项来设置球
    for (var i = 0; i < ballNum; i++) {    
        World.add(world, Bodies.circle(leftInit+Math.random()*randomScopeX,Math.random()*randomScopeY+topInit, ballRadius, {
            //restitution: 1,
          render: {
            fillStyle: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"][Math.round(Math.random() * 3)]
          },
          ballFlag:i
        }));
    }

    /*检测是否有越过边界的球，将球拉回边界*/
    function setPosition(body){

        var topLimit = barWeight + ballRadius;
        var bottomLimit = barHeight - barWeight - ballRadius;

        var leftLimit = barWeight + ballRadius;
        var rightLimit = barWidth - barWeight - ballRadius;

        var x = body.position.x;
        var y = body.position.y;

        if(!body.isStatic){
            //debugger;
            //向上越界
            if(body.position.y < topLimit){
                y = topLimit;
            }
            
            //向下越界
            if(body.position.y > bottomLimit){
                y = bottomLimit;
            }
            
            //向左越界
            if(body.position.x < leftLimit){
                x = leftLimit;
            }

            if(body.position.x > rightLimit){
                //向右越界
                x = rightLimit;
            }

            //设置位置
            Matter.Body.setPosition(body, {
                x:x,
                y:y
            })

        }
    }

    //对框架里面的 元素添加一个向上的随机力量
    function applyForce(engine) {
        var bodies = Composite.allBodies(engine.world);
        var negativeHeight = barHeight - barWeight - 100;
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            setPosition(body);
            if (!body.isStatic && body.position.y >= negativeHeight) {
                var forceMagnitude = 0.02 * body.mass;
                Body.applyForce(body, body.position, {
                    x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                    y: -forceMagnitude + Common.random() * -forceMagnitude
                });
            }
        }
    };
    //设置球的质量 0 是软体物体 1 是硬体物体
    function setMass(v){
        var bodies = Composite.allBodies(engine.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            Matter.Body.set(body, 'restitution', v)
        }        
    };

    //抛出一个球
    function castBall(num,fun){
        var bodies = Composite.allBodies(engine.world);
        for(var i = 0 ; i < bodies.length; i++){
            var body = bodies[i];
            if(!body.isStatic && body.ballFlag == num){
                
                Matter.Composite.remove(engine.world, body);
                //获取球儿的x,y坐标模拟抛出的一个效果
                var x = body.position.x + canvasLeft;
                var y = body.position.y + canvasTop;
                var bgColor = body.render.fillStyle;
                var dv = document.createElement("div");
                dv.style.borderRadius = '50%'; 
                dv.style.backgroundColor = bgColor;
                dv.style.height = ballRadius*2 + "px";
                dv.style.width = ballRadius*2 + "px";
                dv.style.display = "none";
                dv.className = "simulateBall";
                document.body.appendChild(dv);
                //debugger;
                $('.simulateBall').css('display','block').fly({
                    start:{
                      left: canvasLeft + x,  //开始位置（必填）#fly元素会被设置成position: fixed
                      top: canvasTop + y,  //开始位置（必填）
                      width:ballRadius*2,
                      height:ballRadius*2
                    },
                    end:{
                      left: dropEndX, //结束位置（必填）
                      top: dropEndY,  //结束位置（必填）
                      width: ballRadius*2, //结束时高度
                      height: ballRadius*2 //结束时高度
                    },
                    onEnd: function(){
                        //debugger;
                        $('.simulateBall').remove();
                        // self.showDialog();
                        if( typeof fun == "function"){
                            fun();
                        }
                        //this.destory(); //销毁抛物体   
                    } //结束回调*/
                    /*autoPlay: false, //是否直接运动,默认true
                    speed: 1.1, //越大越快，默认1.2
                    vertex_Rtop: 100, //运动轨迹最高点top值，默认20*/
                        
                });
                break;
            }
        }        
    }

    /*控制效果的切换效果*/
    function changeState(flag){
    	
        if(flag != isActiveBall){
            isActiveBall = flag;
            if(isActiveBall){
                setMass(1);
                engine.world.gravity.y = 1.2;
                engine.world.gravity.x = 0;
            }else{
                setMass(0);
                softGravity();
            }    
        }
        
    }


    //反重力效果
    let inc = 0;
    function softGravity() {
        if(!isActiveBall){
            if(inc > 8){
              engine.world.gravity.x = Math.cos(inc / 55)
              engine.world.gravity.y = Math.sin(inc / 80)
            }
            inc++;
            requestAnimationFrame(softGravity.bind(this))            
        }

    };

    //执行一次反重力效果 之后连续绑定
    softGravity();

    // fit the render viewport to the scene
    /*Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });*/
    $("#lotterySys").css("display","block");
    return {
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        },
        changeState:changeState,
        castBall:castBall
    };
};
//var lotterySys =  initLottery();