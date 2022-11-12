const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const app = express()
const port = 3000
const mysql = require('mysql');
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, './upload/')
	},
	filename: function (req, file, cb) {
	  cb(null, file.originalname)
	}
  })
  const upload = multer({storage: storage})

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(express.static('./views'));
app.use(express.static('./upload'));

app.use(session({
	secret: 'my key',
	resave: false,
	saveUninitialized: true,
	store: sessionstore

}))

const con = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '@j231522',
   database: 'closet',
   multipleStatements: true
 });

 var sessionstore = new MySQLStore(con);

con.connect(function(err) {
	if (err) throw err;
	console.log('Connected');
});

app.get('/register', function (req, res){
		res.render('register');	
});

app.post('/register', (req, res) => {
	const id = req.body.id;
	const pw = req.body.password;
	const sql = "INSERT INTO people SET ?"
	con.query('select id from people where id =?',[id],function(err, rows, fields){
		if (rows.length){
			res.json({'result': 'fail'})
		}else{
	con.query(sql,req.body,function(err, result, fields){
		if (err) throw err;
      console.log(req.body.testnum);
		console.log(result);
		res.redirect('/register');
	});
}
});
});

app.get('/login', function (req, res){
	const id = req.session.uid;
	console.log(id);
	const sql = "select * from shirt where shuserid =?;" ;
	const sql2 = "select * from pants where puserid =?;" ;
	const sql3 = "select * from shoes where suserid =?;" ;
	const sql4 = "select * from etc where userid =?;" ;
	const sql5 = "select * from overcoat where ovuserid =?;" ;


	con.query(sql+sql2+sql3+sql4+sql5,[id,id,id,id,id],function (err, results, fields) {  
	if (req.session.isLogined==true) {
		res.render('spring',{short : results[0],pants : results[1],shoes : results[2],etc:results[3],overcoat: results[4], name: req.session.id });
	}
	else{
		res.render('login');
	}
	})
	
});

app.post('/login', (req, res) => {
	const id = req.body.id;
	const pw = req.body.password;
	const sql = "select * from people where id =?;";
	const sql2 = "select * from people where password =?;";
	const sql3 = "select * from pants where puserid =?;";
	const sql4 = "select * from shirt where shuserid =?;";
	const sql5 = "select * from shoes where suserid =?;";
	const sql6 = "select * from etc where userid =?;";
	const sql7 = "select * from overcoat where ovuserid =?;";


	con.query(sql,[id],function (err, rows, fields) {  
		
	if (rows.length){
		if(rows[0].id==id){

			con.query(sql2+sql3+sql4+sql5+sql6+sql7, [pw,id,id,id,id,id], function(err,rows,fields){
				if(err){
					throw err;
				}
				if(rows.length){
					req.session.name=rows[0];
					req.session.uid=id;
					req.session.upw=rows[0].password
					req.session.isLogined=true;
                    console.log(req.session.uid);
					req.session.save(function(){
						res.render('spring',{pants : rows[1],short : rows[2],shoes : rows[3],etc: rows[4],overcoat:rows[5], name : rows[0]});
					})
					


				}else {

					console.log('비밀번호가 잘못되었습니다!');
				}
			})
		}
	}else{
		res.send("<script>alert('아이디가 잘못되었습니다'); window.location.replace('/login');</script>");

		console.log('아이디가 잘못되었습니다.');
	}
	});
});

app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/login');
    });

});


app.get('/select', (req, res) => {
	console.log(req.session.uid)
	const id = req.session.uid;
	const sql = "select * from pants where puserid =?;";
	const sql2 = "select * from shirt where shuserid =?;";
	const sql3 = "select * from shoes where suserid =?;";
	const sql4 = "select * from etc where userid =?;";
    const sql5 = "select * from overcoat where ovuserid =?;";

	con.query(sql+sql2+sql3+sql4+sql5,[id,id,id,id,id],function (err, results, fields) {  
	if (err) throw err;	
	res.render('select',{user: req.query.user, pants : results[0], shorts : results[1], shoes: results[2], etc: results[3], overcoat: results[4]});
	});
});

