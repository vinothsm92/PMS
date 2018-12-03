const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../model/User');
const _ = require('lodash');

const request = require('request');
var handlebars = require('handlebars');
var fs = require('fs');
const LocalStrategy = require('passport-local').Strategy;

var PMSErrorConfig = fs.readFileSync(__dirname + '/../PMSConfig/PMSErrorConfig.json');
var Domainconfig = fs.readFileSync(__dirname + '/../PMSConfig/PMSCartEstimationToolConfig.json');
var GetProjectNameconfig = fs.readFileSync(__dirname + '/../PMSConfig/EnterpriseConfiguration.json');
var GetSubjectNameconfig = fs.readFileSync(__dirname + '/../PMSConfig/EmailSubjects.json');

var ErrorMsgs = JSON.parse(PMSErrorConfig);

var HCConfigDetails = JSON.parse(Domainconfig);

var  GetProjectNamefromEnterpriseconfig= JSON.parse(GetProjectNameconfig);

var SubjectConfigDetails = JSON.parse(GetSubjectNameconfig);

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {

    req.assert('Email', 'Email is not valid').isEmail();
    req.assert('Password', 'Password cannot be blank').notEmpty();
    req.sanitize('Email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        var Errordata = [];
        var data = {};
        data.ErrorMsg = ErrorMsgs.Login.HCL005;
        data.ErrorCode = 'HCL005';
        Errordata.push(data);
        return res.json(data);
    }


    passport.authenticate('local', (err, user, info) => {       
        if (err) { return next(err); }
        if (!user) {

            var Errordata = [];
            var data = {};
            data.ErrorMsg = ErrorMsgs.Login.HCL005;
            data.ErrorCode = 'HCL005';
            Errordata.push(data);
            return res.json(data);

           
        }

        else if (!user.EmailVerifiedbyUser) {
            var Errordata = [];
            var data = {};
            data.ErrorMsg = ErrorMsgs.Login.HCL001;
            data.ErrorCode = 'HCL001';
            Errordata.push(data);
            return res.json(data);
          
        }
        else if (user.IsApprovedByAdmin == 3) {
            var Errordata = [];
            var data = {};
            data.ErrorMsg = ErrorMsgs.Login.HCL002;
            data.ErrorCode = 'HCL002';
            Errordata.push(data);
            return res.json(data);
          
        }
        else if (user.IsApprovedByAdmin == 2) {
            var Errordata = [];
            var data = {};
            data.ErrorMsg = ErrorMsgs.Login.HCL003;
            data.ErrorCode = 'HCL003';
            Errordata.push(data);
            return res.json(data);
           
        }
        else if (!user.IsActive) {
            var Errordata = [];
            var data = {};
            data.ErrorMsg = ErrorMsgs.Login.HCL004;
            data.ErrorCode = 'HCL004';
            Errordata.push(data);
            return res.json(data);

          
        }
        else if (user.IsApprovedByAdmin == 2 && !user.IsActive) {
            var Errordata = [];
            var data = {};
            data.ErrorMsg = ErrorMsgs.Login.HCL003;
            data.ErrorCode = 'HCL003';
            Errordata.push(data);
            return res.json(data);
           

        }

        else {
            req.logIn(user, (err) => {
                if (err) { return next(err); }
                res.json(user);
               
            });
        }
    })(req, res, next);  
};




