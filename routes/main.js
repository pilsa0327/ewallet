const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));
let network = 'Ropsten'
const bcrypt = require('bcrypt-nodejs');
const CryptoJS = require('crypto-js');


/* GET users listing. */
router.get('/', async function (req, res, next) {
 
  if(req.session.web3) {
    web3 = new Web3(new Web3.providers.HttpProvider(req.session.web3))
  }
  if(req.session.network){
    network = req.session.network
  }
  let { userid, public_key, is_logined} = req.session;
  let list = new Array();
  if (!is_logined) {
    return res.redirect('/')
  }

  await web3.eth.getBalance(public_key, function (err, wei) {
    balance = web3.utils.fromWei(wei, 'ether')
    return balance
  })
  let network1 = req.session.network;
  db.mysql.query(`SELECT * FROM tx_hash WHERE userid=? AND network=?`,[userid, network1], (err, data) => {
    if (err) {
      list = [];
    } else {
      for (let i = 0; i < data.length; i++) {
        list.push(data[i].txhash);
      }
    }
    return res.render('main', { userid, public_key, balance, list, network });
  })
});

router.post('/', function (req, res, next) {
  let { id, password } = req.body

  db.mysql.query('SELECT * FROM wallet_info where userid =?', [id], function (err, userInfo){
    if(err){
      return res.status(200).json({})
    }
    if(!userInfo.length){
      return res.status(200).json({})
    }
     bcrypt.compare(password, userInfo[0].password, (err, value) => {
      if (value === true) {
        req.session.is_logined = true;
        req.session.password = userInfo[0].password;
        req.session.userid = userInfo[0].userid;
        req.session.public_key = userInfo[0].public_key;
        req.session.private_key = userInfo[0].private_key;
        req.session.network = 'Ropsten'
        req.session.save(function () {
          return res.status(201).json({})
        })
      } else {
        return res.status(200).json({})
      }
    })
  })
})
router.post('/txdb', async function (req, res, next) {
  let { txHash } = req.body;
  let { userid, network } = req.session;
  
  txHash = txHash.substring(1, 67)
  console.log(req.session)
  console.log(txHash)
  db.mysql.query('INSERT INTO tx_hash(userid, network, txhash ) VALUES(?, ?, ?)', [userid, network, txHash],  await function (err, result) {
    return res.json({})
  })

})


router.get('/destroy', function (req, res, next) {
  req.session.destroy()
  return res.json({})
})

router.post('/changeNetwork', async function (req, res) {
  let network = req.body.network;

  if (network === 'MainNet') {
      web3 = 'https://mainnet.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'
      req.session.web3 = web3
      req.session.network = network;
      req.session.save(function () { })
      return res.json({});
  }

  else if (network === 'Kovan') {
      web3 = 'https://kovan.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'
      req.session.web3 = web3
      req.session.network = network;
      req.session.save(function () { })
      return res.json({});
  }

  else if (network === 'Rinkeby') {
      web3 = 'https://rinkeby.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'
      req.session.web3 = web3
      req.session.network = network;
      req.session.save(function () { })
      return res.json({});
  }

  else if (network === 'Goerli') {
      web3 = 'https://goerli.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'
      req.session.web3 = web3
      req.session.network = network;
      req.session.save(function () { })
      return res.json({})
  }

  else if (network === 'Ropsten') {
      web3 = 'https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'
      req.session.web3 = web3
      req.session.network = network;
      req.session.save(function () { })
      return res.json({})
  }
})


module.exports = router;

