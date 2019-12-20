var checkBtn = new mmdPlayOrPause();
        var pause = false;
        var ready = false;
        //通过设置pause = true 执行 render函数中 if（pause）语句 传入时间差0来实现动作暂停（一直渲染前时间差下的帧） 并不是真正的暂停 设置doAnimatio = false;可以达到暂停效果 但pmx文件用此方法，模型或出现错误  

        function mmdPlayOrPause(){
            this.play = function (){
                ready = true;
                pause = false;
                //helper.doAnimation = true;
                $("#controlerPause").attr("class","fa fa-pause");
                $(".controlerPause").attr("title","暂停").tooltip('fixTitle');

                $("#begainPlayBtn").attr("class","fa fa-pause");
                $("#begainPlayBtn").html("暂停");
            };
            this.pause = function (){
                ready = false;
                pause = true;
                //helper.audioManager.audio.pause();
                //helper.doAnimation = false;
                $("#controlerPause").attr("class","fa fa-play");
                $(".controlerPause").attr("title","继续").tooltip('fixTitle');

                $("#begainPlayBtn").attr("class","fa fa-play");
                $("#begainPlayBtn").html("继续");

            };
            this.check = function(){
                if($("#controlerPause").attr("class") == "fa fa-play" ){
                    this.play();
                }else{
                    this.pause();
                }
            };

            
        }
        //底部播放暂停按钮，如果页面有警示框则关闭
        $(".controlerPause").click(function (){ 
           
            if($("#begainPlayBtn").attr("class") == "fa fa-play")$("#closeAlertBtn").trigger("click");
            checkBtn.check();

        });
        

        //重写关闭操作 第一次执行关闭警示框 然后检查暂停和播放
        $(".close.begainPlayBtn").click(function(){
            if($("#begainPlayBtn").html() == "开始" ){
                $(".row.tipAlert").attr("style","display:none;");
            }
            checkBtn.check();
        });

        //关闭警示框按钮
        $("#closeAlertBtn").click(function(){
            $(".row.tipAlert").attr("style","display:none;");
        })

        //显示信息按钮
        $("#controlerInfo").click(function (){
            if( $(".row.tipAlert").is(":hidden")){
                $(".row.tipAlert").show();
                $(".controlerInfo").attr("title","隐藏信息").tooltip('fixTitle').tooltip('show');
            }
            else{
                
               $(".row.tipAlert").hide();
               $(".controlerInfo").attr("title","显示信息").tooltip('fixTitle').tooltip('show');
            } 

        });

        //镜头控制按钮
        $("#controlerVideo").click(function (){
            if( $("#controlerVideo").attr("class") == "fa fa-mouse-pointer"){
                $("#controlerVideo").attr("class","fa fa-video-camera");
                $(".controlerVideo").attr("title","自动镜头").tooltip('fixTitle').tooltip('show');
                helper.doCameraAnimation = true;
                SLOG("自动镜头开启");
            }else{
                $("#controlerVideo").attr("class","fa fa-mouse-pointer");
                $(".controlerVideo").attr("title","平移").tooltip('fixTitle').tooltip('show');
                helper.doCameraAnimation = false;
                SLOG("自动镜头关闭");
            }
        });

        //音效控制
        $("#controlerHeadphones").click(function (){
            
            if( $("#controlerHeadphones").attr("class") == "fa fa-music"){
                $("#controlerHeadphones").attr("class","fa fa-headphones");
                $(".controlerHeadphones").attr("title","3D音效").tooltip('fixTitle').tooltip('show');
                //恢复初始位置 并绑定
                
                helper.audioManager.audio.position.set(0,0,0);
                if(myMmdScen.camera.add(helper.audioManager.listener))SLOG("音频管理添加至镜头");
                //helper.doCameraAnimation = true;

            }else{

                $("#controlerHeadphones").attr("class","fa fa-music");
                $(".controlerHeadphones").attr("title","背景音").tooltip('fixTitle').tooltip('show');

                helper.audioManager.audio.position.x= myMmdScen.camera.position.x;
                helper.audioManager.audio.position.y= myMmdScen.camera.position.y;
                helper.audioManager.audio.position.z= myMmdScen.camera.position.z;
                SLOG("设置音频位置："+helper.audioManager.audio.position);
                if(myMmdScen.camera.remove(helper.audioManager.listener))SLOG("镜头移除音频管理");
                //helper.doCameraAnimation = false;
            }
        });

        //设置
        $("#controlerCog").click(function (){
            GUIbtn.open();
            $("#guiDat").css("display","block");
        });

        //该函数添加在dat.gui.js中 目的是点击关闭设置并隐藏设置
        function calledClosGui(){
            $("#guiDat").css("display","none");
        }

        

        //音量（静音）fa-volume-off

        //滚轮控制音量
        $('#controlerVolume').bind('mousewheel');
        // using the event helper
        $('#controlerVolume').mousewheel(function(event, delta, deltaX, deltaY) {
            helper.audioManager.listener.setMasterVolume (helper.audioManager.listener.getMasterVolume() + delta/10 );
            $(".controlerVolume").attr("title","音量"+helper.audioManager.listener.getMasterVolume().toFixed(2)*100+"%").tooltip('fixTitle').tooltip('show');
        });
        var prVolume;
        $("#controlerVolume").click(function (){
    
            if( $("#controlerVolume").attr("class") == "fa fa-volume-up" ){
                try{
                    prVolume = helper.audioManager.listener.getMasterVolume();
                    helper.audioManager.listener.setMasterVolume(0);
                    
                }catch(e){
                    console.log(e+"音频管理还未生成，请等待...");
                }
                
                $("#controlerVolume").attr("class","fa fa-volume-off");
               
                $(".controlerVolume").attr("title","静音").tooltip('fixTitle').tooltip('show');
            }else{
                try{
                    helper.audioManager.listener.setMasterVolume(prVolume);
                }catch(e){
                    console.log(e+"音频管理还未生成，请等待...");
                }
                $("#controlerVolume").attr("class","fa fa-volume-up");
                
                $(".controlerVolume").attr("title","音量"+prVolume.toFixed(2)*100+"%").tooltip('fixTitle').tooltip('show');
            }
            

        });

        //全屏
        $("#controlerFullscreen").click(function (){
            if(isFullscreen()){
                $("#controlerFullscreen").attr("class","fa fa-expand");
                $(".controlerFullscreen").attr("title","全屏").tooltip('fixTitle').tooltip('show');
                exitFullscreen();
            }else{
                $("#controlerFullscreen").attr("class","fa fa-compress");
                $(".controlerFullscreen").attr("title","退出").tooltip('fixTitle').tooltip('show');
                requestFullScreen();
            }
        });        