app.get('/codyregister' , (req,res) => {
	const sql = "SELECT cody.*,shirt.*,pants.*,shoes.*,etc.*,overcoat.* FROM closet.cody left outer join shirt on cody.shirt= shirt.id left outer join pants on cody.pants=pants.id left outer join shoes on cody.shoes=shoes.id left outer join etc on cody.etc=etc.id left outer join overcoat on cody.overcoat=overcoat.id;";
	con.query(sql, function(err, result,  fields){
		if (err) throw err;
	console.log(result);
	res.render('cody',{cody: result});
	});
});

app.post('/codyregister', (req,res) => {
	const shirt = req.body.shirt;
	const pants = req.body.pants;
	const shoes = req.body.shoes;
	const codyname = req.body.codyname;
	const codyspec = req.body.codyspec;
	const seasonspec = req.body.seasonspec;
	const overcoat = req.body.overcoat;
	const etc = req.body.etc;
	const codyuserid = req.session.uid;
console.log(req.session.uid);

	const sql =  "INSERT INTO cody (codyname,shirt, pants,shoes,overcoat,etc,codyspec,seasonspec,codyuserid) VALUES(?,?,?,?,?,?,?,?,?);";
	con.query(sql,[codyname,shirt, pants,shoes,overcoat,etc,codyspec,seasonspec,codyuserid],function(err, result, fields){
		if (err) throw err;
		res.redirect('/codyregister');
	});
});

app.post('/',upload.single('testimage'), (req, res) => {
	console.log(req.file.filename);
	const imagetest = req.file.filename;
	const testnum = req.body.testnum;
	const image = req.body.image;
	const spec = req.body.spec;
	const closet = req.body.closet_spec;
	const userid = req.session.uid;
if(spec=='하의'){
	const sql = "INSERT INTO pants (pname, psize, pcloset_spec,pimage,puserid) VALUES(?,?,?,?,?);";
	con.query(sql,[testnum,image,closet,imagetest,userid],function(err, result, fields){
		if (err) throw err;
		res.redirect('/login');
	});
}else if(spec=='상의'){
	const sql = "INSERT INTO shirt (shname, shsize, shcloset_spec,shimage,shuserid) VALUES(?,?,?,?,?);";
	con.query(sql,[testnum,image,closet,imagetest,userid],function(err, result, fields){
		if (err) throw err;
		res.redirect('/login');
	});}
	else if(spec=='신발'){
		const sql = "INSERT INTO shoes (sname, ssize, scloset_spec,simage,suserid) VALUES(?,?,?,?,?);";
		con.query(sql,[testnum,image,closet,imagetest,userid],function(err, result, fields){
			if (err) throw err;
			res.redirect('/login');
		});}
		else if(spec=='아우터'){
			const sql =  "INSERT INTO overcoat (ovname, ovsize, ovcloset_spec,ovimage,ovuserid) VALUES(?,?,?,?,?);";
			con.query(sql,[testnum,image,closet,imagetest,userid],function(err, result, fields){
				if (err) throw err;
				res.redirect('/login');
			});}
			else if(spec=='기타'){
				const sql = "INSERT INTO etc (name, size, closet_spec,image,userid) VALUES(?,?,?,?,?);";
				con.query(sql,[testnum,image,closet,imagetest,userid],function(err, result, fields){
					if (err) throw err;
					res.redirect('/login');
				});}
			else{
				res.redirect('/select');

			}
});
/*
app.post('/summer', (req, res) => {
	res.redirect('summer');
});
 form 에서 method가 post이면 이쪽으로 데이터가 온다*/
 app.get('/edit/:id',(req,res)=>{
	if(req.query.spec=='상의'){
	const sql = "SELECT * FROM shirt WHERE id = ?";
	con.query(sql,[req.params.id],function (err, result, fields) {  
		if (err) throw err;
		res.render('shirtedit',{user : result});
		});
	}else if(req.query.spec=='하의'){
		const sql = "SELECT * FROM pants WHERE id = ?";
		con.query(sql,[req.params.id],function (err, result, fields) {  
			if (err) throw err;
			res.render('pantsedit',{user : result});
			});
		}else if(req.query.spec=='신발'){
			const sql = "SELECT * FROM shoes WHERE id = ?";
			con.query(sql,[req.params.id],function (err, result, fields) {  
				if (err) throw err;
				res.render('shoesedit',{user : result});
				});
		}else if(req.query.spec=='아우터'){
			const sql = "SELECT * FROM overcoat WHERE id = ?";
			con.query(sql,[req.params.id],function (err, result, fields) {  
				if (err) throw err;
				res.render('overcoatedit',{user : result});
				});
		}else if(req.query.spec=='기타'){
			const sql = "SELECT * FROM etc WHERE id = ?";
			con.query(sql,[req.params.id],function (err, result, fields) {  
				if (err) throw err;
				res.render('etcedit',{user : result});
				});
					}
});

