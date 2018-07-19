var express = require('express');
var router = express.Router();
var { Pool } = require('pg')
var moment = require('moment')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'xcidic',
  password: 'AdItYa15:)',
  port: '5432'
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/patient', (req, res) => {
  pool.query("SELECT id, firstname || ' ' || lastname as fullname, email FROM users WHERE type = 'Patient'", (err, val) => {
    if(err) throw err
    res.json(val.rows)
  })
})

router.get('/datapatient/:id', (req, res) => {
  pool.query(`SELECT * FROM data WHERE userid = ${req.params.id}`, (err, val) => {
    if(err) throw err
    res.json(val.rows)
  })
})

router.post('/adddata', (req, res) => {
  let data = {
    name: req.body.name,
    email: req.body.email,
    disease: req.body.disease,
    diseases: req.body.diseases,
    tools: req.body.tools,
    presentations: req.body.presentations
  }
  let date = moment().format('DD/MM/YYYY')
  pool.query(`SELECT * FROM users WHERE email = '${data.email}'`, (err, val) => {
    if(err){
      throw err
    }else if(val.rows.length === 0){
      res.json({
        status: false,
        message: 'Email Not Listed!'
      })
    }else{
      pool.query(`INSERT INTO data(name, email, disease, diseases, tools, presentations, date, userid) VALUES('${data.name}', '${data.email}', '${data.disease}', '${JSON.stringify(data.diseases)}', '${JSON.stringify(data.tools)}', '${JSON.stringify(data.presentations)}', '${date}', ${val.rows[0].id} )`, (err) => {
        if (err) throw err
        pool.query(`SELECT * FROM data WHERE email = '${data.email}'`, (err, user) => {
          if(err) throw err
          res.json({
            status: true,
            message: 'Success Add !',
            data: user.rows[0]
          })
        })
      })
    }
  })
})

router.get('/detail/:id', (req, res) => {
  pool.query(`SELECT * FROM data WHERE id = ${req.params.id}`, (err, val) => {
    if(err) throw err
    res.json({data: val.rows[0]})
  })
})

router.get('/editdata/:id', (req, res) => {
  pool.query(`SELECT * FROM data WHERE id = ${req.query.id}`, (err, val) => {
    res.json(val.rows)
  })
})

router.post('/editdata/:id', (req, res) => {
  pool.query(`UPDATE data SET column1 = ${req.body} WHERE id = ${req.query.id}`, (err, val) => {
    res.json(val.rows)
  })
})

router.delete('/deletedata/:id', (req, res) => {
  pool.query(`DELETE FROM data WHERE id = ${req.query.id}`, (err, val) => {
    res.json(val.rows)
  })
})

module.exports = router;
