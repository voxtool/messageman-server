const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALTROUNDS) || 10;


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'The username should be at least 3 characters long.'],
        validate: {
            validator: function (username) {
                return /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(username);
            },
            message: 'Please fill a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'The password should be at least 8 characters long.'],
        validate: {
            validator: function (password) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g.test(password);
            },
            message: props => `${props.value} must contain at least one uppercase letter, one lowercase letter, one symbol and one number.`
        },
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: { createdAt: 'created_at' } });

userSchema.methods = {
    matchPassword: function (password) {
        return bcrypt.compare(password, this.password);
    }
}

userSchema.pre('save', function (next) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            next(err);
        }
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
                next(err);
            }
            this.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model('User', userSchema);