/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {    
   
    req.assert('Email', 'Email is not valid').isEmail();
    req.assert('Password', 'Password must be at least 4 characters long').len(4);
    req.assert('ConfirmPassword', 'Passwords do not match').equals(req.body.Password);
    req.sanitize('Email').normalizeEmail({ remove_dots: false });
    

    const errors = req.validationErrors();

    if (errors) {
        var Errordata = [];
        var data = {};
        data.ErrorMsg = ErrorMsgs.Register.HCR006;
        data.ErrorCode = 'HCR006';
        Errordata.push(data);

        return res.json(data);

    }

    const user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        UserName: req.body.UserName,
        Password: req.body.Password,
        PhoneNumber: req.body.PhoneNumber
    });

    var SplitEmail = req.body.Email.substr(req.body.Email.indexOf('@') + 1, req.body.Email.Length);
    var MailDomainLen = Object.keys(HCConfigDetails.Mail.Domains).length;
    var domaincheck = false;
    var DomainCheckFunction = function () {
        for (i = 0; i < MailDomainLen; i++) {


            if (SplitEmail == HCConfigDetails.Mail.Domains[i]) {
                domaincheck = true;
                break;
            }
            else if (SplitEmail != HCConfigDetails.Mail.Domains[i] && i == MailDomainLen - 1) {
                domaincheck = false;
                var Errordata = [];
                var data = {};
                data.ErrorMsg = ErrorMsgs.Register.HCR004;
                data.ErrorCode = 'HCR004';
                Errordata.push(data);
                res.json(data);

            }
        }
    };
    DomainCheckFunction();
    if (domaincheck) {
        domaincheck = false;
        User.findOne({ $or: [{ Email: req.body.Email }, { 'UserName': req.body.UserName },{ PhoneNumber: req.body.PhoneNumber}] }, (err, existingUser) => {

            if (err) { return next(err); }
            if (existingUser) {
                if (existingUser.Email == req.body.Email && existingUser.UserName == req.body.UserName) {
                    
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR001;
                    data.ErrorCode = 'HCR001';
                    Errordata.push(data);
                    res.json(data);

                }
                else if (existingUser.Email == req.body.Email && existingUser.UserName != req.body.UserName) {
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR003;
                    data.ErrorCode = 'HCR003';
                    Errordata.push(data);
                    res.json(data);

                } else if (existingUser.Email != req.body.Email && existingUser.UserName == req.body.UserName) {

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR002;
                    data.ErrorCode = 'HCR002';
                    Errordata.push(data);
                    res.json(data);

                }
                else if (existingUser.PhoneNumber == req.body.PhoneNumber) 
                {

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR007;
                    data.ErrorCode = 'HCR007';
                    Errordata.push(data);
                    res.json(data);

                }

            }
            else {
                async.waterfall([
                    function createRandomToken(done) {
                        crypto.randomBytes(16, (err, buf) => {
                            const token = buf.toString('hex');
                            done(err, token);
                        });
                    },
                    function setRandomToken(token, done) {
                        user.EmailConfirmationToken = token;
                        user.save((err) => {
                            done(err, token, user);
                        });

                    },



                    function sendEmailConfirmation(token, user, done) {
                        var readHTMLFile = function (path, callback) {
                            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                                if (err) {
                                    throw err;
                                    callback(err);
                                }
                                else {
                                    callback(null, html);
                                }
                            });
                        };


                        var smtpConfig = {
                            host: process.env.Mail_host,
                            port: process.env.Mail_port,
                            auth: {
                                user: process.env.Mail_user,
                                pass: process.env.Mail_password
                            }

                        };
                        var transporter = nodemailer.createTransport(smtpConfig);

                        readHTMLFile(__dirname + '/../MailContents/registerconfirmationmail.html', function (err, html) {
                            var template = handlebars.compile(html);
                            var replacements = {
                                FirstName: user.FirstName,
                                LastName: user.LastName,
                                ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,  
                                URL: `http://${req.headers.host}/EmailConfirmation/${token}`

                            };
                            var htmlToSend = template(replacements);
                            var mailOptions = {
                                to: user.Email,
                                 from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
                                subject:  SubjectConfigDetails.EmailSubjects.RegistrationMailSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle),
                              
                                html: htmlToSend
                            };                          
                            transporter.sendMail(mailOptions, (err) => {
                               
                                var Errordata = [];
                                var data = {};
                                data.ErrorMsg = ErrorMsgs.Register.HCR005;
                                data.ErrorCode = 'HCR005';
                                Errordata.push(data);
                                res.json(data);
                                done(err);
                            });
                        });
                    }
                ], (err) => {
                    if (err) { return next(err); }                   
                    res.json("Failed");
                });

            }
        });
    };
};






/**
 * GET /EmailConfirmation/:token
 * Email Confirmation page.
 */
