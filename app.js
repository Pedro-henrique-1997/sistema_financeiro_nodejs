const express = require('express');
const session = require("express-session");
const path = require('path');
const app = express();
const handlebars=require('express-handlebars');

const router = require('express').Router();


//require do bodyparser responsável por capturar valores do form
const bodyParser = require("body-parser");

//require do mysql
const mysql = require("mysql"); 
const { resolveSoa } = require('dns');

//criando a sessão
app.use(session({secret: "ssshhhhh"}));

//definindo pasta pública para acesso
app.use(express.static('public'))

/*config engines
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));
*/
app.engine('handlebars', handlebars.engine({defaultLayout: 'public/views'}));
app.set('view engine','handlebars');

//config bodyparser para leitura de post
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//conexão com banco mysql
function conectiondb(){
    var con = mysql.createConnection({
        host: 'localhost', // O host do banco. Ex: localhost
        user: 'root', // Um usuário do banco. Ex: user 
        password: '', // A senha do usuário. Ex: user123
        database: 'controle_financeiro_nodejs' // A base de dados a qual a aplicação irá se conectar, deve ser a mesma onde foi executado o Código 1. Ex: node_mysql
    });

    //verifica conexao com o banco
    con.connect((err) => {
        if (err) {
            console.log('Erro connecting to database...', err)
            return
        }
        console.log('Connection established!')
    });

    return con;
}


//rota padrao
app.get('/', (req, res) => {
    var message = ' ';
    req.session.destroy();
    res.render('views/registro', { message: message });
});


//rota para registro
app.get('/views/registro', (req, res)=>{
    res.redirect('../');
    //res.render('views/registro', {message:message});
});

//rota para home
app.get("/views/home", function (req, res){

    
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM conta', (err, customers) => {
            if (err) {
                res.json(err);
            }
            res.render('/views/home', {
                data: views/home
            });
        });
    });
    
});

//rota para login
app.get("/views/login", function(req, res){
    var message = ' ';
    res.render('views/login', {message:message});
    console.log("Acessou a tela de login");
});

//método post do register
app.post('/register', function (req, res){

    var nome = req.body.nome;
    var pass = req.body.pwd;
    var email = req.body.email;
    
    var con = conectiondb();

    var queryConsulta = 'SELECT * FROM users WHERE email LIKE ?';

    con.query(queryConsulta, [email], function (err, results){
        if (results.length > 0){            
            var message = 'E-mail já cadastrado';
            res.render('views/registro', { message: message });
        }else{
            var query = 'INSERT INTO users VALUES (DEFAULT,  ?, ?, ?)';

            con.query(query, [nome, email,  pass], function (err, results){
                if (err){
                    throw err;
                }else{
                    console.log ("Usuario adicionado com email " + email);
                    var message = "ok";
                    res.render('views/registro', { message: message });
                }        
            });
        }
    });
});

//método post do login
app.post('/log', function (req, res){
    //pega os valores digitados pelo usuário
    var email = req.body.email;
    var pass = req.body.pass;
    //conexão com banco de dados
    var con = conectiondb();
    //query de execução
    var query = 'SELECT * FROM users WHERE pass = ? AND email LIKE ?';
    
    //execução da query
    con.query(query, [pass, email], function (err, results){
        if (results.length > 0){
            req.session.user = email; //seção de identificação            
            console.log("Login feito com sucesso!");
            res.render('views/home', {message:results});
        }else{
            var message = 'Login incorreto!';
            res.render('views/login', { message: message });
        }
    });
});

app.post('/add', function (req, res){

    var nome = req.body.nome;
    var area = req.body.area;
    var gasto = req.body.gasto;
    var saldo = req.body.saldo
    
    var con = conectiondb();

    var queryConsulta = 'SELECT * FROM conta WHERE nome LIKE ?';

    con.query(queryConsulta, [nome], function (err, results){
        if (results.length > 0){            
            var message = 'Conta já feita';
            
        }else{
            var query = 'INSERT INTO conta VALUES (DEFAULT,  ?, ?, ?, ?)';

            con.query(query, [nome, area,  gasto, saldo], function (err, results){
                if (err){
                    throw err;
                }else{
                    console.log ("Conta adicionado com dono " + nome);
                    var message = "ok";
                   
                }        
            });
        }
    });
});


app.listen(3002, () => console.log(`O sistema está rodando!`));
