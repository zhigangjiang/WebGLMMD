<!DOCTYPE html>
<html>
<head>
    <title>MMD-Play-Demo</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
    <link rel="shortcut icon" href="/dist/img/favicon.ico">
</head>

</body>
</html>
    
    <!-- Bootstrap 核心 CSS 文件 -->
    <link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">    
    <!-- jQuery文件。在bootstrap.min.js 之前引入 -->
    <script src="https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js"></script>  
    <!-- Bootstrap 核心 JavaScript 文件 -->
    <script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>



    <script src="../js/Three.js"></script>
    <script src="../js/dat.gui.js"></script>
    <script src="../js/stats.min.js"></script>  
    <script src="../js/OrbitControls.js"></script>
    
    <script src="../js/mmdPlay/libs/mmdparser.min.js"></script>
    <script src="../js/mmdPlay/libs/ammo.js"></script>
    <script src="../js/mmdPlay/libs/Detector.js"></script>

    <script src="../js/mmdPlay/loaders/TGALoader.js"></script>
    <script src="../js/mmdPlay/loaders/MMDLoader.js"></script>
    
    <script src="../js/mmdPlay/effects/OutlineEffect.js"></script>
    
    <script src="../js/mmdPlay/animation/CCDIKSolver.js"></script>
    <script src="../js/mmdPlay/animation/MMDPhysics.js"></script>

    <script src="../js/mmdPlay/Mirror/Mirror.js"></script>
    <script src="../js/mmdPlay/SkyShader/SkyShader.js"></script>

    <script src="../js/mmdPlay/jq/jquery.mousewheel.min.js"></script>



    <style>
        body {
            /* set margin to 0 and overflow to hidden, to go fullscreen */
            margin: 0;
            overflow: hidden;


        }
        /*FPS显示*/
        .infoFps{
            position: fixed;
            top:5px;
            left:5px;
            width: 100%;
            z-index:1;
            
        }

        #guiDat{
            position: fixed;
            top: 0px;
            right: 0px;
            display: none;
            z-index:3;
        }
        /*加载日志*/
        .infoLog{
            position: fixed;
            bottom: 25px;
            left:5px;
            width: auto;
            /*color: blue;*/
            z-index:1;
        }
        /*进度条*/
        .foot{
            position:absolute;
            margin:auto;
            left:0; 
            right:0; 
            bottom:40%;
            width:100%; 
            text-align: center;
            z-index:3;

        }
        .smallsize-font-chrome{
              font-size:12px; 
            -webkit-transform-origin-x: 0;
            -webkit-transform: scale(0.90);
        }


        .smallsize-font {
 　　　　font-size:10.8px;
        }
        /*信息*/
        .tipAlert{
            position: fixed;
            top: 5%;
            margin:auto;
            left:0; 
            right:0; 
            width: 100%;
            text-align: center;
            /*color: blue;*/
            z-index:2;
        }
        /*底部控制器*/
        .footControler{
            position: fixed;
            bottom: 5px;
            margin:auto;
            width: 100%;
            height: auto;
            z-index:1;
        }
        
    </style>
