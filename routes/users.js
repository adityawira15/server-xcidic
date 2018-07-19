var express = require('express');
var router = express.Router();
var { Pool } = require('pg')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt-nodejs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'xcidic',
  password: 'AdItYa15:)',
  port: '5432'
})

function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(password1, password2) {
  return bcrypt.compareSync(password1, password2);
};

/* GET users listing. */

router.post('/signup', (req, res) => {
  pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, (err, val) => {
    if (err) throw err
    if (val.rows.length > 0) {
      res.json({
        message: 'Email Telah Digunakan!'
      })
    } else {
      var opt = {
        expiresIn: '1h'
      }
      var newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: generateHash(req.body.password),
        type: req.body.type
      }
      pool.query(`INSERT INTO users(firstname, lastname, email, password, type) VALUES('${newUser.firstname}', '${newUser.lastname}', '${newUser.email}', '${newUser.password}', '${newUser.type}')`, (err) => {
        if (err) throw err
        pool.query(`SELECT * FROM users WHERE email = '${newUser.email}'`, (err, val) => {
          if(err) throw err
          var token = jwt.sign(val.rows[0], 'testxcidic', opt)
          pool.query(`UPDATE users SET token = '${token}' WHERE id = ${val.rows[0].id}`, (err) => {
            if(err) throw err
            res.json({
              token: token,
              message: 'Signup Success!'
            })
          })
        })
      })
    }
  })
})

router.post('/signin', (req, res) => {
  console.log(req.body.email)
  pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, (err, val) => {
    if(err) throw err
    if (val.rows.length > 0) {
      if(validPassword(req.body.password, val.rows[0].password)){
        pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, (err, user) => {
          if(err) throw err
          user.rows[0].token = null
          let opt = {
            expiresIn: '1h'
          }
          let token = jwt.sign(user.rows[0], 'testxcidic', opt)
          pool.query(`UPDATE users SET token = '${token}' WHERE email = '${user.rows[0].email}'`, (err) => {
            if(err) throw err
            res.json({
              token: token,
              message: 'Signin Success!'
            })
          })          
        })
      }else{
        res.json({
          message: 'Email or Password Wrong !'
        })
      }
    }else{
      res.json({
        message: 'Email or Password Wrong !'
      })
    }
  })
})

router.get('/signout/:id', (req, res) => {
  pool.query(`UPDATE users SET token = null WHERE id = ${req.params.id}`, (err) => {
    if(err) throw err
    res.json({
      message: 'Signout Success!'
    })
  })
})

router.get('/verify/:token', (req, res) => {
  jwt.verify(req.params.token, 'testxcidic', (err) => {
    if(err){
      res.json({
        status: false
      })
    }else{
      res.json({
        status: true
      })
    }
  })
})

module.exports = router;
