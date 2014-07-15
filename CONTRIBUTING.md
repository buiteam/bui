# 如何给bui贡献组件

## 1. bui的项目组织

bui从`1.1.0`之后将bui从一个大整体拆分成各细粒度的小项目，每个项目都是一个独立完成的组件，所以bui不再是一个维护源码的地方，而是一个组织各组件的地方。

## 2. 如何开发一个组件

> bui的组件是基于[spm3](http://spmjs.io/)来进行管理和组织的。

### 1. 准备

1. 安装并了解[spm3](http://spmjs.io/) 
 
   ```
   npm install spm -g
   ```

2. 通过spm初始化一个项目(项目一定要以**bui-**打头) 
 
   ```
   spm init
   ```
   
### 2. 组件开发

按标准的spm模块开发流程来，并要完成**单测, demo, api**

### 3. 发布到spm源

在spm test都跑过之后，执行`spm publish`发布到spm源，这样一个组件的开发就算是完成了

### 4. 告诉我们你的组件

在[issues](https://github.com/buiteam/bui/issues)里同新建一条，告诉我们你的组件

### 5. 其他要注意的事项

1. spm默认会忽略`dist`目录，我们发到源上的包是需要`dist`目录的，所以要去掉`.spmignore`里面`dist`这一行
2. 如果存在多个js文件，请将除入口文件之外的其他js放到src目录下面来

## 3. 如何使用新加的组件

1. 在我们处理完你提issues之后，就可以从master上重新pull一下，你就会发现在dist目录里面多了一个你开发的js

### 如果你是自己fork出来的仓库
1. 打开`package.json`
2. 找到下面这个节点

   ```
   "spm": {
     "dependencies": {
     }
   }
   ```
   
3. 在里面添加你的包名和版本号，如  

   ```
   "spm": {
     "dependencies": {
       "bui-test": "1.0.1"
     }
   }
   ```
   
4. 在项目目录下面执行`gulp`命令
5. 你就会发现在dist目录下面多了`test.js`这个文件
6. 尽情使用吧