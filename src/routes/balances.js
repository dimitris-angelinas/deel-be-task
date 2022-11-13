const express = require('express')
const {getProfile} = require('../middleware/getProfile')
const { Op } = require("sequelize")
const router = express.Router()

const {Contract, Job} = require('../model')

router.use(getProfile)

router.post('/deposit/:userId', async (req, res) =>{
    try{
        const {userId} = req.params
        const client = req.profile

        // I assume authenticated user can only deposit to himself
        if(client.id != userId) return res.status(403).json({error: 'Wrong userId!'})
        if(client.type != 'client') return res.status(403).json({error: 'Wrong client!'})

        // I assume the deposit amount is passed to body
        const {amount} = req.body

        // I could check for type of number to disallow strings
        const isPositive = Math.sign(amount) === 1
        if(!isPositive) return res.status(400).json({error: 'Provide a positive number for amount.'})


        //check job status?
        const jobsTotalAmount = await Job.sum('price', {
            include: {
                model: Contract,
                required: true,
                attributes: [],
                where: {
                    clientId: userId
                }
            }
        })

        if(amount > jobsTotalAmount * 0.25) return res.status(403).json({error: 'Too much money!'})

        await client.update({balance: client.balance + amount})

        res.json({message: 'Successful Deposit!'})
    }
    catch (err) {
        console.error('/balances/deposit/:userId', err)
        return res.status(500).json({error: String(err)})
    }
})

module.exports = router
