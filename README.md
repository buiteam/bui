# bui [![Build Status](https://api.travis-ci.org/buiteam/bui.png)](https://api.travis-ci.org/buiteam/bui)

基于jQuery的富客户端控件库
- [文档库地址](http://www.builive.com/)
- [应用代码](https://github.com/dxq613/bui-default)
- [API代码](https://github.com/dxq613/bui-docs)
- [License](LICENSE.md)
- [贡献组件](CONTRIBUTING.md)
- [查看已存在组件列表](http://spmjs.io/search?q=bui)

## 文件结构

```
bui
├── src               // assets源文件夹
│   └── config.js     // bui的入口文件
├── assets            // 静态assets的目录
│   └── less          // less文件的目录
├── docs              // 源文件中未提供，但是可以自己执行 tools/jsduck/run.bat文件，请不要提交此文件夹
├── build             // 打包后最终文件的目录
│   │   ├── default   // 默认样式
│   │   └── bs3       // 基于bootstrap3重新编译的样式库
├── tools             // 工具类文件目录
│   │   └── jsduck    // jsduck的配置和执行文件目录
├── package.json      // bui的配置文件
└── README.md         // 说明文档
```

## 添加组件

1. 打开`package.json`
2. 找到下面这个节点

   ```
   "spm": {
     "dependencies": {
       "bui-common": "1.1.0"
     }
   }
   ```
   
3. 在里面添加你的包名和版本号，如  

   ```
   "spm": {
     "dependencies": {
       "bui-common": "1.1.0",
       "bui-new": "1.0.1"       //添加一个新的组件
     }
   }
   ```
4. 执行`gulp`命令进行项目打包

[查看如何开发一个组件](CONTRIBUTING.md)
 

## 打包

### 项目打包：

```
gulp
```

- 获取bui的组件
- 合并js，压缩js
- 编译less生成 css,压缩css
- 将常用的js合并成一个bui.js

### 生成文档：

- 使用[jsduck](https://github.com/senchalabs/jsduck) 进行编译文档，tools/jsduck/run.bat
- 配置文件在tools/jsduck/config.json
- 如果不想配置环境，请下载[文档API](https://github.com/dxq613/bui-docs)

## 文档地址

- [dpl 地址](http://www.builive.com/)
- [控件库demo](http://www.builive.com/demo/index.php)
- [控件库API](http://www.builive.com/docs/index.html)
- [集成的应用](http://www.builive.com/application/back.php)

## 提交问题

[提问](https://github.com/buiteam/bui/issues)


## 联系我们

- 论坛：http://bbs.builive.com
- 旺旺群号： 778141976
- QQ群：138692365
