"use strict";

function UserRoutes(rwgpsApi) {
  // Parameters
  this.rwgpsApi = rwgpsApi;
  
  // Data
  this.routes = [];
  
  const LIMIT = 1000;
  const FULL_ROUTES = "#FullRoutes";
  const FULL_ROUTES_TABLE = "#FullRoutesTable";
  
  const _this = this; // Make a copy of object context (this) for closures.

  $(IB_EVENT_TARGET).on(USER_INFO_AVAILABLE, function(event, data) {
    console.log("UserInfoAvailable - UserRoutes");
    
    _this.userId = data.user.id;    
    _this.GetUserRoutes();
  });
  
  this.GetUserRoutes = function() {
    console.log("UserRoutes.GetUserRoutes");
    
    let success = function(data, textStatus, jqXHR) {
      $.merge(_this.routes, data.results);
      if (data.results_count > _this.routes.length) {
        _this.GetUserRoutes();
      } else {
        _this.ShowUserRoutes();
      }
    };
    let error = function(jqXhr, textStatus, errorThrown) {
      alert("Failed to get user routes.");
    };

    this.rwgpsApi.GetUserRoutes(this.userId, LIMIT, this.routes.length, success, error);
  };
  
  this.ShowUserRoutes = function() {
    this.routeTableRows = [];
    for (let i = 0; i < this.routes.length; i++) {
      this.routeTableRows.push([
        this.routes[i].id, 
        this.routes[i].name, 
        this.routes[i].description, 
        this.routes[i].created_at, 
        this.routes[i].updated_at, 
        MetersToMiles(this.routes[i].distance).toFixed(1), 
        MetersToFeet(this.routes[i].elevation_gain).toFixed(0), 
        MetersToFeet(this.routes[i].elevation_loss).toFixed(0), 
        this.routes[i].locality + ", " + this.routes[i].administrative_area + ", " + this.routes[i].country_code
      ]);
    }

    let columnHeaders = [
      { title: "ID" },
      { title: "Name" },
      { title: "Description", width: "20%", orderable: false, visible: false },
      { title: "Created" },
      { title: "Updated" },
      { title: "Distance (miles)", orderable: false },
      { title: "Elevation Gain (feet)", orderable: false },
      { title: "Elevation Loss (feet)", orderable: false },
      { title: "Locality", orderable: false }
    ];
        
    $(FULL_ROUTES).show();
    this.routeTable = $(FULL_ROUTES_TABLE).DataTable({
      data: this.routeTableRows,
      columns: columnHeaders,
      order: [[3, "desc"]],
      scrollY: "500px",
      scrollCollapse: true,
      paging: false
    });
    
    $(FULL_ROUTES_TABLE + " tbody").on( "click", "tr", function () {
        $(this).toggleClass("selected");
    } );
    
    console.log("Look for previous route IDs cookie.");
    let cookies = new Cookies();
    let previousRouteIds = cookies.GetPreviousRouteIds();
    let valid = (previousRouteIds.length > 0);
    for (let i = 0; valid && i < previousRouteIds.length; i++) {
      let prevId = previousRouteIds[i];
      let found = false;
      for (let j = 0; !found && j < this.routes.length; j++) {
        found = (prevId == this.routes[j].id);
      }
      valid = found;
    }
    console.log(valid);
    console.log(previousRouteIds);
    if (valid) {
      $(USE_PREVIOUS).on("click", function() {
        $(FULL_ROUTES).hide();
        $(USE_PREVIOUS).button("disable");
        $(IB_EVENT_TARGET).trigger(GENERATE_ITINERARY, [previousRouteIds]);
      });
      $(USE_PREVIOUS).button("enable");
    }
    
    console.log("Install Select Routes handler.");
    $(SELECT_ROUTES).on("click", function() {
      console.log("Select Routes clicked.");
      $(FULL_ROUTES).hide();
      $(SELECT_ROUTES).button("disable");
      $(USE_PREVIOUS).button("disable");
      let data = _this.routeTable.rows('.selected').data();
      console.log(data);
      $(IB_EVENT_TARGET).trigger(ROUTES_SELECTED, [data]);
    });
    console.log("Enable Select Routes.");
    $(SELECT_ROUTES).button("enable");
  };
};