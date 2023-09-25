class Validator {
    constructor(res){
        this.res = res
    }

    success(data={}){
        this.res.send({...data, success: true})
    }

    error(err=''){
        this.res.send({success: false, err: err})
    }
}

exports.Validator = Validator