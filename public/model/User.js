const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    ResourceID: String,
    FirstName: String,
    LastName: String,
    Email: { type: String, unique: true },
    UserName: String,
    Password: String,
    PhoneNumber: String,
    EmailVerifiedbyUser: Boolean,
    Role: String,
    IsApprovedByAdmin: String,
    IsActive: Boolean,
    EmailConfirmationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    CreatedById:String,
    CreatedOn: { type: Date, default: Date.now },
    UpdatedById:String,
    UpdatedOn: { type: Date, default: Date.now }}, 
    { versionKey: false });


/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('Password')) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.Password, salt, null, (err, hash) => {
            if (err) { return next(err); }
            user.Password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.ComparePassword = function ComparePassword(CandidatePassword, cb) {
    bcrypt.compare(CandidatePassword, this.Password, (err, isMatch) => {
        cb(err, isMatch);
    });
};



const User = mongoose.model('User', userSchema);
module.exports = User;