exports.getEmailConfirmation = (req, res, next) => {
    var userEmail = '';

    User
        .findOne({ EmailConfirmationToken: req.params.token })
        
        .exec((err, user) => {
            if (err) { return next(err); }
            if (!user) {
               
                return res.redirect('/');
            }
            user.ResourceID='';
            user.EmailConfirmationToken = undefined;
            user.EmailVerifiedbyUser = true;
            user.IsApprovedByAdmin = 3;
            user.IsActive = false;
            user.Role = '';
              
            userEmail = user.Email;
            resettoken = req.params.token;
            user.save((err) => {
                if (err) { return next(err); }

            });
            User.find({ Role:'59240ca091c11112f42ec22f' }, { '_id': 0, 'Email': 1 }, function (err, users) {
				 var admins = []
                    users.forEach(function (u) {
                         admins.push(u.Email) 
                        NewUserAdminEmail(u.Email);
                        
                    })
                
                    function NewUserAdminEmail(admins) {

                    var readHTMLFile = function (path, callback) {
                        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                            if (err) {
                                throw err;
                                callback(err);
                            }
                            else {
                                callback(null, html);
                            }
                        });
                    };


                    var smtpConfig = {
                        host: process.env.Mail_host,
                        port: process.env.Mail_port,
                        auth: {
                            user: process.env.Mail_user,
                            pass: process.env.Mail_password
                        }

                    };

                    var transporter = nodemailer.createTransport(smtpConfig);

                    readHTMLFile(__dirname + '/../MailContents/AdminEmailForNewUser.html', function (err, html) {
                        var template = handlebars.compile(html);
                        var replacements = {
                            FirstName: user.FirstName,
                            LastName: user.LastName,
                            ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle, 
                        };
                        var htmlToSend = template(replacements);
                        var mailOptions = {
                            to: admins,
                            from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
                            subject: SubjectConfigDetails.EmailSubjects.AdminMailForNewUserSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle) + ' ('+ replacements.FirstName + replacements.LastName + ')',
                           
                            html: htmlToSend
                        };

                        transporter.sendMail(mailOptions, (err) => {
                           
                        });
                    });
                }
            });
            res.render('EmailConfirmation', {
                title: 'Email Confirmation'
            });

        });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {

    async.waterfall([
        function createRandomToken(done) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function setRandomToken(token, done) {

            User.findOne({ Email: req.body.Email }, (err, user) => {

                if (err) { return done(err); }
                if (!user) {

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ForgotPassword.HCFP007;
                    data.ErrorCode = 'HCFP007';
                    Errordata.push(data);
                    return res.json(data);

                   
                } else if (!user.EmailVerifiedbyUser) {

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ForgotPassword.HCFP001;
                    data.ErrorCode = 'HCFP001';
                    Errordata.push(data);
                    return res.json(data);
                  


                }
                else if (user.IsApprovedByAdmin == 3) {
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ForgotPassword.HCFP002;
                    data.ErrorCode = 'HCFP002';
                    Errordata.push(data);
                    return res.json(data);
                   
                }
                else if (user.IsApprovedByAdmin == 2) {
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ForgotPassword.HCFP003;
                    data.ErrorCode = 'HCFP003';
                    Errordata.push(data);
                    return res.json(data);
                  

                }
                else if (!user.IsActive) {
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ForgotPassword.HCFP004;
                    data.ErrorCode = 'HCFP004';
                    Errordata.push(data);
                    return res.json(data);

                  
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.save((err) => {
                    done(err, token, user);
                });
            });
        },

        function sendForgotPasswordEmail(token, user, done) {
            var readHTMLFile = function (path, callback) {
                fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                    if (err) {
                        throw err;
                      
                    }
                    else {
                        callback(null, html);
                    }
                });
            };


            var smtpConfig = {
                host: process.env.Mail_host,
                port: process.env.Mail_port,
                auth: {
                    user: process.env.Mail_user,
                    pass: process.env.Mail_password
                }

            };

            var transporter = nodemailer.createTransport(smtpConfig);

            readHTMLFile(__dirname + '/../MailContents/forgotMailContent.html', function (err, html) {
                var template = handlebars.compile(html);
                var replacements = {
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    ProjectName:  GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle , 
                    URL: `http://${req.headers.host}/reset/${token}`

                };
                var htmlToSend = template(replacements);
                var mailOptions = {
                    to: user.Email,
                    from:process.env.Sender_name+ ' <' + process.env.From_mail + '>',
                    subject: SubjectConfigDetails.EmailSubjects.ForgetPasswordSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle),
                    html: htmlToSend
                };
               
                transporter.sendMail(mailOptions, (err) => {
                    
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ForgotPassword.HCFP006;
                    data.ErrorCode = 'HCFP006';
                    Errordata.push(data);
                    return res.json(data);
                   
                    done(err);
                });
            });
        }
    ], (err) => {
        if (err) { return next(err); }
       
        res.json("Failed");
    });
};
var resettoken = "";

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {

    if (req.isAuthenticated()) {
        return res.redirect('/index1.html');
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) { return next(err); }
            if (!user) {              
                return res.redirect('/');
            }
            resettoken = req.params.token;
            res.render('reset', {
                title: 'Password Reset'
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {  
    req.assert('Password', 'Password must be at least 4 characters long.').len(4);
    req.assert('ConfirmPassword', 'Passwords must match.').equals(req.body.Password);

    const errors = req.validationErrors();

    if (errors) {
        return res.json("Passwordmatch"); 
    }

    async.waterfall([
        function resetPassword(done) {
            User
                .findOne({ passwordResetToken: resettoken })
                .where('passwordResetExpires').gt(Date.now())
                .exec((err, user) => {
                    if (err) { return next(err); }
                    if (!user) {
                       
                        var Errordata = [];
                        var data = {};
                        data.ErrorMsg = ErrorMsgs.ResetPassword.HCRP002;
                        data.ErrorCode = 'HCRP002';
                        Errordata.push(data);
                        return res.json(data);
                      
                    }
                    user.Password = req.body.Password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save((err) => {
                        if (err) { return next(err); }
                        
                    });

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.ResetPassword.HCRP001;
                    data.ErrorCode = 'HCRP001';
                    Errordata.push(data);
                    return res.json(data);
                   
                });
        }

    ], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

exports.home = (req, res) => {

    res.json("Redirect");
};


exports.ShowUsers = (req, res) => {
    User.find({}).sort({ '_id': -1 }).exec(function (err, docs) {
        if (err) {
            console.log("Error Occured");
            console.log(err);

        }

        res.json(docs);


    });
};


exports.ShowUsersforTeamDetails = (req, res) => {
    User.find({IsActive:true,IsApprovedByAdmin:1}).sort({ '_id': -1 }).exec(function (err, docs) {
        if (err) {
            console.log("Error Occured");
            console.log(err);

        }

        res.json(docs);


    });
};
exports.getusermailid = (req, res) => {
    var UserName=req.params.getusermailid;
    User.find({ UserName: UserName }, { Email: 1 }, function (err, docs) {
        if (err) {
            console.log("Error occured");
            console.log(err);
        }
        res.json(docs);
    });
};
exports.ShowUsers1 = (req, res) => {
    User.find({IsApprovedByAdmin:1,IsActive:true}).sort({ 'UserName': 1 }).exec(function (err, docs) {
        if (err) {
            console.log("Error Occured");
            console.log(err);

        }

        res.json(docs);


    });
};
exports.AdminMainsendDetails = (req, res) => {
    User.find({IsActive:true, Role : "59240ca091c11112f42ec22f"}).exec(function (err, docs) {
        if (err) {
            console.log("Error Occured");
            console.log(err);

        }

        res.json(docs);


    });
};

exports.DeleteManageUser = (req, res) => {


    var id = req.params.Userkeyid;
    User.findByIdAndRemove((id),function (err, doc) {
        if (err) {          
            console.log(err);
        }

        res.json(doc);   
    });
};

exports.ShowUserID = (req, res) => {
    User.find({}, { id: 1 }, function (err, docs) {
        if (err) {
            console.log("Error occured");
            console.log(err);
        }

        res.json(docs);


    });
};


exports.UpdateUser = (req, res) => {
    var id = req.params.id;
    var ResourceID = req.params.ResourceID;
    var UserName = req.params.displayname;
    var EmailId = req.params.email;
    var Firstname = req.params.fname;
    var Lastname = req.params.lname;
    var mobile = req.params.mobile;
    var RoleId = req.params.role;
    var emailverified = req.params.emailverified;
    var status = req.params.status;
    var Isactive = req.params.isActive;
    var UpdatedById = req.params.UpdatedById;
   

    User.update({ _id: id },
        {
            $set: {ResourceID:ResourceID,
                UserName: UserName, Email: EmailId, FirstName: Firstname,
                LastName: Lastname, Mobile: mobile, Role: RoleId, EmailVerifiedbyUser: emailverified,
                IsApprovedByAdmin: status, IsActive: Isactive, UpdatedById: UpdatedById
            }
        },
        function (err, doc) {
            if (err) {
                console.log("Error occured");
                console.log(err);
            }

            res.json(doc);
          

        }

    );
};

exports.UpdateUser1 = (req, res) => {
    var id = req.params.id;
    
    var UserName = req.params.displayname;
    var EmailId = req.params.email;
    var Firstname = req.params.fname;
    var Lastname = req.params.lname;
    var mobile = req.params.mobile;
    
    var emailverified = req.params.emailverified;
    var status = req.params.status;
    var Isactive = req.params.isActive;
    var UpdatedById = req.params.UpdatedById;
    

    User.update({ _id: id },
        {
            $set: {
                UserName: UserName, Email: EmailId, FirstName: Firstname,
                LastName: Lastname, Mobile: mobile, EmailVerifiedbyUser: emailverified,
                IsApprovedByAdmin: status, IsActive: Isactive, UpdatedById: UpdatedById
            }
        },
        function (err, doc) {
            if (err) {
                console.log("Error occured");
                console.log(err);
            }

            res.json(doc);
      

        }

    );
};



exports.SendMailForReject = (req, res) => {
    var Firstname = req.params.fname;
    var Lastname = req.params.lname;
    var email = req.params.email;


    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {

            if (err) {
                console.log(err);
                throw err;
              
            }
            else {
                callback(null, html);
            }
        });
    };



    var smtpConfig = {
        host: process.env.Mail_host,
        port: process.env.Mail_port,
        auth: {
            user: process.env.Mail_user,
            pass: process.env.Mail_password
        }

    };

    var transporter = nodemailer.createTransport(smtpConfig);

    readHTMLFile(__dirname + '/../MailContents/EmailForRejectedUser.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            FirstName: Firstname,
            LastName: Lastname,
            ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,


        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            to: email,
            from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
            subject:   SubjectConfigDetails.EmailSubjects.RejectedMailSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle),
           
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, (err) => {
          
        }
        );
        if (err) {
            console.log(err);
        }
    }


    );

}






