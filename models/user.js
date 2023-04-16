const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String,  required: true  },
    password: { type: String,  required: true  },
    admin:    { type: Boolean, required: true  }
});
// Save individual hashed password 
UserSchema.pre(
    'save', 
    async function(next) {
        // select schema
        let password = this.password;
        // encrypt password
        const hash = await bcrypt.hash(password, 10);
        // save to password
        password = hash;
        // next
        next()
    }
)
// Add isValidPassword to UserSchema methods, compares form password with saved password
UserSchema.methods.isValidPassword = async function(password) {
    // save this schema to user
    const userPassword = this.password;
    // compare entered password with saved passsword 
    const compare = await bcrypt.compare(password, userPassword);
    // return boolean returned by bcrypt.compare
    return compare;
}

module.exports = mongoose.model("User", UserSchema);


