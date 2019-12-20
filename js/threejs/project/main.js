        /*
        *
        *第三方js库均来自GitHub和Threejs.org
        *模型 动作 镜头 音频来源及版权 请查看设置说明 来源于网络 侵权请联系删除
        *
        *问题：
        *1.模型发生巨大改变时，会穿模（模型衣服穿模），例如：浏览器长时间处于未激活，再次激活会发生
        *2.一些pmx格式模型加载部分贴图出现错误（贴图未加载）
        *3.一些vmd格式镜头文件加载后，镜面出现模糊（如果地面设置为镜面）
        *4.复杂的vmd格式动作文件，解析错误
        *5.系统资源过度消耗，烧显卡 :(
        *
        * @author jzg 
        * http://niuini.com
        * mailjzg@foxmail.com
        * 2017.10
        */

        var container, stats;

        var console,scene,renderer;

        var mesh, effect;
        var helper, ikHelper, physicsHelper;

        var mouseX = 0, mouseY = 0;

        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;
        var play_Width = function(){ 
          return $(".jumbotron").outerWidth();
        };
        var play_Height = function(){ 
          return $(".jumbotron").outerHeight();
        };

      

        var clock = new THREE.Clock();

        //------------------------------------------------------
            var sky, sunSphere, distanceSky , effectControllerSky;

        var sceneManager = {
            sky:null,
            sunSphere:null,
            plane:null,
            helper:null
        };
            
        //可设置--------------------

            //地面尺寸边长
            var palaneSize = 20;

            /*镜面分辨率 值越大镜面越清晰 默认1 如需提升可设置2
                *测试数据单位FPS
                *镜面倍率4 : 23.77  32.12  26.74  ∑  27.54  0%
                *镜面倍率2 : 47.53  47.09  44.24  ∑  46.28  68.1%
                *镜面倍率1 : 52.71  49.01  54.18  ∑  51.96  12.2%
            */ 
            var mirrorPixelRatio = 2;
        //构造场景对象
        function MmdScen(){
            
            //---------------场景
            this.background = 0xffffff;
            this.shadowMap = true;
            //尺寸
            this.size_Width = play_Width();
            this.size_Height = play_Height(); 
            this.devicePixelRatio = window.devicePixelRatio;

            //---------------镜头
            this.camera = null;
            this.cameraControl = null;
        }
        MmdScen.prototype = {
            //初始化场景
            InitRenderer:function(){           
                scene.background = new THREE.Color( this.background );
                renderer.setPixelRatio( this.devicePixelRatio );
                renderer.setSize( this.size_Width, this.size_Height );
                
                //自动更新颜色 效率待测试
                //renderer.autoClearColor = false;

                renderer.shadowMap.enabled = this.shadowMap;
                //默认THREE.PCFShadowMap (default) or 1
                //renderer.shadowMap.type = THREE.BasicShadowMap; 3
                //使用柔光阴影 or 2
                renderer.shadowMap.type = THREE.PCFSoftShadowMap
                // Model specific Shadow parameters
                //是否将材质指定的对面渲染到阴影贴图中。禁用时，必须在光源上设置适当的shadow.bias，以便同时投射和接收阴影的曲面可以正确呈现。默认值为true。
                renderer.shadowMap.renderSingleSided = false;
                //是否将指定为双面的材质视为在渲染阴影贴图时被指定为前端的材质。禁用时，必须在光源上设置适当的shadow.bias，以便同时投射和接收阴影的曲面可以正确呈现。默认值为true。
                renderer.shadowMap.renderReverseSided = false;
                //document.body.appendChild( renderer.domElement );
                $(".jumbotron").append( renderer.domElement );
            },
            
            //添加摄像机
            AddCamera:function(x,y,z){
                this.camera = new THREE.PerspectiveCamera( 45, play_Width() / play_Height(), 1, 2000000 );
                this.camera.position.x = x;
                this.camera.position.y = y;
                this.camera.position.z = z;
                
            },
            //添加摄像机控制器
            AddCameraControl:function(x,y,z){
                this.cameraControl = new THREE.OrbitControls(this.camera, renderer.domElement );
                this.cameraControl.target =  new THREE.Vector3( x,y,z ) ;
            },
            MmdScenInit:function(){
                this.InitRenderer();
                this.AddCamera(0,20,50);
                this.AddCameraControl(0, 20, 0);
                
            }
        }

        //构造灯光对象
        function MmdLight(){
            //---------------光
            this.ambientLight = null;
            this.directionalLight = null;
            this.spotLight = null;
            this.ds = true;
            this.ss = false;

            this.directionalLightHleper = null;
            this.spotLightHelper = null;
            this.lightHelper = false;
        }
        MmdLight.prototype = {
            AddAmbientLight:function(color){
                
                this.RemoveAmbientLight();
                this.ambientLight = new THREE.AmbientLight( color );
                scene.add( this.ambientLight );
            },
            RemoveAmbientLight:function(){
                if(this.ambientLight){
                    scene.remove(this.ambientLight);
                    this.ambientLight = null;
                }
            },

            AddDirectionalLight:function(color){
                this.RemoveDirectionalLight();
                
                var Definition = 1;
                var directionalLight = new THREE.DirectionalLight( color );
                
                directionalLight.position.set( -10, 15, 20 );
                // Shadow parameters
                directionalLight.castShadow = this.ds;
                directionalLight.shadow.mapSize.x = 1024*Definition;
                directionalLight.shadow.mapSize.y = 1024*Definition;
                directionalLight.shadow.camera.right = 20;
                directionalLight.shadow.camera.top = 30;
                directionalLight.shadow.camera.left = -20;
                directionalLight.shadow.camera.bottom = -20;

                
                directionalLight.shadow.bias = -0.001;

                scene.add( directionalLight );
                this.directionalLight = directionalLight;   
            },
            RemoveDirectionalLight:function(){
                if(this.directionalLight){
                    scene.remove(this.directionalLight);
                    this.directionalLight = null;
                }
            },

            AddSpotLight:function(color){
                this.RemoveSpotLight(); 
                //光源点距离物体越远，阴影越模糊（淡）
                var spotLight = new THREE.SpotLight( color );
                spotLight.position.set( 5, 30, 15 );
                spotLight.angle = 0.8;
                spotLight.intensity = 0.7;
                spotLight.penumbra = 0.8;
                spotLight.castShadow = this.ss;

                // Model specific Shadow parameters
                spotLight.shadow.bias = -0.001;
                
                scene.add( spotLight );
                scene.add( spotLight.target );
                this.spotLight = spotLight;
            },
            RemoveSpotLight:function(){
                if(this.spotLight){
                    scene.remove(this.spotLight);
                    this.spotLight = null;
                }
            },

            LightShadow:function(){
                if( this.directionalLight && this.ds){
                    this.directionalLight.castShadow = true;
                }
                if( this.spotLight && this.ss){
                    this.spotLight.castShadow = true;
                }
            },
            LightNotShadow:function(){
                if( this.directionalLight ){
                    this.directionalLight.castShadow = false;
                }
                if( this.spotLight ){
                    this.spotLight.castShadow = false;
                }
            },

            AddLightHelper:function(){
                //光线调试
                //shadowCameraHelper1 = new THREE.CameraHelper(  SGBN("spotLight").shadow.camera );
                //scene.add( shadowCameraHelper1 );
                if(this.directionalLight){
                    this.directionalLightHleper = new THREE.CameraHelper(  this.directionalLight.shadow.camera );
                    scene.add( this.directionalLightHleper );
                }
                if(this.spotLight){
                    this.spotLightHelper = new THREE.SpotLightHelper(  this.spotLight );
                    scene.add( this.spotLightHelper );
                }
                this.lightHelper = true;
                
                //lightHelper = new THREE.SpotLightHelper(  SGBN("directionalLight") );
                //scene.add( lightHelper );
            },
            RemoveLightHelper:function(){
                if(this.directionalLightHleper){
                    scene.remove( this.directionalLightHleper );
                    this.directionalLightHleper = null;
                }
                if(this.spotLightHelper){
                    scene.remove( this.spotLightHelper );
                    this.spotLightHelper = null;
                }
                this.lightHelper = false;
            },

            MmdLightInint:function(){
                this.AddAmbientLight(0x666666);
                this.AddDirectionalLight(0x333333);
                this.AddSpotLight(0x223344);
                //this.AddLightHelper();
                //this.RemoveLightHelper();
                //this.RemoveAmbientLight();
                //this.RemoveDirectionalLight();
                //this.RemoveSpotLight();
            }
        }
        
        //构造地面对象
        function MmdPlane(){
            this.gridHelper = null;
            this.gridHelperName = "无";
            this.plane = null;
            this.planeName = "无";
        }
        MmdPlane.prototype = {
            AddGridHelper:function(){
                this.RemoveGridHelper();
                this.gridHelper = new THREE.GridHelper( 200, 10, 0x808080, 0x808080 );
                this.gridHelperName = "矩形";
                scene.add( this.gridHelper );
            },
            AddPolarGridHelper:function(){
                this.RemoveGridHelper();
                this.gridHelper = new THREE.PolarGridHelper( 100, 10 );
                this.gridHelperName = "圆";
                scene.add( this.gridHelper );
            },
            RemoveGridHelper:function(){
                if(this.gridHelper){
                    scene.remove(this.gridHelper);
                    this.gridHelper = null;
                    this.gridHelperName = "无";
                }
            },

            AddPlaneMirror:function(){
                
                this.RemovePlane();
                var groundMirror = new THREE.Mirror( palaneSize * 10,palaneSize * 10, {
                    clipBias: 0.003,
                    //镜面分辨率
                    textureWidth: play_Width()*mirrorPixelRatio * window.devicePixelRatio,
                    textureHeight: play_Height()*mirrorPixelRatio * window.devicePixelRatio,
                    color: 0x777777
                } );
                //alert(window.innerWidth()*2 * window.devicePixelRatio)
                //console.log(groundMirror)
                groundMirror.rotateX( - Math.PI / 2 );

                this.plane = groundMirror;
                this.planeName = "镜面";
                scene.add( groundMirror ); 
            },
            AddPlaneNormal:function(){
                //scene.background = new THREE.Color( 0x000000 ); 
                
                this.RemovePlane(); 
                var planeGeometry = new THREE.PlaneGeometry(palaneSize * 10, palaneSize * 10);
                var planeMaterial = new THREE.MeshLambertMaterial({
                  color: 0xcccccc
                });

                var plane = new THREE.Mesh(planeGeometry, planeMaterial);
                plane.receiveShadow = true;

                plane.rotation.x = -0.5 * Math.PI;
                plane.position.y = 0;
                plane.position.z = 0;

                this.plane = plane;
                this.planeName = "普通";
                scene.add(plane);
            },
            RemovePlane:function(){
                if(this.plane){
                    scene.remove(this.plane);
                    this.plane = null;
                    this.planeName = "无";
                }
            },

            MmdPlaneInit:function(){
                //this.AddGridHelper();
                //this.AddPolarGridHelper();
                //this.RemoveGridHelp();
                this.AddPlaneMirror();
                //this.AddPlaneNormal();
                //this.RemovePlane();
            }
        }
        var scene    = new THREE.Scene();
        var renderer = new THREE.WebGLRenderer( { antialias: true  } );
        
        var myMmdScen  = new MmdScen();
        var myMmdLight = new MmdLight();
        var myMmdPlane = new MmdPlane();
        function Init(){
            myMmdScen.MmdScenInit();
            myMmdLight.MmdLightInint();
            myMmdPlane.MmdPlaneInit();
            //AddLightHelper();
            initSky();
            init();
            InitGui()
            Render();
        }


        

        function SGBN(str){

            return scene.getObjectByName(str);
        }

        function SLOG(str){
            if(str){
                loadingLog += str+"<br/>";
                $("#progressLog").html(loadingLog);
                return true;
            }else{
                loadingLog += "空LOG请找原因"+"<br/>";
                $("#progressLog").html(loadingLog);
                return false;
            }                
        }
       

        function initSky() {

            // Add Sky Mesh
            sky = new THREE.Sky();
            sky.name = "sky";
            scene.add( sky.mesh );

            // Add Sun Helper
            sunSphere = new THREE.Mesh(
                new THREE.SphereBufferGeometry( 20000, 16, 8 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff } )
            );
            sunSphere.position.y = - 700000;
            sunSphere.visible = false;
            sunSphere.name = "sunSphere";
            scene.add( sunSphere );

            /// GUI

            distanceSky = 400000;

            effectControllerSky  = {
                turbidity: 10,
                rayleigh: 2,
                mieCoefficient: 0.005,
                mieDirectionalG: 0.8,
                luminance: 1,
                inclination: 0.0, // elevation / inclination
                azimuth: 0.25, // Facing front,
                sun: ! true
            };

            guiSkyChanged();
        }

        function guiSkyChanged() {

            var uniforms = sky.uniforms;
            uniforms.turbidity.value = effectControllerSky.turbidity;
            uniforms.rayleigh.value = effectControllerSky.rayleigh;
            uniforms.luminance.value = effectControllerSky.luminance;
            uniforms.mieCoefficient.value = effectControllerSky.mieCoefficient;
            uniforms.mieDirectionalG.value = effectControllerSky.mieDirectionalG;

            var theta = Math.PI * ( effectControllerSky.inclination - 0.5 );
            var phi = 2 * Math.PI * ( effectControllerSky.azimuth - 0.5 );

            sunSphere.position.x = distanceSky * Math.cos( phi );
            sunSphere.position.y = distanceSky * Math.sin( phi ) * Math.sin( theta );
            sunSphere.position.z = distanceSky * Math.sin( phi ) * Math.cos( theta );

            sunSphere.visible = effectControllerSky.sun;

            sky.uniforms.sunPosition.value.copy( sunSphere.position );

            renderer.render( scene, myMmdScen.camera );

        }

        //加载过程  所有的加载都调用此函数
        var loadingLog = "";
        function onProgress ( xhr ) {
            var url = decodeURI(xhr.target.responseURL);
            var fileName = url.substr(url.lastIndexOf("/")+1);
            var fileType = url.substr(url.lastIndexOf(".")+1);
            switch(fileType)
            {
            case "pmx":
              fileType = "模型文件";
              break;
            case "vmd":
              fileType = "动作文件";
              break;
            case "tga":
              fileType = "tga文件";
              break;
            case "mp3":
              fileType = "音频文件";
              break;
            case "wav":
              fileType = "音频文件";
              break;
            default:
              fileType = "其他文件";
            }
            
            if ( xhr.lengthComputable ) {
                
                if(xhr.loaded == xhr.total){
                    $("#progressBar").attr("class","progress-bar progress-bar-success");
                    
                    SLOG(fileType+":"+fileName+"加载完成");
                    
                    $("#progressTitle").html("");
                    
                    if(fileType == "音频文件")SLOG("所有文件已加载"+"<br/>"+"处理文件中...");   
                    

                    
                }else{
                    var percentComplete = Math.round((xhr.loaded / xhr.total * 100),2);
                    var progressBarStyleValue = percentComplete+"%" 
                    $("#progressTitle").html(fileType+":"+fileName+"已加载"+ progressBarStyleValue+'<span class="glyphicon glyphicon-arrow-down" style="color: rgb(0, 255, 255); font-size: 9px;"></span>' );
                    $("#progressBar").attr("style","width:"+progressBarStyleValue+";");
                    $("#progressBar").attr("class","progress-bar progress-bar-info") 
                }
            }
            else{
                SLOG(fileType+":"+fileName+"加载未进行，请检查网络");
                    
                
            }
        };

        //加载失败  所有的加载都调用此函数
        var onError = function ( xhr ) {
            var url = decodeURI(xhr.target.responseURL);
            fileName = url.substr(url.lastIndexOf("/")+1) 
            console.log("加载失败"+"\n"+"失败地址："+fileName);
        };
        

        function init() { 

            var loader = new THREE.MMDLoader();
            helper = new THREE.MMDHelper();
            var audioParams ={ delayTime:0 };// { delayTime: 160 * 1 / 30 };
            loader.load( modelFile, motionFiles, function ( object ) {
                mesh = object;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                helper.add( mesh );
                helper.setAnimation( mesh );
                //helper.setPhysics( mesh );
                /////////////////////////////////////////////////////
                /*
                 * Note: create CCDIKHelper after calling helper.setAnimation()
                 */
                //骨骼辅助显示
                ikHelper = new THREE.CCDIKHelper( mesh );
                ikHelper.visible = false;
                scene.add( ikHelper );

                /*
                 * Note: You're recommended to call helper.setPhysics()
                 *       after calling helper.setAnimation().
                 *
                 */
                 //物理刚体辅助显示
                helper.setPhysics( mesh );
                physicsHelper = new THREE.MMDPhysicsHelper( mesh );
                physicsHelper.visible = false;
                scene.add( physicsHelper );

                //
                //描边 已取消
                //effect.enabled = false;

                loader.loadVmds( cameraFiles, function ( vmd ) {
                    helper.setCamera( myMmdScen.camera );
                    loader.pourVmdIntoCamera( myMmdScen.camera, vmd );
                    helper.setCameraAnimation( myMmdScen.camera );
                    //默认初始化不开启自动镜头,改到加载后，时间同步、
                    //更改 开启镜头
                    //helper.doCameraAnimation = true;
                    if(helper.doCameraAnimation)SLOG("开启自动镜头");
                    loader.loadAudio( audioFile, function ( audio, listener ) {
                        helper.setAudio( audio, listener, audioParams );
                        //===================
                        //helper.doCameraAnimation = false;

                        /*
                         * Note: call this method after you set all animations
                         *       including camera and audio.
                         */
                        //console.log("统一模型工作时间");
                        // 该函数作用:查找摄像机 音频 动作数据 模块 中最长的时间 当到达最最长时间 所有都停止 如果未设置 则模块到达自己结束时间停止 不会同步
                        helper.unifyAnimationDuration();


                        if(myMmdScen.camera.add( listener ))SLOG("音频已绑定至相机");


                        if(scene.add( mesh ))SLOG("模型已添加至场景");  
                        
                        if(mesh.add( audio ))SLOG("音频已添加至模型");
                                       
                        readyStarHtml();
                        

                        renderer.render( scene, myMmdScen.camera );

                        SLOG("就绪  &nbsp :)");

                        //helper.doCameraAnimation = false;
              }, onProgress, onError );

                }, onProgress, onError );

            }, onProgress, onError );
            //effect.enabled = false;
            //document.getElementById('otherinfo1').innerHTML = "";
        }

        function readyStarHtml(){

            //进度条移除
            $("#progressModular").remove();
            //显示播放按钮
            $(".begainPlayBtn").css("display","inline");
            
            $(".controlerPause").css("display","inline");
            
            //延时隐藏加载信息
            var c=5;
            var t;
            function timedCount()
            {
            
            $("#progressLog").html(loadingLog + "该信息框将在"+c+"秒后自动隐藏，查看请点击设置显示LOG按钮<br/>");
            
            c=c-1;
            if(!c){
                clearTimeout(t);
                $(".infoLog").slideUp("slow");
                $("#progressLog").html(loadingLog);
                return;
            }
            t=setTimeout(function (){timedCount();},1000);
            
            }
            timedCount();
        }

        var phongMaterials;
        var originalMaterials;

        function makePhongMaterials ( materials ) {

            var array = [];

            for ( var i = 0, il = materials.length; i < il; i ++ ) {

                var m = new THREE.MeshPhongMaterial();
                m.copy( materials[ i ] );
                m.needsUpdate = true;

                array.push( m );

            }

            phongMaterials = array;
        }

        var renderCount = 1;
        var oldTime1 = 0;
        var newTime1 = 0;
        var fpsArray =[];
        function Render() {
            //console.log(camera)
            if ( ready ) {
                //clock.getDelta() 返回和上一次执行的时间差 newTime - this.oldTime
                updatMmd();

                //模型动作渲染  参数：时间差  效果：不同时间来产生不同帧 达到动画效果
                helper.animate( clock.getDelta() );
                //console.log(helper);
            }else if( pause ){
                helper.animate( 0 );
                //helper.audioManager.audio.isPlaying = false;
                //console.log( helper.audioManager.audio.isPlaying );
                
                //防止时间差扩大
                clock.getDelta();
            }

            renderer.render( scene, myMmdScen.camera );
           
            //刷新30次后计算时间  一次的fps计算  1s = 1000ms /时间差 30次 分子分母同乘30
            if( renderCount % 30 == 0){
                newTime1 = Date.now();
                var fps = Math.round(30000 / (newTime1 - oldTime1));
                //fpsArray.push(fps);
                document.getElementById('otherinfo2').innerHTML ="FPS:"+ fps;
                oldTime1 =  newTime1;
            }
            /*
            if( renderCount % 2000 == 0){
                //var sum = eval(fpsArray.join("+"));
                //alert("已绘制"+renderCount+"帧，平均FPS："+(sum/fpsArray.length*100)/100);
                
                    //fpsArray = [];
            }
            */
            
            //effect.render( scene, camera );
            myMmdScen.cameraControl.update();

            renderCount++;
            requestAnimationFrame( Render );
        }

        function updatMmd(){
            //该函数默认自动播放音频
            //console.log(helper.setAudio().audioManager().audio.startplay);
            //console.log(clock.getDelta())
            if ( physicsHelper !== undefined && physicsHelper.visible ) physicsHelper.update();
            if ( ikHelper !== undefined && ikHelper.visible ) ikHelper.update();
        }

        function InitGui(){
            control = new function() {
                //-------------------------------------
               
                //模型设置

                    //this.animation = true;  加载pmx 有bug 已用其他方法实现
                    this.gradient_mapping = true;
                    this.ik = true;
                    //this.outline = false;   描边取消 不需要改设置 因为加载天空 贴图错乱:( 
                    this.physics =  true;
                    this.show_IK_bones = false;
                    this.show_rigid_bodies = false;
               
                //--------------------------------------
                
                //光线设置
                    this.castShadow = myMmdScen.shadowMap;
                    this.lightHelper = myMmdLight.lightHelper;
                    
                    if(myMmdLight.spotLight){
                        this.spotLight = true;
                        this.spotLightSet = myMmdLight.spotLight.color.getHex();
                    }else{
                        this.spotLight = false;
                        this.spotLightSet = 0x000000;
                    }
                    
                    if(myMmdLight.directionalLight){
                        this.directionalLight = true;
                        this.directionalLightSet = myMmdLight.directionalLight.color.getHex();
                    }else{
                        this.directionalLight = false;
                        this.directionalLightSet = 0x000000;
                    }
                    
                    if(myMmdLight.ambientLight){
                        this.ambientLight = true;
                        this.ambientLightSet = myMmdLight.ambientLight.color.getHex();
                    }else{
                        this.ambientLight = false;
                        this.ambientLightSet = 0x000000;
                    }

                    this.scenBackColor = scene.background.getHex();
                    
                //--------------------------------------
               
                //场景设置
                    this.sky = true;
                    this.plane = myMmdPlane.planeName;
                    this.gridHelper = myMmdPlane.gridHelperName;


                this.showLog = false;
                
            };

            
            AddControlGui(control );
        }


        

        function AddControlGui(controlObject) {
            var gui = new dat.GUI({ autoPlace: false });

            gui.remember(control);

            GUIbtn = gui;
            $("#guiDat").append(gui.domElement);

            var mmdSet = gui.addFolder("模型设置");

                /*mmdSet.add( controlObject, 'animation' ).name("动画").onChange( function () {
                    helper.doAnimation = control.animation;
                } );
                */
                
                mmdSet.add( controlObject, 'gradient_mapping' ).name("渐变映射").onChange( function () {

                    if ( originalMaterials === undefined ) originalMaterials = mesh.material;
                    if ( phongMaterials === undefined ) makePhongMaterials( mesh.material );

                    if ( control.gradient_mapping ) {

                        mesh.material = originalMaterials;

                    } else {

                        mesh.material = phongMaterials;

                    }

                } );

                mmdSet.add( controlObject, 'ik' ).name("脚步").onChange( function () {
                    helper.doIk = control.ik;
                } );

                /*mmdSet.add( controlObject, 'outline' ).name("线条").onChange( function () {
                    effect.enabled = control.outline;
                } );
                */

                mmdSet.add( controlObject, 'physics' ).name("物理").onChange( function () {
                    helper.enablePhysics( control.physics );
                } );

                mmdSet.add( controlObject, 'show_IK_bones' ).name("显示骨骼").onChange( function () {
                    ikHelper.visible = control.show_IK_bones;
                } );

                mmdSet.add( controlObject, 'show_rigid_bodies' ).name("显示刚体").onChange( function () {
                    if ( physicsHelper !== undefined ) physicsHelper.visible = control.show_rigid_bodies;
                } );

            //========================================================

            var sceneSet = gui.addFolder("场景设置");

                skySunSet = sceneSet.addFolder("天空设置");

                    skySunSet.add( effectControllerSky, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiSkyChanged ).name("浊度");
                    skySunSet.add( effectControllerSky, "rayleigh", 0.0, 4, 0.001 ).onChange( guiSkyChanged ).name("瑞利(亮度)");
                    skySunSet.add( effectControllerSky, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiSkyChanged ).name("系数");
                    skySunSet.add( effectControllerSky, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiSkyChanged ).name("散射");
                    skySunSet.add( effectControllerSky, "luminance", 0.0, 2 ).onChange( guiSkyChanged ).name("亮度");
                    skySunSet.add( effectControllerSky, "inclination", 0, 1, 0.0001 ).onChange( guiSkyChanged ).name("倾斜");
                    skySunSet.add( effectControllerSky, "azimuth", 0, 1, 0.0001 ).onChange( guiSkyChanged ).name("方位角");
                    skySunSet.add( effectControllerSky, "sun" ).onChange( guiSkyChanged ).name("太阳");

                sceneSet.add( controlObject, 'sky' ).name("天空").onChange(function(value){
                    if(value){
                        scene.add(sky.mesh);
                    }else{
                        scene.remove(sky.mesh);
                    }
                });

                
                sceneSet.add( controlObject, 'plane', [ '镜面', '普通', '无' ] ).name("地面").onChange(function(value){
                    if(value == "镜面"){
                        myMmdPlane.AddPlaneMirror();
                    }else if(value == "普通"){
                        myMmdPlane.AddPlaneNormal();
                    }else if(value == "无"){
                        myMmdPlane.RemovePlane();
                    } 
                });

                sceneSet.add( controlObject, 'gridHelper' , [ '矩形', '圆', '无' ] ).name("网格").onChange(function(value){
                    if(value == "矩形"){
                        myMmdPlane.AddGridHelper();
                    }else if(value == "圆"){
                        myMmdPlane.AddPolarGridHelper();
                    }else if(value == "无"){
                        myMmdPlane.RemoveGridHelper();
                    } 
                });
            
            //========================================================

            var lightColorSet = gui.addFolder("光线设置");


                lightColorSet.add( controlObject, 'castShadow' ).name("显示阴影").onChange( function (value) {
                    
                    if(value){
                        myMmdLight.LightShadow();
                    }else{
                        myMmdLight.LightNotShadow();

                    }
                });
                lightColorSet.add( controlObject, 'lightHelper' ).name("显示光线调试").onChange( function (value) {
                    if(value){
                        myMmdLight.AddLightHelper();
                    }else{
                        myMmdLight.RemoveLightHelper();
                    }
                });

                //--------------------------------------------------------------
                lightColorSet.add(controlObject, 'spotLight').name("点光").onChange(
                    function (value) {
                        if(value)
                            myMmdLight.AddSpotLight(new THREE.Color(controlObject.spotLightSet));
                        else 
                            myMmdLight.RemoveSpotLight();
                });
                
                lightColorSet.addColor(controlObject, 'spotLightSet').name("点光设置").onChange(
                    function () {
                        if(myMmdLight.spotLight){
                            myMmdLight.spotLight.color = new THREE.Color(controlObject.spotLightSet)
                        }
                        
                    });

                //--------------------------------------------------------------
                lightColorSet.add(controlObject, 'directionalLight').name("平行光").onChange(
                    function (value) {
                        if(value)
                            myMmdLight.AddDirectionalLight(new THREE.Color(controlObject.directionalLightSet));
                        else
                            myMmdLight.RemoveDirectionalLight();
                    });
                
                lightColorSet.addColor(controlObject, 'directionalLightSet').name("平行光设置").onChange(
                    function () {
                        if(myMmdLight.directionalLight){
                            myMmdLight.directionalLight.color = new THREE.Color(controlObject.directionalLightSet);
                        }
                        
                    });

                //--------------------------------------------------------------

                lightColorSet.add(controlObject, 'ambientLight').name("环境光").onChange(
                    function (value) {
                        if(value){
                            myMmdLight.AddAmbientLight(new THREE.Color(controlObject.ambientLightSet));
                        }
                        else{
                            myMmdLight.RemoveAmbientLight();
                        } 
                    });
                lightColorSet.addColor(controlObject, 'ambientLightSet').name("环境光设置").onChange(
                    function () {
                        if(myMmdScen.ambientLight){
                            myMmdScen.ambientLight.color = new THREE.Color(controlObject.ambientLightSet);
                        }
                        
                    });
                
                //--------------------------------------------------------------
                lightColorSet.addColor(controlObject, 'scenBackColor').name("场景色").onChange(
                    function () {
                        scene.background = new THREE.Color(controlObject.scenBackColor);
                    });
                scene.background
            

            //=============================================================
            
            gui.add( controlObject, 'showLog').name("显示Log").onChange(function (value){
                if(value){
                    $(".infoLog").show();
                }else{
                    $(".infoLog").hide();
                }

            });
        }


        //---------------------------------------------------------
        //屏幕尺寸变化
        function HandleResize() {
            SLOG("屏幕发生变化");

            if(isFullscreen()){
                SLOG("全屏");
                $("body").css({
                  "overflow":"hidden"
                  
                });
                $("canvas").css({
                  "border-radius":"0px",
                  
                });
                 $(".project_container").css({
                  "position":"fixed",
                  "top":"0px",
                  "left":"0px",
                  "width":window.innerWidth+"px",
                  "height":screen.height+"px",
                  "z-index":"99999",
                  "border-radius":"0px",
                  
                });

               }else{
                SLOG("退出全屏");

                 $("body").css({
                    "overflow":""
                    
                  });
                  $("canvas").css({
                    "border-radius":"3px",
                    
                  });
                   $(".project_container").css({
                    "position":"relative",
                    "top":"0px",
                    "left":"0px",
                    "width":"auto",
                    "height":"600px",
                    "z-index":"",
                    "border-radius":"3px",
                    
                  }); 
                  
               } 
               myMmdScen.camera.aspect = play_Width() / play_Height();
               myMmdScen.camera.updateProjectionMatrix();
               //effect.setSize( window.innerWidth(), window.innerHeight() );
               renderer.setSize( play_Width(), play_Height() );
        }
        //进入全屏
        function requestFullScreen() {
              var de = document.documentElement;
              if (de.requestFullscreen) {
                  de.requestFullscreen();
              } else if (de.mozRequestFullScreen) {
                  de.mozRequestFullScreen();
              } else if (de.webkitRequestFullScreen) {
                  de.webkitRequestFullScreen();
             }
        }
        //退出全屏
        function exitFullscreen() {
             var de = document;
             if (de.exitFullscreen) {
                 de.exitFullscreen();
             } else if (de.mozCancelFullScreen) {
                 de.mozCancelFullScreen();
             } else if (de.webkitCancelFullScreen) {
                 de.webkitCancelFullScreen();
             }            
        }

        //判断全屏
        function isFullscreen() {
            var de = document;
            var fullscreenElement =
                de.fullscreenEnabled
                || de.mozFullscreenElement
                || de.webkitFullscreenElement;
            var fullscreenEnabled =
                de.fullscreenEnabled
                || de.mozFullscreenEnabled
                || de.webkitFullscreenEnabled;
            if (fullscreenElement == null)
            {
                return false;
            } else {
                return true;
            }
        }
        //
        //---------------------------------------------------------
        
        window.onload = Init();
        window.addEventListener('resize', HandleResize, false);
    