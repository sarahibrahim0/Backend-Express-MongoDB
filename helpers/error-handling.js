function errHandler (err, req, res, next){
    if(err === "UnauthorizedError"){
        res.status(400).json({message: 'not authorized'})
    }

    if(err === 'ValidationError'){
        res.status(401).json({message: err})
    }

    return    res.status(501).json(err)

}

module.exports = errHandler;