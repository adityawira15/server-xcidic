var express = require('express');
var router = express.Router();
var { Pool } = require('pg')
var moment = require('moment')

const pool = new Pool({
  user: 'hztmrvmdvdrjkr',
  host: 'ec2-23-21-238-28.compute-1.amazonaws.com',
  database: 'd6naj6qrkitt4',
  password: '8ae87f55b1b89bba83ce7348b1ee0ea6fba622b6089467c38abf2fb0e61ad7c7',
  port: '5432'
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/patient', (req, res) => {
  pool.query("SELECT id, firstname || ' ' || lastname as fullname, email FROM users WHERE type = 'Patient' ORDER BY fullname ASC", (err, val) => {
    if (err) throw err
    res.json(val.rows)
  })
})

router.get('/datapatient/:id', (req, res) => {
  pool.query(`SELECT * FROM data WHERE userid = ${req.params.id}`, (err, val) => {
    if (err) throw err
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
  let date = moment().format('MM/DD/YYYY')
  pool.query(`SELECT * FROM users WHERE email = '${data.email}'`, (err, val) => {
    if (err) {
      throw err
    } else if (val.rows.length === 0) {
      res.json({
        status: false,
        message: 'Email Not Listed!'
      })
    } else {
      pool.query(`INSERT INTO data(name, email, disease, diseases, tools, presentations, date, userid) VALUES('${data.name}', '${data.email}', '${data.disease}', '${JSON.stringify(data.diseases)}', '${JSON.stringify(data.tools)}', '${JSON.stringify(data.presentations)}', '${date}', ${val.rows[0].id} )`, (err) => {
        if (err) throw err
        pool.query(`SELECT * FROM data WHERE email = '${data.email}'`, (err, user) => {
          if (err) throw err
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
    if (err) throw err
    res.json({ data: val.rows[0] })
  })
})

router.post('/editdata/:id', (req, res) => {
  pool.query(`UPDATE data SET disease = '${req.body.disease}', diseases = '${JSON.stringify(req.body.diseases)}', tools = '${JSON.stringify(req.body.tools)}', presentations = '${JSON.stringify(req.body.presentations)}'  WHERE id = ${req.params.id}`, (err, val) => {
    if(err) throw err
    res.json({
      message: 'Update Success!'
    })
  })
})

router.delete('/deletedata/:id', (req, res) => {
  pool.query(`DELETE FROM data WHERE id = ${req.params.id}`, (err) => {
    if (err) throw err
    res.json({ message: 'Delete Success!' })
  })
})

module.exports = router;
