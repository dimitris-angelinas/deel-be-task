const express = require('express')
const bodyParser = require('body-parser')
const { Op } = require("sequelize")
const app = express();
const {Profile, Job} = require('./model')
const {getProfile} = require('./middleware/getProfile')

app.use(bodyParser.json());
app.use(getProfile)

//TODO: TODO: !!! select attributes (field), limit results

//NOTES: typescript

app.get('/profiles', async (req, res) =>{
    const profiles = await Profile.findAll()
    res.json(profiles)
})

app.get('/jobs', async (req, res) =>{
    const jobs = await Job.findAll()
    res.json(jobs)
})


const contractsRouter = require('./routes/contracts')
const jobsRouter = require('./routes/jobs')
const balancesRouter = require('./routes/balances')
const adminRouter = require('./routes/admin')

app.use('/contracts', contractsRouter)
app.use('/jobs', jobsRouter)
app.use('/balances', balancesRouter)
app.use('/admin', adminRouter)


module.exports = app