exports.SendMailForApprove = (req, res) => {
    var Firstname = req.params.fname;
    var Lastname = req.params.lname;
    var email = req.params.email;


    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                console.log(err);
                throw err;
               
            }
            else {
                callback(null, html);
            }
        });
    };



    var smtpConfig = {
        host: process.env.Mail_host,
        port: process.env.Mail_port,
        auth: {
            user: process.env.Mail_user,
            pass: process.env.Mail_password
        }

    };



    var transporter = nodemailer.createTransport(smtpConfig);

    readHTMLFile(__dirname + '/../MailContents/EmailForApprovedUser.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            FirstName: Firstname,
            LastName: Lastname,
            ProjectName:GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,
            URL: `http://${req.headers.host} `,
        };
        
        var htmlToSend = template(replacements);
        var mailOptions = {
            to: email,
            from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
            subject:   SubjectConfigDetails.EmailSubjects.ApprovedMailSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle),
          
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, (err) => {


        });
        if (err) {
            console.log(err);
        }
    }

    );

}



exports.GetRoleid = (req, res) => {
    var displayname = req.params.username;

    User.find({ UserName: displayname }, { Role: 1 }, function (err, docs) {
        if (err) {
            console.log("Error occured");
            console.log(err);
        }
        res.json(docs);
    });
}




