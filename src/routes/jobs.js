const express = require('express')
const {getProfile} = require('../middleware/getProfile')
const {getContractProfileId} = require('../middleware/getContractProfileId')
const { Op } = require("sequelize")
const router = express.Router()

const {sequelize, Profile, Contract, Job} = require('../model')

router.use(getProfile)

router.get('/unpaid', getContractProfileId, async (req, res) =>{
    try {
        const jobs = await Job.findAll({
            where: {
                [Op.or]: [
                    {paid: {[Op.is]: null}},
                    {paid: {[Op.ne]: true}}
                ],
            },
            include: {
                model: Contract,
                required: true,
                attributes: [],
                where: {
                    [req.ContractProfileId]: req.profile.id,
                    status: 'in_progress'
                }
            }
        })
        res.json(jobs)
    }
    catch (err) {
        console.error('/jobs/unpaid', err)
        res.status(500).json({error: String(err)})
    }
})

router.post('/:job_id/pay', async (req, res) =>{
    try {
        const client = req.profile

        if(client.type != 'client') return res.status(403).json({error: 'Wrong client!'})
        
        const {job_id} = req.params

        const job = await Job.findOne({
            where: {
                id: job_id,
                [Op.or]: [
                    {paid: {[Op.is]: null}},
                    {paid: {[Op.ne]: true}}
                ],
            },
            attributes: ['price'],
            include: {
                model: Contract,
                required: true,
                attributes: ['ClientId'],
                include: {
                    model: Profile,
                    as :'Contractor',
                    attributes: ['id', 'balance'],
                    required: true
                }
            }
        })

        if (!job) return res.status(404).json({error: 'Job not found!'})
        if(job.Contract.ClientId != client.id) return res.status(403).json({error: 'Mind your own business!'})

        const amount = job.price
        if(client.balance < amount) return res.status(403).json({error: 'You are broke!'})

        const contractor = job.Contract.Contractor

        await sequelize.transaction(async (t) => {
            const clientBalance_p = client.update({balance: client.balance - amount}, { transaction: t })
            const contractorBalance_p = contractor.update({balance: contractor.balance + amount}, { transaction: t })
            await Promise.all([clientBalance_p, contractorBalance_p])
        })


        //TODO: update job to paid?

        res.json({message: 'Successful Payment!'})
    }
    catch (err) {
        console.error('/jobs/:job_id/pay', err)
        res.status(500).json({error: String(err)})
    }
})

module.exports = router
