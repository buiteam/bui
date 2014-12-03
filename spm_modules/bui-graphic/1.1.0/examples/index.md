# Demo

---

## Normal usage



````html
<div class="detail-section">  
  <h2>基本图形</h2>
  <div id="canvas"></div>
</div>
````

````javascript
seajs.use('graphic', function(Graphic) {
  var canvas = new Graphic.Canvas({
    render : '#canvas',
    height : 800,
    width : 500
  });

  //画线
  canvas.addShape('line',{
    x1 : 0,
    y1 : 0,
    x2 : 50,
    y2 : 50,
    stroke : 'red'
  });

  //画矩形，也可以指定额外的信息，如id,elCls
  canvas.addShape({
    type : 'rect',
    id : 'rect', //canvas.find('rect');既可以查找到
    elCls : 'my-rect',
    attrs : {
      x : 100,
      y : 0,
      r : 5,
      width : 50,
      height: 50,
      stroke : 'yellow',
      fill : 'red'
    }
  });

  //圆
  canvas.addShape('circle',{
    cx : 125,
    cy : 100,
    r : 20,
    fill : '#2f7ed8',
    stroke : ''
  });

  //椭圆
  canvas.addShape('ellipse',{
    cx : 200,
    cy : 100,
    rx : 20,
    ry : 30,
    fill : 'yellow'
  });

  //多边形
  canvas.addShape('polygon',{
    points : ['10,150','110,150','60,200'],
    stroke : '#c0c0c0'
  });

  //path
  canvas.addShape('path',{
    path : 'M250,225L250,70M250,225L359.60155108391484,115.39844891608514M250,225L405,225M250,225L359.60155108391484,334.60155108391484M250,225L250.00000000000003,380M250,225L140.39844891608516,334.60155108391484M250,225L95,225.00000000000003M250,225L140.39844891608513,115.39844891608516',
    stroke : '#c0c0c0'
  });
  //图片
  canvas.addShape('image',{
    x : 0,
    y : 400,
    width : 200,
    height : 250,
    src : 'http://i.mmcdn.cn/simba/img/T1dOKRFyVeXXb1upjX.jpg'
  });
});
````
