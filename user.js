const bcrypt = require("bcrypt")


userSchema.pre ('save', async function(next){
    const salt = await bcrypt.genSalt;
    this.actualpassword = await bcrypt.hash(this.actualpassword, salt);
    next()
})