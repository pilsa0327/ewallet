const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));


router.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'ewallet'
  })
}))

/* GET users listing. */
router.get('/', async function (req, res, next) {
  let { userid, public_key, is_logined } = req.session;
  if (!is_logined) {
    return res.redirect('/')
  }
  let getBal = await web3.eth.getBalance(public_key)
  return res.render('main', { userid, public_key, getBal });
});

router.post('/', function (req, res, next) {
  let { id, password } = req.body
  db.query('SELECT * FROM wallet_info where userid = ?', [id], function (err, userInfo) {
    // console.log(userInfo)
    if (userInfo.length && userInfo[0].password === password) {
      req.session.is_logined = true;
      req.session.password = userInfo[0].password;
      req.session.userid = userInfo[0].userid;
      req.session.public_key = userInfo[0].public_key;
      req.session.private_key = userInfo[0].private_key;
      req.session.save(function () {
        return res.status(201).json({})
      })
    } else {
      return res.status(200).json({})
    }
  })
})

router.get('/destroy', function(req, res, next){
  req.session.destroy()
  return res.json({})
})


module.exports = router;

