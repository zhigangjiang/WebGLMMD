![](http://file.niuini.com/other/player.png)
# 介绍
本项目基于takahirox[https://github.com/takahirox] 的 mmd-viewer-js[https://github.com/takahirox/mmd-viewer-js]项目实现.
事实上我的主要工作是组合几个库，像地面镜像[Mirror.js]、天空[SkyShader.js]到他的mmd项目，这部分代码在[main.js]中。
并且修改了前端页面，使其看起来像一个播放器，在[control.js]中实现了对播放器的控制。
这是我当时学习threejs，尝试做的demo，后来这个播放器应用在我的网站[niuini.com](niuini.com)上。
仅供参考。

# 修改载入文件
在index.html的454行~457行指定了载入文件的地址。
你可以改成其他的url，注意是要url。
你不可以直接填像[f://xx/xx.pmx]这种路径，正确的做法是搭建一个小型web服务器，再把文件相对于网站根目录的路径填上。
更多服务搭建，请参考apache或者nginx官方文档。

# 相关链接
[https://github.com/takahirox/mmd-viewer-js]
[https://threejs.org]
[http://www.niuini.com]

# 联系
zigjiang@gmail.com

# Introduction
This project is based on the takahirox[https://github.com/takahirox]  mmd-viewer-js[https://github.com/takahirox/mmd-viewer-js] project. 
In fact, my main job is to combine several libraries, such as ground mirroring [Mirror.js] and sky [SkyShader.js] to his mmd project. 
This part of the code is in [main.js]. 
And modified the front page to make it look like a player, and implemented the control of the player in [control.js].
This is a demo I tried to learn threejs at the time, and later this player was applied on my website [niuini.com].
for reference only.

# Modify loaded files
In the index.html line 454 ~ 457 line specifies the address of the load file, you can change it to other URLs, note that the URL is required.
you can not fill it directly like Path, the correct way is to set up a small web server, and fill in the path of the file relative to the root directory of the website.
For more service build, please refer to the official documentation of apache or nginx.

# Links
[https://github.com/takahirox/mmd-viewer-js]
[https://threejs.org]
[http://www.niuini.com]

# Contact
zigjiang@gmail.com