app.post('/update/:id',(req,res)=>{
	if(req.query.spec=='상의'){
	const sql = "UPDATE shirt SET ? WHERE id = " + req.params.id;
	con.query(sql,req.body,function (err, result, fields) {  
		if (err) throw err;
		console.log(result);
		res.redirect('/login');
		});
	}else if(req.query.spec=='하의'){
		const sql = "UPDATE pants SET ? WHERE id = " + req.params.id;
		con.query(sql,req.body,function (err, result, fields) {  
			if (err) throw err;
			console.log(result);
			res.redirect('/login');
			});
		}else if(req.query.spec=='신발'){
			const sql = "UPDATE shoes SET ? WHERE id = " + req.params.id;
			con.query(sql,req.body,function (err, result, fields) {  
				if (err) throw err;
				console.log(result);
				res.redirect('/login');
				});
		}else if(req.query.spec=='아우터'){
			const sql = "UPDATE overcoat SET ? WHERE id = " + req.params.id;
			con.query(sql,req.body,function (err, result, fields) {  
				if (err) throw err;
				console.log(result);
				res.redirect('/login');
				});
		}else if(req.query.spec=='기타'){
			const sql = "UPDATE etc SET ? WHERE id = " + req.params.id;
			con.query(sql,req.body,function (err, result, fields) {  
				if (err) throw err;
				console.log(result);
				res.redirect('/login');
					});
				}
		});
app.get('/delete/:id',(req,res)=>{
	if(req.query.spec=='상의'){
	const sql = "DELETE FROM shirt WHERE id = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect('/login');
	})
}else if(req.query.spec=='하의'){
	const sql = "DELETE FROM pants WHERE id = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect('/login');
	})
}else if(req.query.spec=='신발'){
	const sql = "DELETE FROM shoes WHERE id = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect('/login');
	})
}else if(req.query.spec=='기타'){
	const sql = "DELETE FROM etc WHERE id = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect('/login');
	})
}else if(req.query.spec=='아우터'){
	const sql = "DELETE FROM outer WHERE id = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect('/login');
	})
}
});

app.get('/closeregister', (req, res) => 
	res.sendFile(path.join(__dirname, 'closeregister.html')));

app.get('/register', (req, res) => 
	res.sendFile(path.join(__dirname, 'register.html')));
	


app.get('/index', (req, res) => 
	res.sendFile(path.join(__dirname, 'index.html')));
	
app.get('/spring', (req, res) => 
res.sendFile(path.join(__dirname, 'spring.html')));

app.get('/summer', (req, res) => 
	res.sendFile(path.join(__dirname, 'summer.html')));

	app.get('/fall', (req, res) => 
	res.sendFile(path.join(__dirname, 'fall.html')));
	
app.get('/winter', (req, res) => 
res.sendFile(path.join(__dirname, 'winter.html')));

app.get('/closeadd', (req, res) => {
console.log(req.query.user); // 데이터 url쿼리 아이디 가져오기 

res.render('closeadd',{user: req.query.user})
//res.sendFile(path.join(__dirname, 'closeadd.html')
});
//)});


app.get('/create', (req, res) => 
	res.sendFile(path.join(__dirname, 'test.html')));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))