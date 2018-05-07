"use strict";

function UserInfo(rwgpsApi) {
  // Parameters
  this.rwgpsApi = rwgpsApi;
  
  // Data
  this.email = null;
  this.password = null;
  this.data = null;
  
  const LOGIN_FORM = "#Login";
  const USER_DETAILS = "#UserDetails";
  const LOGIN_ERROR = "#LoginError";

  const _this = this; // Make a copy of object context (this) for closures.

  // Methods
  this.GetCurrentUser = function() {
    console.log("UserInfo.GetCurrentUser");
    console.log("this: " + this + "_this: " + _this);
    let success = function(data, textStatus, jqXHR) {
      console.log("GetCurrentUser success");
      _this.ShowUserInfo(data);
    };
    let error = function(jqXhr, textStatus, errorThrown) {
      console.log("GetCurrentUser error");
      _this.ShowLoginForm();
    };

    _this.rwgpsApi.GetCurrentUser(_this.email, _this.password, success, error);
  };
  
  this.ShowUserInfo = function(data) {
    console.log("UserInfo.ShowUserInfo");
    this.data = data;
    this.rwgpsApi.authToken = data.user.auth_token;
    console.log(data.user.auth_token);
    console.log(data.user.authToken);
    
    let loginError = $(LOGIN_ERROR);
    loginError.hide();
    
    let loginForm = $(LOGIN_FORM);
    loginForm.hide();
    
    let userDetails = $(USER_DETAILS);
    userDetails.html(
      "<p>id: " + this.data.user.id + "<br/>" + 
      "first_name: " + this.data.user.first_name + "<br/>" + 
      "last_name: " + this.data.user.last_name + "<br/>" + 
      "email: " + this.data.user.email + "</p>"       
    );
    userDetails.show();

    $(IB_EVENT_TARGET).trigger(USER_INFO_AVAILABLE, [data]);
  };
  
  this.ShowLoginError = function(textStatus, errorThrown) {
    console.log("UserInfo.ShowLoginError");
    let loginError = $(LOGIN_ERROR);
    loginError.html(
      "<p>textStatus: " + textStatus + "<br/>" +
      "errorThrown: " + errorThrown + "</p>"
    );
    loginError.show();
  }
  
  this.ShowLoginForm = function() {
    console.log("UserInfo.ShowLoginForm");
    let loginForm = $(LOGIN_FORM);
    
    loginForm.submit(function(event) {
      console.log("Login form submit: ");
      console.log(event);
      
      event.preventDefault();
      
      _this.email = $("input[name='email']", loginForm).val();
      _this.password = $("input[name='password']", loginForm).val();
      
      let success = function(data, textStatus, jqXHR) {
        console.log("ShowLoginForm success");
        _this.HideLoginForm()
        _this.ShowUserInfo(data);
      };
      let error = function(jqXhr, textStatus, errorThrown) {
        console.log("ShowLoginForm error");
        _this.ShowLoginError(textStatus, errorThrown);
        _this.ShowLoginForm();
      };

      _this.rwgpsApi.GetCurrentUser(_this.email, _this.password, success, error);
    });
    
    loginForm.show();
  };
  
  this.HideLoginForm = function() {
    console.log("UserInfo.HideLoginForm");
    let loginForm = $(LOGIN_FORM);
    loginForm.hide();
  };
};