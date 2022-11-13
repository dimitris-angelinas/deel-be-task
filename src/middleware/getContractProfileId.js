
const getContractProfileId = (req, res, next) => {
    const profileType = req.profile.type
    req.ContractProfileId = profileType == 'client' ? 'ClientId' : 'ContractorId'
    next()
}
module.exports = {getContractProfileId}