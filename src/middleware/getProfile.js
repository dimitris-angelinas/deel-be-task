const {Profile} = require('../model')

const getProfile = async (req, res, next) => {
    const id = req.get('profile_id')
    if(!id) return res.status(401).end()
    const profile = await Profile.findOne({where: {id}})
    if(!profile) return res.status(401).end()
    req.profile = profile
    next()
}
module.exports = {getProfile}