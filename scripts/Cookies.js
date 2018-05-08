"use strict";

function Cookies() {
  const PREVIOUS_ROUTE_IDS = "previousRouteIds"
  
  this.GetPreviousRouteIds = function() {
    if (this.previousRouteIds === undefined) {
      this.previousRouteIds = [];
      let prev = GetCookie(PREVIOUS_ROUTE_IDS);
      if (prev != "") {
        let a = prev.split(',');
        for (let i = 0; i < a.length; i++) {
        	this.previousRouteIds.push(parseInt(a[i]));
        }
      }
    }
    return this.previousRouteIds;
  };
  
  this.SetPreviousRouteIds = function(routeIds) {
    this.previousRouteIds = routeIds;
    SetCookie(PREVIOUS_ROUTE_IDS, this.previousRouteIds.toString(), 90);
  };
  
  this.DeletePreviousRouteIds = function() {
    this.previousRouteIds = [];
    DeleteCookie(PREVIOUS_ROUTE_IDS);
  };
}

function SetCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function DeleteCookie(cname) {
  setCookie(cname, "", -1);
}
