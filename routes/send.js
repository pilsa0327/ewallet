const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const Tx = require('ethereumjs-tx').Transaction;
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

router.get('/', function (req, res, next) {
  res.render('send');
});

router.post('/' , async function (req, res, next) {
  let { toAddress, gasPrice, value} = req.body;
  let { public_key, userid, private_key, is_logined } = req.session;
  if (!is_logined) {
    return res.redirect('/')
  }
  console.log(toAddress, gasPrice, value)
  let gwei = 9
  let privateKey = new Buffer.from(private_key.substring(2,), 'hex');
  let nonce = await web3.eth.getTransactionCount(public_key, "pending")
  let rawTx = {
    nonce: nonce,
    gasPrice: web3.utils.toHex(gasPrice * (10 ** gwei)),
    gasLimit: web3.utils.toHex(21000),
    from: req.session.public_key,
    to : toAddress,
    value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
    data: ''
  }

  let tx = new Tx(rawTx, { 'chain': 'ropsten' });
  tx.sign(privateKey);
  let serializedTx = tx.serialize();

  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash){

    console.log(hash)
    db.query('INSERT INTO tx_hash(userid, txhash) VALUES(?, ?)', [userid, hash], function (err, result){
      if(err){
        console.log(err)
      } else{
      return res.status(201).json({})
      }
    })
  })
})

module.exports = router;
