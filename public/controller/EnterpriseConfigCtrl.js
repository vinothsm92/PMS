 
var count = 0;
var ImageName = "";

app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
      $httpProvider.defaults.cache = false;
      if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
      }
      $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
}]);

app.run(function (editableOptions) {
      editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});


app.controller('EnterpriseConfigController', ['$http', '$scope', '$window', '$filter', 'Upload', '$cookieStore', '$notify', 'StoreService',
      function ($http, $scope, $window, $filter, Upload, $cookieStore, $notify, StoreService) {

            var BindCountry = function (countryid) {
                  var CheckElevator = countryid;
                  var objSelect = document.getElementsByName("BuildingName")[0];
                  objSelect.value = CheckElevator;

            }
            var BindState = function (stateid) {
                  var CheckElevator = stateid;
                  var objSelect = document.getElementsByName("StateIDName")[0];
                  objSelect.value = CheckElevator;
            }


            //Get Enterprise configuration values from EnterPriseconfiguration.json file
            var bindEnterpriseInfo = function () {
                  $http.get('/PMSConfig/EnterPriseconfiguration.json').then(function (response) {
                        $scope.EnterpriseconfigValues = response.data.EnterpriseConfiguration;

                        $scope.State = response.data.EnterpriseConfiguration.State;
                        var SelectStream = [];
                        SelectStream = $filter('filter')($scope.ViewCountryDetails, { CountryName: $scope.Country });
                        SelectStream[0]._id;
                        BindCountry(SelectStream[0]._id);
                        var SelectStream1 = [];
                        SelectStream1 = $filter('filter')($scope.selectStateDetails, { StateName: $scope.State });
                        SelectStream1[0]._id;
                        BindState(SelectStream1[0]._id);

                        $scope.ApplicationTitle = response.data.EnterpriseConfiguration.ApplicationTitle;
                        $scope.ProjectName = $scope.ApplicationTitle;

                        $scope.EnterpriseLogo = response.data.EnterpriseConfiguration.EnterpriseLogo;
                        $scope.EnterpriseLogo2 = response.data.EnterpriseConfiguration.EnterpriseLogo;
                      
                        $scope.logowidth2 = response.data.EnterpriseConfiguration.logowidth;
                        $scope.logoheight2 = response.data.EnterpriseConfiguration.logoheight;


                  });
            }


            var bindEmailSettings = function () {
                  //SMTP Mail Configuration 
                  $http.get('/PMSConfig/MailConfiguration.json').then(function (response) {


                        $scope.mailconfigServer = response.data.SMTPMailConfiguration;
                      
                        $scope.ssl = response.data.SMTPMailConfiguration.EnableSSL;

                        if ($scope.ssl == "1") {
                              $scope.mailconfigServer.EnableSSL = true;
                        }
                        else {
                              $scope.mailconfigServer.EnableSSL = false;
                        }



                  });
            }
            var username = $cookieStore.get('LoggedinUser');
              
            var refreshsUpdate = function () {
                  $http.get('/user/' + username).then(function (response) {
                        var RoleID = response.data[0].Role;

                        $http.get('/role/' + RoleID).then(function (response) {
                              $scope.role = response.data;
                              var access = $scope.role[0].UIList[3].View;
                              if (access == true) {
                                    refresh();
                              }
                              else {
                                    $window.location.href = '/Error.html'
                              }
                        })
                  });
            }
            var refresh = function () {
                  
                  
                                    bindEnterpriseInfo();
                  
                                    bindEmailSettings();
                  
                                    getEmailContents();
                                    //get Email Subjects from EmailSubjects.json
                  
                                    $http.get('/PMSConfig/EmailSubjects.json').then(function (response) 
                                    {
                  
                                       
                                          $scope.subject1 = response.data.EmailSubjects.RegistrationMailSubject;
                                      
                                          $scope.subject2 = response.data.EmailSubjects.ApprovedMailSubject;
                                          $scope.subject3 = response.data.EmailSubjects.RejectedMailSubject;
                                          $scope.subject4 = response.data.EmailSubjects.ForgetPasswordSubject;
                                          $scope.subject5 = response.data.EmailSubjects.TestMailSubject;
                                          $scope.subject6 = response.data.EmailSubjects.TeamAllocationMailSubject;
                                          $scope.subject7 = response.data.EmailSubjects.ProjectAllocationMailSubject;
                                          $scope.subject8 = response.data.EmailSubjects.AdminMailForNewUserSubject;
                                          
                                    });
                  
                                    //SMTP Mail Configuration 
                                    $http.get('/PMSConfig/MailContentConfiguration.json').then(function (response) {
                                          $scope.emailMessages = response.data.EmailMessages;
                                         
                                          $scope.MainSubjects = $scope.subject1;
                                          $scope.testmailsubject = $scope.ProjectName + ' -' + $scope.subject5;
                                    });
                  
                  
                  
                  
                                    //get html page 
                                    $http.get('/MailContents/registerconfirmationmail.html').then(function (response, data) {
                                          $scope.content0 = response.data;
                                          $scope.EmailContent = $scope.content0;
                  
                                    });
                  
                  
                  
                              };
                  

                              var getEmailContents =function()
                              {
                                      ;
                                  $http.get('/MailContents/EmailForApprovedUser.html').then(function (response, data) 
                                  {
                                        $scope.content1 = response.data;
                                  });
                  
                                  $http.get('/MailContents/EmailForRejectedUser.html').then(function (response, data) {
                                        $scope.content2 = response.data;
                                  });
                  
                                  $http.get('/MailContents/forgotMailContent.html').then(function (response, data) {
                                        $scope.content3 = response.data;
                                  });
                  
                  
                                  $http.get('/MailContents/TestMail.html').then(function (response, data) {
                                        $scope.content4 = response.data;
                                  });
                  
                  
                                  $http.get('/MailContents/TeamAllocation.html').then(function (response, data) {
                                        $scope.content5 = response.data;
                                  });
                                  $http.get('/MailContents/EmailForProjectAllocation.html').then(function (response, data) {
                                        $scope.content6 = response.data;
                                  });
                                  $http.get('/MailContents/AdminEmailForNewUser.html').then(function (response, data) {
                                    $scope.content7 = response.data;
                              });
                              }

            //bind email subject based on the email message

            $scope.EmailMessageChange = function () 
            {
                  getEmailContents();
                 
                  var val = document.getElementById("EmailMessageid");
                  var emailmsg = val.options[val.selectedIndex].value;


                  $http.get('/PMSConfig/EmailSubjects.json').then(function (response) 
                  {

                        $scope.subject1 = response.data.EmailSubjects.RegistrationMailSubject;
                     
                        $scope.subject2 = response.data.EmailSubjects.ApprovedMailSubject;
                        $scope.subject3 = response.data.EmailSubjects.RejectedMailSubject;
                        $scope.subject4 = response.data.EmailSubjects.ForgetPasswordSubject;
                        $scope.subject5 = response.data.EmailSubjects.TestMailSubject;
                        $scope.subject6 = response.data.EmailSubjects.TeamAllocationMailSubject;
                        $scope.subject7 = response.data.EmailSubjects.ProjectAllocationMailSubject;
                        $scope.subject8 = response.data.EmailSubjects.AdminMailForNewUserSubject;
                  });
                 
                
                         if (emailmsg == "1") {
                            
                              $scope.MainSubjects = $scope.subject1;
                              $scope.EmailContent = $scope.content0;
                        }
                        if (emailmsg == "2") {
                              $scope.MainSubjects = $scope.subject2;
                              $scope.EmailContent = $scope.content1;
                        }
                        if (emailmsg == "3") {
                              $scope.MainSubjects = $scope.subject3;
                              
                              $scope.EmailContent = $scope.content2;
                        }
                        if (emailmsg == "4") {
                              $scope.MainSubjects = $scope.subject4;
                              $scope.EmailContent = $scope.content3;
                        }
                        if (emailmsg == "5") {
                              $scope.MainSubjects = $scope.subject5;
                              $scope.EmailContent = $scope.content4;
                        }
                        if (emailmsg == "6") {
                              $scope.MainSubjects = $scope.subject6;
                              $scope.EmailContent = $scope.content5;
                        }
                        if (emailmsg == "7") {
                              $scope.MainSubjects = $scope.subject7;
                              $scope.EmailContent = $scope.content6;
                        }
                        if (emailmsg == "8") {
                              $scope.MainSubjects = $scope.subject8;
                              $scope.EmailContent = $scope.content7;
                        }

           


            }



            var imageformat = '';
            var vm = this;
            $scope.uploadFile = function (file) { //function to call on form submit
                  LogoUploads(file);

            }


            var LogoUploads = function (file) {

                  if (file != undefined) {
                        Upload.upload({
                              url: '/LogoUploads', //webAPI exposed to upload the file
                              data: { file: file } //pass file as data, should be user ng-model
                        }).then(function (resp) { //upload function returns a promise
                             
                              $scope.FileName = resp.config.data.file.name;
                              imageformat = resp.config.data.file.type.split('/');
                              if (imageformat[1] == "jpeg") {
                                    imageformat[1] = "jpg";
                              }
                              if (imageformat[1] == "png") {
                                    imageformat[1] = "png";
                              }
                          
                              ImageName = resp.data;
                              $scope.imagename = ImageName;

                              if ($scope.FileName != "" && $scope.FileName != undefined) {
                                    UpdateEnterpriseInfo();

                              }
                              else {

                              }


                        });
                  }
                  else {
                        UpdateEnterpriseInfo();
                  }
            }


            //update enterprise info 


            var UpdateEnterpriseInfo = function () {

                  var enterpriseName = document.getElementById('enterpriseid').value;
                  var legalName = document.getElementById('legalnameid').value;
                  var address = document.getElementById('addressid').value;
                  var website = document.getElementById('websiteid').value;
                  var e = document.getElementById("Countryid");
                  var country = e.options[e.selectedIndex].text;
                  var e1 = document.getElementById("Stateid");
                  var state = e1.options[e1.selectedIndex].text;
                  var county = document.getElementById('countyid').value;
                  var email = document.getElementById('emailid').value;
                  var phone = document.getElementById('phoneid').value;
                  var fax = document.getElementById('faxid').value;
                  var title = document.getElementById('titleid').value;

               var logouploadedimage =  document.getElementById('imageId');
                  var logowidth = logouploadedimage.width;
                 var logoheight = logouploadedimage.height;

                  var logowidthXheight = "width:"+logouploadedimage.width+"px;height:"+logouploadedimage.height+"px;float:left;";





                  if ($scope.imagename != "" && $scope.imagename != undefined) {
                        $scope.EnterpriseLogo = '.' + '/' + 'LogoUploads' + '/' + $scope.FileName;
                  }
                  else {

                        $scope.EnterpriseLogo = $scope.EnterpriseLogo2;
                        logowidth =$scope.logowidth2 ;
                        logoheight=   $scope.logoheight2  ;

                  }

                  $scope.EnterpriseInfoValues = {
                        "EnterpriseConfiguration": {
                              "EnterpriseName": enterpriseName,
                              "LegalName": legalName,
                              "Address": address,
                              "Website": website,
                              "Country": country,
                              "State": state,
                              "County": county,
                              "Email": email,
                              "Phone": phone,
                              "Fax": fax,
                              "ApplicationTitle": title,
                              "EnterpriseLogo": $scope.EnterpriseLogo,
                         
                             "logowidth":logowidth,
                              "logoheight":logoheight
                        }
                  };

                  var infoValue = $scope.EnterpriseInfoValues;
                  $http.put('/updateEnterPriseInfojson/', { "value": infoValue }).then(function (response) {

                        $scope.ServerResponse1 = response.config.data;
                      
                        $notify.success('Success', ' Enterprise  Info updated successfully');
                      
                        document.getElementById('rangeId').value=0;
                  });



            };



          
            //Resize image
            var ranger = document.getElementById('rangeId');      
            image = document.getElementById('imageId');
           width = image.width;
            height = image.height;
         
            ranger.onchange = function () {
                  ;
              
               
                  image.width = width * (ranger.value / 100);
                  image.height =height * (ranger.value / 100);
            }


    
            $scope.UpdateEmailSettings = function () {
  ;
                  var SMTPServer = document.getElementById('smtpserverid').value;
                  var SMTPEmail = document.getElementById('smtpEmailid').value;
                  var SMTPPassword = document.getElementById('smtppasswordid').value;
                  var Port = document.getElementById('portid').value;
                  var Sender = document.getElementById('senderid').value;
                  var Ssl = document.getElementById('sslid').checked;


                  if (Ssl == true) {
                        Ssl = "1";
                  }
                  else {
                        Ssl = "0";
                  }
                  var emailcontentinput = document.getElementById('EmailcontentId').innerHTML;
                  var result = "<html>" + "\n" + "<body>" + "\n" + emailcontentinput + "\n" + "</body>" + "\n" + "</html>"
                  $scope.SMTPMailConfigurationValues =
                        {
                              "SMTPMailConfiguration": {
                                    "SMTPMailServer": SMTPServer,
                                    "SMTPemailId": SMTPEmail,
                                    "SMTPpassword": SMTPPassword,
                                    "PORT": Port,
                                    "SenderName": Sender,
                                    "EnableSSL": Ssl

                              }
                        };

                  var SMTPEmailValues = $scope.SMTPMailConfigurationValues;
                  $http.put('/updateSMTPConfigurationjson/', { "value": SMTPEmailValues }).then(function (response) {

                        $scope.ServerResponse2 = response.config.data;
                        $notify.success('Success', ' Enterprise email settings updated successfully');

                  });

                  var EmailMessagevalues = document.getElementById("EmailMessageid");
                  var Selectedemailmsg = EmailMessagevalues.options[EmailMessagevalues.selectedIndex].value;
                

                  if (Selectedemailmsg == "1") {
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": Emailsubjectupdate,
                                          "ApprovedMailSubject": $scope.subject2,
                                          "RejectedMailSubject": $scope.subject3,
                                          "ForgetPasswordSubject": $scope.subject4,
                                          "TestMailSubject": $scope.subject5,
                                          "TeamAllocationMailSubject": $scope.subject6,
                                          "ProjectAllocationMailSubject": $scope.subject7,
                                          "AdminMailForNewUserSubject": $scope.subject8,

                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;

                        $http.put('/registerConfirmationMailContent', { "result": result }).then(function (response) {
                              $scope.registerconfirmation = response.data;
                        });
                  }
                  if (Selectedemailmsg == "2") {
                        $http.put('/ApprovedUserMailContentUpdate', { "result": result }).then(function (response) {
                              $scope.approvedMail = response.data;
                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": $scope.subject1,
                                          "ApprovedMailSubject": Emailsubjectupdate,
                                          "RejectedMailSubject": $scope.subject3,
                                          "ForgetPasswordSubject": $scope.subject4,
                                          "TestMailSubject": $scope.subject5,
                                          "TeamAllocationMailSubject": $scope.subject6,
                                          "ProjectAllocationMailSubject": $scope.subject7,
                                          "AdminMailForNewUserSubject": $scope.subject8,
                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;


                  }
                  if (Selectedemailmsg == "3") {
                        $http.put('/RejectedUserMailContentUpdate', { "result": result }).then(function (response) {
                              $scope.rejectedMail = response.data;
                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": $scope.subject1,
                                          "ApprovedMailSubject": $scope.subject2,
                                          "RejectedMailSubject": Emailsubjectupdate,
                                          "ForgetPasswordSubject": $scope.subject4,
                                          "TestMailSubject": $scope.subject5,
                                          "TeamAllocationMailSubject": $scope.subject6,
                                          "ProjectAllocationMailSubject": $scope.subject7,
                                          "AdminMailForNewUserSubject": $scope.subject8,
                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;
                  }
                  if (Selectedemailmsg == "4") {
                        $http.put('/forgotMailContentUpdate', { "result": result }).then(function (response) {
                              $scope.forgetMail = response.data;
                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": $scope.subject1,
                                          "ApprovedMailSubject": $scope.subject2,
                                          "RejectedMailSubject": $scope.subject3,
                                          "ForgetPasswordSubject": Emailsubjectupdate,
                                          "TestMailSubject": $scope.subject5,
                                          "TeamAllocationMailSubject": $scope.subject6,
                                          "ProjectAllocationMailSubject": $scope.subject7,
                                          "AdminMailForNewUserSubject": $scope.subject8,
                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;
                  }


                  if (Selectedemailmsg == "5") {
                        $http.put('/EmailContentUpdateForTestMail', { "result": result }).then(function (response) 
                        
                        {
                              $scope.ServerResponse4 = response.data;



                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": $scope.subject1,
                                          "ApprovedMailSubject": $scope.subject2,
                                          "RejectedMailSubject": $scope.subject3,
                                          "ForgetPasswordSubject": $scope.subject4,
                                          "TestMailSubject": Emailsubjectupdate,
                                          "TeamAllocationMailSubject": $scope.subject6,
                                          "ProjectAllocationMailSubject": $scope.subject7,
                                          "AdminMailForNewUserSubject": $scope.subject8,
                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;
                  }

                  if (Selectedemailmsg == "6") {

                        $http.put('/TeamAllocationMailContentUpdate', { "result": result }).then(function (response) {
                              $scope.TeamAllocationMail = response.data;
                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": $scope.subject1,
                                          "ApprovedMailSubject": $scope.subject2,
                                          "RejectedMailSubject": $scope.subject3,
                                          "ForgetPasswordSubject": $scope.subject4,
                                          "TestMailSubject": $scope.subject5,
                                          "TeamAllocationMailSubject": Emailsubjectupdate,
                                          "ProjectAllocationMailSubject": $scope.subject7,
                                          "AdminMailForNewUserSubject": $scope.subject8,
                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;
                  }
                  if (Selectedemailmsg == "7") {
                        $http.put('/ProjectAllocationMailContentUpdate', { "result": result }).then(function (response) {
                              $scope.ProjectAllocation = response.data;
                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                    {

                                          "RegistrationMailSubject": $scope.subject1,
                                          "ApprovedMailSubject": $scope.subject2,
                                          "RejectedMailSubject": $scope.subject3,
                                          "ForgetPasswordSubject": $scope.subject4,
                                          "TestMailSubject": $scope.subject5,
                                          "TeamAllocationMailSubject": $scope.subject6,
                                          "ProjectAllocationMailSubject": Emailsubjectupdate,
                                          "AdminMailForNewUserSubject": $scope.subject8,
                                    }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;
                  }
                  if (Selectedemailmsg == "8") {
                        $http.put('/AdminEmailForNewUserMailContentUpdate', { "result": result }).then(function (response) {
                              $scope.AdminEmailForNewUser = response.data;
                        });
                        var Emailsubjectupdate = document.getElementById('EmailSubjectId').innerText;
                        $scope.EMailSubjectsValues =
                              {
                                    "EmailSubjects":
                                          {

                                                "RegistrationMailSubject": $scope.subject1,
                                                "ApprovedMailSubject": $scope.subject2,
                                                "RejectedMailSubject": $scope.subject3,
                                                "ForgetPasswordSubject": $scope.subject4,
                                                "TestMailSubject": $scope.subject5,
                                                "TeamAllocationMailSubject": $scope.subject6,
                                                "ProjectAllocationMailSubject": $scope.subject7,
                                                 "AdminMailForNewUserSubject": Emailsubjectupdate,
                                          }

                              };
                        var MailSubjectInputs = $scope.EMailSubjectsValues;
                  }

                  $http.put('/updateEmailSubjectsjson/', { "value": MailSubjectInputs }).then(function (response) {

                        $scope.mailsubjectsupdate = response.config.data;
                      

                  });


            }
            $scope.thumbnailshow = function () {
                  return $scope.VisibleUpload = true;
            }


            var toUser = '';
            $scope.ChangeMail = function (data) {
                  if (data != "" || data != undefined) {
                        toUser = data;
                      
                  }



            }
           
            $scope.TestMail = function () {

                    
                  $scope.ErrorMessageShown = "";
                  $scope.ErrorMessageShown2 = "";

                  var Sslvalue = document.getElementById('sslid').checked;

                 

                  if (toUser != "") {


                        var SMTPMailServer = $scope.mailconfigServer.SMTPMailServer;
                        var SMTPMailId = $scope.mailconfigServer.SMTPemailId;
                        var SMTPPassword = $scope.mailconfigServer.SMTPpassword;
                        var Port = $scope.mailconfigServer.PORT;
                        var SenderName = $scope.mailconfigServer.SenderName;
                        var EnableSSL = $scope.mailconfigServer.EnableSSL;

                        var Subject = $scope.testmailsubject;
                        var Project = $scope.ProjectName;
                        $scope.EmailConfigInputs = [];
                        var inputValues = {};
                        inputValues.SMTPMailServer = SMTPMailServer;
                        inputValues.SMTPMailId = SMTPMailId;
                        inputValues.SMTPPassword = SMTPPassword;
                        inputValues.Port = Port;
                        inputValues.ToUser = toUser;

                        inputValues.SenderName = SenderName;
                        inputValues.EnableSSL = Sslvalue;
                        inputValues.Subject = Subject;
                        inputValues.ProjectName = Project;

                        $scope.EmailConfigInputs.push(inputValues);


                        $http.put('/SendMail', { "values": $scope.EmailConfigInputs }).then(function (response) {
                              if (response.data.ErrorCode == "HCR004") {
                                    $scope.ErrorClass = "red"
                                    $scope.ErrorMessageShown = response.data.ErrorMsg;

                                    refresh();
                              }
                              if (response.data == "Success") {
                                    $scope.ErrorMessageShown = "";
                                    $scope.ErrorClass = "green"
                                    $scope.ErrorMessageShown = "Test Mail sent successfully";
                                    setTimeout(function () {
                                          $scope.ErrorMessageShown = "";
                                          $scope.$digest();
                                    }, 2000);


                                    refresh();

                              }

                              if (response.data.ErrorCode == "SecureFalse") {
                                 

                                    $notify.warning('warning', "Server does not support secure connections");
                                    refresh();
                              }

                        });
                     

                        document.getElementById("lblTestmailId").value = "";
                        toUser = "";
                  }
                  else {
                         if ($scope.toggle == true) {
                        $scope.toggle = false;

                  }
                  else if ($scope.toggle == false) {
                        $scope.toggle = true;
                  }

                  if ($scope.toggle == undefined) {
                        $scope.toggle = true;
                  }
                     
                        $scope.ErrorClass2 = "red"
                      
                        $scope.ErrorMessageShown2 = "Please enter the Email Id";
                        $scope.ErrorMessageShown = "";
                        $scope.ErrorMessageShown2 = "";


                  }


            }




            //clear email settings info

            $scope.ClearAllEmailinputs = function () {
                  $scope.mailconfigServer = '';
                  $scope.Subjects = '';
                  $scope.EmailContent = '';
                  $scope.ToMailID = '';
                  $scope.toggle = false;

                  refresh();
            }

            $scope.CancelClick = function () 
            {
                  $scope.EnterpriseconfigValues = '';
                
                  document.getElementById("rangeId").value = "0";
                  $scope.file='';
            
                  refresh();
            }

            //Select Country Code

            $scope.InsertCountryChange = function (CountryID) {


                  $scope.ViewStateDetail = "";

                  $http.get('/ViewStateDetails/' + CountryID).then(function (response) {
                        $scope.ViewInsertStateDetails = response.data;
                  });
            };


            var countryFunction = function () {

                  $http.get('/ViewCountryDetails').then(function (response) {
                        $scope.ViewCountryDetails = response.data;
                  });

            };
            countryFunction();


            //Select state Code
            var StateFunction = function () {

                  $http.get('/PMSConfig/EnterPriseconfiguration.json').then(function (response) {
                        $scope.Country = response.data.EnterpriseConfiguration.Country;

                        $http.get('/SelectStateDetails').then(function (response) {
                              $scope.selectStateDetails = response.data;

                              var SelectStream = [];
                              SelectStream = $filter('filter')($scope.ViewCountryDetails, { CountryName: $scope.Country });
                              SelectStream[0]._id;


                              var CountryID = SelectStream[0]._id;
                              $http.get('/ViewStateDetails/' + CountryID).then(function (response) {
                                    $scope.ViewInsertStateDetails = response.data;

                              });
                        });
                  });
            };

            StateFunction();



            //Facility DropDown Change Event

            $scope.$watch('value.storedObject', function (newVal) {

                  if (newVal !== '') {

                        FacilityService = newVal;

                  }
            });

            //Facility DropDown Change Event

            $scope.$watch('value.storedObject', function (newVal) {

                  if (newVal !== '') {

                        FacilityService = newVal;

                  }
            });

            $scope.value = StoreService;
            FacilityService = $cookieStore.get('FacilityID1');

            var username = $cookieStore.get('LoggedinUser');
            var refreshsUpdate = function () {
                  $http.get('/user/' + username).then(function (response) {
                        var RoleID = response.data[0].Role;

                        $http.get('/role/' + RoleID).then(function (response) {
                              $scope.role = response.data;
                              var access = $scope.role[0].UIList[3].View;
                              if (access == true) {

                                    refresh();
                              }
                              else {
                                    $window.location.href = '/Error.html'
                              }
                        })
                  });
            }


            var logincheck = function () {
                  $http.get('loggedin').success(function (user) {

                        // Authenticated
                        if (user != '0') {
                              $scope.viewaccesspage = true;
                              refreshsUpdate();
                              return;

                        }
                        // Not Authenticated
                        else {
                              $scope.viewaccesspage = false;
                              $window.location.href = '/';
                        }
                  });
            };

            logincheck();
      }]);


app.controller('TabController', function () {
      this.tab = 1;

      this.setTab = function (tabId) {
            this.tab = tabId;
      };

      this.isSet = function (tabId) {
            return this.tab === tabId;
      };
});
