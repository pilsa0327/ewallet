const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));


router.get('/', function (req, res, next) {
    return res.render('bringPrivatekey');
});

router.post('/login', async function (req, res, next) {
    let { id, password, privateKey } = req.body;
    if(privateKey.length !==64){
        return res.status(200).json({})
    }
    let account = await web3.eth.accounts.privateKeyToAccount('0x'+privateKey);
    console.log(account)
    db.query('INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)',
        [id, password, account.address, account.privateKey], function (err, result) {
            if (err) {
                return res.status(200).json({})
            }
            return res.status(201).json({})
        })
})

router.get('/export', function(req, res, next){
    return res.render('exportPrivatekey')
})

router.post('/export', function(req, res, next){
    let {id, password} = req.body;
    
    db.query(`SELECT * FROM wallet_info WHERE userid = ?`, [id], function(err, data){
        let private_key = data[0].private_key.substring(2,)
        console.log(private_key)
        if(data.length && data[0].passoword === password){
            res.status(201).json({'private_key' : private_key})
        }
    })

})

module.exports = router;
