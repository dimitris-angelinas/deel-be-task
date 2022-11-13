const express = require('express')
const {Op} = require("sequelize")
const router = express.Router()

const {sequelize, Profile, Contract, Job} = require('../model')

const getBestProfiles = async (profileType, params, attributes) => {
    const {start, end, limit} = params
    let jobFilters = {
        paid: true
    }
    //TODO: validate start, end format?
    if(start){
        jobFilters.createdAt = {[Op.gte]: start}
    }
    if(end){
        jobFilters.updatedAt = {[Op.lte]: end}
    }

    let type = profileType
    let as = profileType.charAt(0).toUpperCase() + profileType.slice(1);

    //TODO: check more results for a tie
    return await Profile.findAll({
        where: {
            type
        },
        attributes,
        include: {
            model: Contract,
            as,
            attributes: [],
            required: true,
            include: {
                model: Job,
                required: true,
                attributes: [],
                where: jobFilters
            }
        },
        group: ['Profile.id'],
        order: [['paid', 'DESC']],
        subQuery: false,
        limit
    })
}

router.get('/best-profession', async (req, res) =>{
    try {
        const {start, end} = req.query

        const attributes = [
            'profession',
            [sequelize.fn('sum', sequelize.col('Contractor.Jobs.price')), 'paid'],
        ]
        const contractors = await getBestProfiles('contractor', {start, end, limit:1}, attributes)
        if(!contractors || !contractors[0]) return res.status(404).json({error: 'No contractors found!'})

        const contractor = contractors[0]
        if(!contractor.dataValues.paid) return res.status(404).json({error: 'No paid jobs found!'})

        res.json(contractor.profession)
    }
    catch (err) {
        console.error('/best-profession', err)
        res.status(500).json({error: String(err)})
    }
})

router.get('/best-clients', async (req, res) =>{
    try {
        const {start, end, limit=2} = req.query

        const attributes = [
            'id',
            [sequelize.literal("firstName || ' ' || lastName"), 'fullName'],
            [sequelize.fn('sum', sequelize.col('Client.Jobs.price')), 'paid'],
        ]

        const clients = await getBestProfiles('client', {start, end, limit}, attributes)

        res.json(clients)
    }
    catch (err) {
        console.error('/best-profession', err)
        res.status(500).json({error: String(err)})
    }
})

module.exports = router
