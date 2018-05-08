"use strict";

function Cookies() {
  const PREVIOUS_ROUTE_IDS = "previousRouteIds"
  
  this.getPreviousRouteIds = function() {
    if (this.previousRouteIds === undefined) {
      this.previousRouteIds = [];
      let prev = getCookie(PREVIOUS_ROUTE_IDS);
      if (prev != "") {
        let a = prev.split(',');
        for (let i = 0; i < a.length; i++) {
        	this.previousRouteIds.push(parseInt(a[i]));
        }
      }
    }
    return this.previousRouteIds;
  };
  
  this.setPreviousRouteIds = function(routeIds) {
    this.previousRouteIds = routeIds;
    setCookie(PREVIOUS_ROUTE_IDS, this.previousRouteIds.toString(), 90);
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
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