</head>
<body >

    <!--fixed  Fps Tip-->
    <div class="infoFps" > 
            <p id="otherinfo2" class="smallsize-font smallsize-font-chrome"></p>   
    </div>
    
    <?php


        //输出about.html
    	function getAbout($project){
    	   if(PHP_OS == "WINNT"){
    			 $project = iconv("UTF-8", "GBK", $project);
    		   }
    		   $aboutHtml = '../models/'.$project.'/'. 'about.html';
    		   $myfile = fopen($aboutHtml, "r") or die("未添加about.html!");
    		   echo fread($myfile,filesize( $aboutHtml));
    	}
    	 
        //查找str2在str1中第n次的位置
    	function getStrPositionByN($str1 , $str2 ,$n){
    		$position=0;
    		for($i=0;$i<$n;$i++){
    			if(!strpos($str1,$str2))return false;
    			$position = $position +strpos($str1,$str2)+1;
    		    $str1 = substr($str1 , strpos($str1,$str2)+1);		
    			/*echo $str1.'</br>';
    			echo $position.'</br>';*/	
    		   
    		}
    		return $position;
    	}

        $ScriptValUrlarry = array();

    	function printReadmetx($arry){
            
            global $ScriptValUrlarry;

    		function printTitle($str){
    		   echo '<a href="#" class="list-group-item active">
    							'.$str.'
    					  </a>';
    		}
    		function printLinkReadme($str1,$str2){
    		   echo '<a href="'.$str1.'" class="list-group-item" target="_blank" data-toggle="tooltip" title="查看该文档" >'.$str2.'</a>';
    		}
            function printLinkDownload($str1,$str2,$str3){
               echo '<a href="'.$str1.'" class="list-group-item" target="_blank" data-toggle="tooltip" title="点击 下载" >'.$str2.$str3.'<span class="badge">可下载</span></a>';
            }

            //定义已经打印过的标题 ，初始值为空
            
            $PrintTarry = array();
            
           
            
            //----------------------------------
            //是否显示下载链接在此设置
            $shouwDownload = false;
            
    		foreach (array_reverse($arry) as $type) {
                
                //主文件readme.txt
                if($type[3] == '.txt'){
                    if(! in_array($type[0],$PrintTarry)){
                        printTitle($type[0]);
                        //添加到已打印
                        array_push($PrintTarry,$type[0]);
                    }
                    printLinkReadme($type[1],$type[2]);
                }
                
                //
                if($type[0] =='模型' && ($type[3] == '.pmx' || $type[3] == '.pmd')){
                    if($shouwDownload){
                       if(! in_array($type[0],$PrintTarry)){
                            printTitle($type[0]);
                            //添加到已打印
                            array_push($PrintTarry,$type[0]);
                        } 
                        printLinkDownload($type[1],$type[2],$type[3]);
                    }
                    //添加url script 用到
                    array_push($ScriptValUrlarry,'var modelFile = "'.$type[1].'";
                        ');
                }
                
                if($type[0] =='镜头' && $type[3] == '.vmd'){
                    if($shouwDownload){
                       if(! in_array($type[0],$PrintTarry)){
                            printTitle($type[0]);
                            //添加到已打印
                            array_push($PrintTarry,$type[0]);
                        } 
                        printLinkDownload($type[1],$type[2],$type[3]);
                    }
                    //添加url script 用到
                    array_push($ScriptValUrlarry,'var cameraFiles = ["'.$type[1].'"];
                        ');
                }

                if($type[0] =='动作' && $type[3] == '.vmd'){
                    if($shouwDownload){
                       if(! in_array($type[0],$PrintTarry)){
                            printTitle($type[0]);
                            //添加到已打印
                            array_push($PrintTarry,$type[0]);
                        } 
                        printLinkDownload($type[1],$type[2],$type[3]);
                    }
                    //添加url script 用到
                    array_push($ScriptValUrlarry,'var vmdFiles = ["'.$type[1].'"];
                        ');
                }

                if($type[0] =='音乐' && ($type[3] == '.mp3' || $type[3] == '.wav')){
                    if($shouwDownload){
                       if(! in_array($type[0],$PrintTarry)){
                            printTitle($type[0]);
                            //添加到已打印
                            array_push($PrintTarry,$type[0]);
                        } 
                        printLinkDownload($type[1],$type[2],$type[3]);
                    }
                    //添加url script 用到
                    array_push($ScriptValUrlarry,'var audioFile = "'.$type[1].'";
                        ');
                }
                


                
    		}
    		
    	}

        function characet($data){
            if( !empty($data) ){
              $fileType = mb_detect_encoding($data , array('UTF-8','GBK','LATIN1','BIG5')) ;
              if( $fileType != 'UTF-8'){
                $data = mb_convert_encoding($data ,'utf-8' , $fileType);
              }
            }
            return $data;
         }

        $arry = array();
        //参数 路径 文件 类型 
        function getReadList($path,$file,$type ){
            global $arry;
            

            if(PHP_OS == "WINNT"){
             $path = iconv("GBK", "UTF-8", $path);
             $file = iconv("GBK", "UTF-8", $file);
            }

            $txtUrl = $path.$file;

            $filename = substr($file,0,strrpos($file,"."));
            //echo '文件名：'.$filename.'</br>';

            $extension = substr($file,strrpos($file,"."));
            if($extension == '.link'){
                //echo $txtUrl;
                if(PHP_OS == "WINNT"){
                 $txtUrl = iconv("UTF-8", "GBK", $txtUrl);
                }
                $myfile = fopen($txtUrl, "r") or die("打开link文件失败！");
                
                $linkUrl = '../models/'.fread($myfile,filesize( $txtUrl));
                
                $linkPath = characet($linkUrl);
                
                if(substr($linkPath, -1) == '/')
                    $path=$linkPath;
                else $path=$linkPath.'/';

                if(PHP_OS == "WINNT"){
                  $path = iconv("UTF-8", "GBK", $path);
                }
                
                //echo $path;
                getReadmetxt($path);
                
            }
            
            //echo '后缀：'.$extension.'</br>';

            //类型（哪个主文件下），链接，文件名
            $arry2 = array($type,$txtUrl,$filename,$extension);
            array_push($arry,$arry2);      
        }
    	
    	function getReadmetxt($path){
    		/*echo $path.'</br>';*/
    		
    		if (is_dir($path)){
    			$handle = opendir($path);
    			
    			while ($file = readdir($handle)) {
    				/*如果第一目录为.则忽略*/
    				if ($file[0] == '.'){ continue; }
    				/*如果为目录则进行递归*/
    				
    				if (is_dir($path.$file)){
    					
    					getReadmetxt($path.$file.'/');
    				}else{
                        //后缀文件列表 link为链接文件
                        
                        $extensionList = 'txt|vmd|pmx|pmd|mp3|wav|link';

    					if (is_file($path.$file) and preg_match('/\.'.$extensionList.'$/', $file)){
        					$start = getStrPositionByN($path.$file , '/' ,3);
        					$length = getStrPositionByN($path.$file , '/' ,4)- getStrPositionByN($path.$file , '/' ,3)-1;
        					
        					$type = substr($path.$file,$start,$length);
        					
        					switch ($type)
        					{
        						case 'model':getReadList($path,$file,'模型');break;
        						case 'motion':getReadList($path,$file,'动作');break;
        						case 'camera':getReadList($path,$file,'镜头');break;
        						case 'audio':getReadList($path,$file,'音乐');break;
        						default: getReadList($path,$file,'其他');break;
        					}
                        }
    				}
    				
    			}
    			closedir($handle);            
    		}
    	}
	?>
    
    <?php
    
    if($_GET['pattern'] == 1){


	$project =  $_GET['porject'];
    
    echo '
		
	<!-- 模态框（Modal） -->
	<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" 
							aria-hidden="true">×
					</button>
					<h4 class="modal-title" id="myModalLabel">
						ReadMe
					</h4>
				</div>
				<div class="modal-body">';
				
				$path='../models/'.$project.'/';
				if(PHP_OS == "WINNT"){
				  $path = iconv("UTF-8", "GBK", $path);
				}
				
				getReadmetxt($path);
				printReadmetx($arry);
					
				echo '
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" 
							data-dismiss="modal">关闭
					</button>
					<button type="button" class="btn btn-primary">
						确定
					</button>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->';
    }
    ?>

    <!--fixed Row 警示框-->
    <div class="row tipAlert" style="display: block;">
        <div class="col-xs-1 col-sm-3 col-md-4" ></div>
        
        <div id="myAlert" class="col-xs-10 col-sm-6 col-md-4 alert alert-warning alert-dismissable " data-dismiss="modal" aria-hidden="true">
            <button type="button" id ="closeAlertBtn" class="close">
                &times;
            </button>
            推荐使用WebKit、Gecko内核浏览器体验,例如Chrome、Firefox、360浏览器等。
            Edge部分不兼容，IE不支持。
            </br>
            Powered by
            <a href="http://threejs.org" class="alert-link" target="_blank" rel="noopener"> three.js </a>
           
            <a href="https://threejs.org/examples/?q=mmd#webgl_loader_mmd_audio" class="alert-link"  target="_blank" rel="noopener">点击查看原示例及源码</a>
            
            <div align="center" >
                
            
            <?php
			  getAbout($project);
			?>
            
            
            </br>
                <a href="" class="alert-link" data-toggle="modal" data-target="#myModal">查看完整Readme以及下载说明</a>
            </br>
                
            </div>
            </br>
            <button   class="begainPlayBtn close btn btn-default btn-sm " style="position: relative; right: 46%;display: none;">
              <span id="begainPlayBtn" class="glyphicon glyphicon-play">开始</span> 
            </button>
        </div>
        <div class="col-xs-1 col-sm-3 col-md-4 " ></div>
    </div>

    <!--fixed Row 进度条-->
    <div class="row foot">
        <div class="col-xs-1 col-sm-3 col-md-4" ></div>
        <div id="progressModular" class="col-xs-10 col-sm-6 col-md-4 ">
            <p id="progressTitle"></p>
            <div id="progressBarF" class="progress progress-striped  active">
              <div id="progressBar" class="progress-bar progress-bar-info " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
              </div>
            </div>
        </div>
        <div class="col-xs-1 col-sm-3 col-md-4 "></div>
    </div>

    

    <!--fixed 日志显示-->
    <div class=" infoLog">
            <p align="left" class=" text-primary smallsize-font smallsize-font-chrome" id="progressLog">
            </p>
    </div>
    

    <div>
        <style type="text/css">
            .controlerPause{
                position: fixed;
                display: none;
                bottom: 7px;
                margin:auto;
                left:15px; 
                text-align: center;   
            }

            .controlerFullscreen{
                position: fixed;
                
                bottom: 7px;
                margin:auto;
                right:15px; 
                text-align: center;
            }

            .controlerVolume{
                position: fixed;
                
                bottom: 5px;
                margin:auto;
                right: 45px; 
                text-align: center;
            }
            .controlerHeadphones{
                position: fixed;
                bottom: 7px;
                margin:auto;
                right: 80px; 
                text-align: center;
            }
            .controlerVideo{
                position: fixed;
                bottom: 7px;
                margin:auto;
                right: 110px; 
                text-align: center;
            }
            .controlerInfo{
                position: fixed;
                bottom: 7px;
                margin:auto;
                right: 140px; 
                text-align: center;
            }
            .controlerCog{
                position: fixed;
                top: 7px;
                margin:auto;
                right: 15px; 
                text-align: center;
            }
        </style>

        <div class=" controlerPause " data-toggle="tooltip" title="播放">
            <span  id="controlerPause" class="glyphicon glyphicon-play" style="color: rgba(229,220,193,0.3); font-size:20px;"></span>
            
        </div>

        <div class=" controlerFullscreen " data-toggle="tooltip" title="全屏"  >
            <span id="controlerFullscreen" class="glyphicon glyphicon-fullscreen" style="color: rgba(229,220,193,0.3); font-size:15px;"></span>
        </div>

        <div class=" controlerVolume " data-toggle="tooltip" title="音量100%">
            
            <span  id="controlerVolume" class="glyphicon glyphicon-volume-up" style="color: rgba(229,220,193,0.3); font-size:20px;"></span>
           
        </div>

        <div class=" controlerHeadphones " data-toggle="tooltip" title="3D音效"  >
            <span id="controlerHeadphones" class="glyphicon glyphicon-headphones" style="color: rgba(229,220,193,0.3); font-size:15px;"></span>
        </div>

        <div class=" controlerVideo " data-toggle="tooltip"  title="自动镜头" >
            <span id="controlerVideo" class="glyphicon glyphicon-facetime-video" style="color: rgba(229,220,193,0.3); font-size:15px;"></span>
        </div>

        <div class=" controlerInfo " data-toggle="tooltip" title="隐藏信息"  >
            <span id="controlerInfo" class="glyphicon glyphicon-info-sign" style="color: rgba(229,220,193,0.3); font-size:15px;"></span>
        </div>

        <div class=" controlerCog " data-toggle="tooltip" data-placement="bottom" title="设置"  >
            <span id="controlerCog" class="glyphicon glyphicon-cog" style="color: rgba(229,220,193,0.3); font-size:15px;"></span>
        </div>
        
        <script>
            $(function () { $("[data-toggle='tooltip']").tooltip(); });
        </script>
    </div>

    <!--gui.dat控件-->
    <div id="guiDat">        
    </div>

    <script type="text/javascript">
        var checkBtn = new mmdPlayOrPause();
        var pause = false;
        var ready = false;
        //通过设置pause = true 执行 render函数中 if（pause）语句 传入时间差0来实现动作暂停（一直渲染前时间差下的帧） 并不是真正的暂停 设置doAnimatio = false;可以达到暂停效果 但pmx文件用此方法，模型或出现错误  

        function mmdPlayOrPause(){
            this.play = function (){
                ready = true;
                pause = false;
                //helper.doAnimation = true;
                $("#controlerPause").attr("class","glyphicon glyphicon-pause");
                $(".controlerPause").attr("title","暂停").tooltip('fixTitle');

                $("#begainPlayBtn").attr("class","glyphicon glyphicon-pause");
                $("#begainPlayBtn").html("暂停");
            };
            this.pause = function (){
                ready = false;
                pause = true;
                //helper.audioManager.audio.pause();
                //helper.doAnimation = false;
                $("#controlerPause").attr("class","glyphicon glyphicon-play");
                $(".controlerPause").attr("title","继续").tooltip('fixTitle');

                $("#begainPlayBtn").attr("class","glyphicon glyphicon-play");
                $("#begainPlayBtn").html("继续");

            };
            this.check = function(){
                if($("#controlerPause").attr("class") == "glyphicon glyphicon-play" ){
                    this.play();
                }else{
                    this.pause();
                }
            };

            
        }
        //底部播放暂停按钮，如果页面有警示框则关闭
        $(".controlerPause").click(function (){ 
           
            if($("#begainPlayBtn").attr("class") == "glyphicon glyphicon-play")$("#closeAlertBtn").trigger("click");
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

            if( $(".row.tipAlert").attr("style") == "display:none;"){
                $(".row.tipAlert").attr("style","display:block;");
                $(".controlerInfo").attr("title","隐藏信息").tooltip('fixTitle').tooltip('show');
            }
            else{
                
               $(".row.tipAlert").attr("style","display:none;"); 
               $(".controlerInfo").attr("title","显示信息").tooltip('fixTitle').tooltip('show');
            } 

        });

        //镜头控制按钮
        $("#controlerVideo").click(function (){
            if( $("#controlerVideo").attr("class") == "glyphicon glyphicon-move"){
                $("#controlerVideo").attr("class","glyphicon glyphicon-facetime-video");
                $(".controlerVideo").attr("title","自动镜头").tooltip('fixTitle').tooltip('show');
                helper.doCameraAnimation = true;
                SLOG("自动镜头开启");
            }else{
                $("#controlerVideo").attr("class","glyphicon glyphicon-move");
                $(".controlerVideo").attr("title","平移").tooltip('fixTitle').tooltip('show');
                helper.doCameraAnimation = false;
                SLOG("自动镜头关闭");
            }
        });

        //音效控制
        $("#controlerHeadphones").click(function (){
            
            if( $("#controlerHeadphones").attr("class") == "glyphicon glyphicon-music"){
                $("#controlerHeadphones").attr("class","glyphicon glyphicon-headphones");
                $(".controlerHeadphones").attr("title","3D音效").tooltip('fixTitle').tooltip('show');
                //恢复初始位置 并绑定
                
                helper.audioManager.audio.position.set(0,0,0);
                if(camera.add(helper.audioManager.listener))SLOG("音频管理添加至镜头");
                //helper.doCameraAnimation = true;

            }else{

                $("#controlerHeadphones").attr("class","glyphicon glyphicon-music");
                $(".controlerHeadphones").attr("title","背景音").tooltip('fixTitle').tooltip('show');

                helper.audioManager.audio.position.x= camera.position.x;
                helper.audioManager.audio.position.y= camera.position.y;
                helper.audioManager.audio.position.z= camera.position.z;
                SLOG("设置音频位置："+helper.audioManager.audio.position);
                if(camera.remove(helper.audioManager.listener))SLOG("镜头移除音频管理");
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

        

        //音量（静音）glyphicon-volume-off

        //滚轮控制音量
        $('#controlerVolume').bind('mousewheel');
        // using the event helper
        $('#controlerVolume').mousewheel(function(event, delta, deltaX, deltaY) {
            helper.audioManager.listener.setMasterVolume (helper.audioManager.listener.getMasterVolume() + delta/10 );
            $(".controlerVolume").attr("title","音量"+helper.audioManager.listener.getMasterVolume().toFixed(2)*100+"%").tooltip('fixTitle').tooltip('show');
        });
        var prVolume;
        $("#controlerVolume").click(function (){
    
            if( $("#controlerVolume").attr("class") == "glyphicon glyphicon-volume-up" ){
                try{
                    prVolume = helper.audioManager.listener.getMasterVolume();
                    helper.audioManager.listener.setMasterVolume(0);
                    
                }catch(e){
                    console.log(e+"音频管理还未生成，请等待...");
                }
                
                $("#controlerVolume").attr("class","glyphicon glyphicon-volume-off");
               
                $(".controlerVolume").attr("title","静音").tooltip('fixTitle').tooltip('show');
            }else{
                try{
                    helper.audioManager.listener.setMasterVolume(prVolume);
                }catch(e){
                    console.log(e+"音频管理还未生成，请等待...");
                }
                $("#controlerVolume").attr("class","glyphicon glyphicon-volume-up");
                
                $(".controlerVolume").attr("title","音量"+prVolume.toFixed(2)*100+"%").tooltip('fixTitle').tooltip('show');
            }
            

        });

        //全屏
        $("#controlerFullscreen").click(function (){
            if(isFullscreen()){
                $(".controlerFullscreen").attr("title","全屏").tooltip('fixTitle').tooltip('show');
                exitFullscreen();
            }else{
                $(".controlerFullscreen").attr("title","退出全屏").tooltip('fixTitle').tooltip('show');
                requestFullScreen();
            }
        });          
    </script>
        

    <div style="display:none;">
        <script src="https://s19.cnzz.com/z_stat.php?id=1264601635&web_id=1264601635" language="JavaScript"></script>                                  
    </div>

        <script>
            //--------------------------------------------------
            
            <?php

            foreach ($ScriptValUrlarry as $value) {
                echo $value;
            }

            
            ?>

            //----------------------------------------------------
        </script>
        <script src="../js/main.js"></script>
    



    </body>
</html>