exports.ProjectAllotNotification = (req, res) => {
    var ProjectDetail = req.body.ProjectNameInfo;
    var TeamLead = req.body.TeamLeaderID;
    var email = req.body.email;


    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {

            if (err) {
                console.log(err);
                throw err;
               
            }
            else {
                callback(null, html);
            }
        });
    };



    var smtpConfig = {
        host: process.env.Mail_host,
        port: process.env.Mail_port,
        auth: {
            user: process.env.Mail_user,
            pass: process.env.Mail_password
        }

    };
    
    var transporter = nodemailer.createTransport(smtpConfig);

    readHTMLFile(__dirname + '/../MailContents/EmailForProjectAllocation.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            UserName: TeamLead,
            ProjectInfo: ProjectDetail,
            ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,


        };
     
        var htmlToSend = template(replacements);
        var mailOptions = {
            to: email,
            from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
            subject:   SubjectConfigDetails.EmailSubjects.ApprovedMailSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle),
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, (err) => {
        }
        );
        if (err) {
            console.log(err);
        }
    }


    );

}

//Team Member Allocation Mail

exports.TeamMemberAlotNotification = (req, res) => {
    var ProjectName = req.body.ProjectName;
    var TeamMember = req.body.TeamMember;
    var email = req.body.email;
    var TeamLead=req.body.TeamLeaderID;

    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {

            if (err) {
                console.log(err);
                throw err;
              
            }
            else {
                callback(null, html);
            }
        });
    };



    var smtpConfig = {
        host: process.env.Mail_host,
        port: process.env.Mail_port,
        auth: {
            user: process.env.Mail_user,
            pass: process.env.Mail_password
        }

    };

    var transporter = nodemailer.createTransport(smtpConfig);

    readHTMLFile(__dirname + '/../MailContents/TeamAllocation.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            UserName: TeamMember,
            ProjectInfo: ProjectName,
            ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,
            TeamLead:TeamLead


        };
      
        var htmlToSend = template(replacements);
        var mailOptions = {
            to: email,
            from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
            subject:   SubjectConfigDetails.EmailSubjects.TeamAllocationMailSubject,
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, (err) => {
        }
        );
        if (err) {
            console.log(err);
        }
    }


    );

}






