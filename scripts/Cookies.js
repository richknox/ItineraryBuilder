"use strict";

function Cookies() {
  const PREVIOUS_ROUTE_IDS = "previousRouteIds";
  const THRESHOLD = "threshold";
  const FILTER = "filter";

  this.GetCookies = function() {
    if (this.cookies === undefined) {
      this.cookies = {};
      let cs = decodeURIComponent(document.cookie);
      let ca = cs.split(';');
      for (let i = 0; i < ca.length; i++) {
      	let [n, v] = ca[i].split("=");
        this.cookies[n.trim()] = v.trim();
      }
    }
    
    return this.cookies;
  };
  
  this.GetCookie = function(cname) {
    return this.GetCookies()[cname];
  };
  
  this.SetCookie = function(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";

    delete this.cookies;
  };

  this.DeleteCookie = function(cname) {
    setCookie(cname, "", -1);
  };

  this.GetRouteIds = function() {
    let routeIds = [];
    let prev = this.GetCookie(PREVIOUS_ROUTE_IDS);
    if (prev != "") {
      let a = prev.split(',');
      for (let i = 0; i < a.length; i++) {
      	routeIds.push(parseInt(a[i]));
      }
    }
    
    return routeIds;
  };
  
  this.SetRouteIds = function(routeIds) {
    this.SetCookie(PREVIOUS_ROUTE_IDS, routeIds.toString(), 90);
  };
  
  this.GetThreshold = function() {
    return parseInt(this.GetCookie(THRESHOLD));
  };
  
  this.SetThreshold = function(value) {
    this.SetCookie(THRESHOLD, value);
  };
  
  this.GetFilter = function() {
    return parseInt(this.GetCookie(FILTER));
  };
  
  this.SetFilter = function(value) {
    this.SetCookie(FILTER, value);
  }
}

