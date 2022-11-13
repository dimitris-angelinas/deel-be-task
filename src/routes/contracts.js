const express = require('express')
const {getProfile} = require('../middleware/getProfile')
const {getContractProfileId} = require('../middleware/getContractProfileId')
const { Op } = require("sequelize")
const router = express.Router()

const {Contract} = require('../model')

router.use(getProfile)
router.use(getContractProfileId)

router.get('/:id', async (req, res) =>{
    try {
        const {id} = req.params
        const contract = await Contract.findOne({
            where: {
                id,
                [req.ContractProfileId]: req.profile.id
            }
        })
        if (!contract) return res.status(403).end()
        res.json(contract)
    }
    catch (err) {
        console.error('/contracts/:id', err)
        res.status(500).json({error: String(err)})
    }
})

router.get('/', async (req, res) =>{
    try {
        const contracts = await Contract.findAll({
            where: {
                [req.ContractProfileId]: req.profile.id,
                status: {[Op.ne]: 'terminated'}
            }
        })
        res.json(contracts)
    }
    catch (err) {
        console.error('/contracts', err)
        res.status(500).json({error: String(err)})
    }
})

module.exports = router