//sample mail start


exports.SendTestMailtoUser = (req, res) => {
  

    var values = req.body;
  
    var server = req.body.values[0].SMTPMailServer;
    var id = req.body.values[0].SMTPMailId;
    var pswd = req.body.values[0].SMTPPassword;
    var prt = req.body.values[0].Port;
    var sender = req.body.values[0].SenderName;
    var emailid = req.body.values[0].ToUser;
    var subj = req.body.values[0].Subject;
    var project = req.body.values[0].ProjectName;
    var sslvalue=req.body.values[0].EnableSSL;
   
    //domain name check 

    var SplitEmail = emailid.substr(emailid.indexOf('@') + 1, emailid.Length);

    var MailDomainLen = Object.keys(HCConfigDetails.Mail.Domains).length;

    var domaincheck = false;
    var DomainCheckFunction = function () {
        for (i = 0; i < MailDomainLen; i++) {


            if (SplitEmail == HCConfigDetails.Mail.Domains[i]) {

                domaincheck = true;
                break;
            }
            else if (SplitEmail != HCConfigDetails.Mail.Domains[i] && i == MailDomainLen - 1) {
                domaincheck = false;
            }
        }
    };
    DomainCheckFunction();

    if (domaincheck == true) 
        {
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {

                if (err) {
                    console.log(err);
                    throw err;
                  
                }
                else {
                    callback(null, html);
                }
            });
        };
         
       if(sslvalue!=true)
       {
        var smtpConfig = {
            host: server,
            port: prt,
            secure:sslvalue,
        
            auth: {
                user: id,
                pass: pswd
            }

        };
      
        var transporter = nodemailer.createTransport(smtpConfig);

        readHTMLFile(__dirname + '/../MailContents/TestMail.html', function (err, html) {
           
            var template = handlebars.compile(html);
            var replacements = {
                EnterpriseTitle: project,
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                to: emailid,
                from: sender + '<' + id + '>',
                subject: subj,
                html: htmlToSend
            };

            transporter.sendMail(mailOptions, (err) => {
            }
            );

            
            if (err) {
                console.log(err);
            }
        }


        );
         res.send("Success");

         }
        else{
             var Errordata = [];
        var data = {};
        data.ErrorMsg = "Server does not support secure connections"
        data.ErrorCode = 'SecureFalse';
        Errordata.push(data);
        return res.json(data);

       }

    }
    else {
    
        var Errordata = [];
        var data = {};
        data.ErrorMsg = ErrorMsgs.Register.HCR004;
        data.ErrorCode = 'HCR004';
        Errordata.push(data);
        return res.json(data);
    }








}
//sample mail end


//Registration Admin Notification



exports.ProjectAllotNotificationMailforAdmin = (req, res) => {
    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var email = req.body.email;


    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {

            if (err) {
                console.log(err);
                throw err;
               
            }
            else {
                callback(null, html);
            }
        });
    };



    var smtpConfig = {
        host: process.env.Mail_host,
        port: process.env.Mail_port,
        auth: {
            user: process.env.Mail_user,
            pass: process.env.Mail_password
        }

    };

    var transporter = nodemailer.createTransport(smtpConfig);

    readHTMLFile(__dirname + '/../MailContents/AdminEmailForNewUser.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
        FirstName: FirstName,
         LastName: LastName,
                        
            ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,


        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            to: email,
            from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
            subject:   SubjectConfigDetails.EmailSubjects.AdminMailForNewUser.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle) + '('+ replacements.FirstName + replacements.LastName + ')', 
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, (err) => {
        }
        );
        if (err) {
            console.log(err);
        }
    }


    );

}






