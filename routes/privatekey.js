const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));


router.get('/', function (req, res, next) {
    console.log(1)
    res.render('bringPrivatekey');
});

router.post('/login', function (req, res, next) {
    console.log(2)
    let { id, password, privateKey } = req.body;
    let account = web3.eth.accounts.privateKeyToAccount('0x'+privateKey);
    console.log(account)
    db.query('INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)',
        [id, password, account.address, newAccount.privateKey], function (err, result) {
            if (err) {
                return res.status(200).json({})
            }
            return res.status(201).json({})
        })
})


module.exports = router;
