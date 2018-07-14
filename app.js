// 本页用nodejs结合mysql来做数据的增删改查，渲染页面功能

// 导入模块
let express = require('express');
let multiparty = require('multiparty');
let path = require('path');
let temp = require('art-template');
let mysql = require('mysql'); 

// 创建服务
let app=express();

// 托管静态资源 访问图片
// 从应用程序目录中的“www”目录为应用程序提供静态内容：
app.use(express.static('www'));


// 创建数据库的连接
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "test"
});
connection.connect();

//  1、查询数据库
app.get('/index',(req, res)=> {
    // console.log(req);
    //判断是否有数据过来，有就根据搜索的search来查询数据
    //没有数据过来就查询全部
    let search = req.query.search;
    let sql=search?`select * from manyhero where name like'%${search}%'`:'select * from manyhero';
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        // console.log(results);
        let html = temp(path.join(__dirname, "tem/index.art"), {
            results,
            // 让用户输入的结果赋值给搜索框
            search
          });
          res.send(html);
      });
    //    多次调用会多次请求。所以干掉
    //   connection.end();
  
  });

//  2、删除数据库某条数据
app.get('/delete',(req,res)=>{

    // 删除单条数据
    // 返回首页
    let sql = `delete from manyhero where id=${req.query.id}`;
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        // 不等于-1表示一条记录受影响，表示删除成功
        if(results.affectedRows!=-1){
            res.redirect('/index');
        }
      });
});

//  3、新增数据
app.post('/add',(req,res)=>{
    // 接收过来的数据id，使用multiparty包
    // 文件上传之后放到www下的img文件夹
    var form = new multiparty.Form({
        uploadDir: path.join(__dirname, "www/img")  
    })
    form.parse(req, function(err, fields, files) {
        // 生成sql语句
        let sql = `insert into manyhero (name,icon) values('${
            fields.name[0]
          }','img/${path.basename(files.icon[0].path)}')`; 
        // 执行SQL语句
        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            // 返回首页
            res.redirect("/index");
          });
        
       
      });
});

// 4、修改数据
// 4.1先跳到新增数据的编辑页面
app.get('/update',(req,res)=>{
    // 获取传输过来的id
    let id=req.query.id;
    // 查询数据库
    let sql =`select * from manyhero where id=${id}`;
    connection.query(sql, function (error, results, fields) {
        // console.log(results);
        // 使用模板引擎，传输数据
        let html = temp(path.join(__dirname, "tem/update.art"), {
            results
            // 让用户输入的结果赋值给搜索框
            
          }); 
          res.send(html);
      });
});
// 4.2 保存修改，返回首页，渲染页面
app.post('/update',(req,res)=>{
    var form = new multiparty.Form({
        uploadDir: path.join(__dirname, "www/img")  
    })
    form.parse(req, function(err, fields, files) {
        // 生成sql语句
        let sql = `update manyhero set name='${fields.name[0]}',icon='img/${path.basename(files.icon[0].path)}' where id =${fields.id[0]} `; 
        // 执行SQL语句
        connection.query(sql, function (error, results, fields) {
            // if (error) throw error;
            // 返回首页
            res.redirect("/index");
          });
        
       
      });
})


// 开启监听
app.listen(80, "127.0.0.1", () => {
  console.log("success");
});
