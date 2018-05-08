"use strict";

// Events
const USER_INFO_AVAILABLE = "ib:userInfoAvailable";
const ROUTES_SELECTED = "ib:routesSelected";
const GENERATE_ITINERARY = "ib:generateItinerary";

// Event targets
const IB_EVENT_TARGET = "#ItineraryBuilder";

const USE_PREVIOUS = "#UsePrevious";
const SELECT_ROUTES = "#SelectRoutes";
const SHOW_ITINERARY = "#ShowItinerary";

function RwgpsApi() {
  this.authToken = null;
  
  this.BuildUrl = function(command, args) {
    const RWGPS_APIKEY = "0be4b619";
    const RWGPS_VERSION = "2";
    
    args.apikey = RWGPS_APIKEY;
    args.version = RWGPS_VERSION;
    if (this.authToken !== null) {
      args.auth_token = this.authToken;
    }
  
    return "https://ridewithgps.com/" + command + "?" + $.param(args);
  };
  
  this.SendCommand = function(command, args, success, error) {
    $.ajax({
      url: this.BuildUrl(command, args),
      dataType: "jsonp",
      success: success,
      error: (error !== null) ? error : function(jqXhr, textStatus, errorThrown) {
        alert(textStatus + "\n" + errorThrown);
      }
    });
  };
  
  this.GetCurrentUser = function(email, password, success, error) {
    let command = "users/current.json";
    let args = {};
    if ((typeof email !== 'undefined') && (typeof password !== 'undefined')) {
      args.email = email;
      args.password = password;
    }
    this.SendCommand(command, args, success, error);
  };
  
  this.GetUserRoutes = function(userId, limit, offset, success, error) {
    let command = "users/" + userId + "/routes.json";
    let args = {
      limit: limit,
      offset: offset
    };
    this.SendCommand(command, args, success, error);
  }
  
  this.GetRoute = function(routeId, success, error) {
    let command = "routes/" + routeId + ".json";
    let args = {};
    this.SendCommand(command, args, success, error);
  }
};
