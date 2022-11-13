const express = require('express')
const bodyParser = require('body-parser')
const { Op } = require("sequelize")
const app = express();

app.use(bodyParser.json());


const contractsRouter = require('./routes/contracts')
const jobsRouter = require('./routes/jobs')
const balancesRouter = require('./routes/balances')
const adminRouter = require('./routes/admin')

app.use('/contracts', contractsRouter)
app.use('/jobs', jobsRouter)
app.use('/balances', balancesRouter)
app.use('/admin', adminRouter)


module.exports = app
