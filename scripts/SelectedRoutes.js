"use strict";

function SelectedRoutes() {
  // Data
  this.routes = [];
  
  const ORDERED_ROUTES = "#OrderedRoutes";
  const ORDERED_ROUTES_TABLE = "#OrderedRoutesTable";
  
  const _this = this; // Make a copy of object context (this) for closures.

  $(IB_EVENT_TARGET).on(ROUTES_SELECTED, function(event, data) {
    console.log("RoutesSelected - SelectedRoutes");
    console.log(data);    

    _this.routes = data;    
    _this.ShowOrderedRoutes();
  });
  
  this.ShowOrderedRoutes = function() {
    console.log("SelectedRoutes.ShowOrderedRoutes");
    
    for (let i = 0; i < this.routes.length; i++) {
      this.routes[i][9] = "&uarr;";
      this.routes[i][10] = "&darr;";
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
      { title: "Locality", orderable: false },
      { title: "Up", orderable: false },
      { title: "Down", orderable: false }
    ];
        
    $(ORDERED_ROUTES).show();
    this.routeTable = $(ORDERED_ROUTES_TABLE).DataTable({
      data: this.routes,
      columnDefs: [{targets: "_all", orderable: false}],
      columns: columnHeaders,
      order: [],
      scrollY: "500px",
      scrollCollapse: true,
      paging: false
    });
    
    $(ORDERED_ROUTES_TABLE + " tbody tr").on( "click", "td:eq(8)", function () {
      //console.log("cell.onclick up");
      let index = _this.routeTable.cell(this).index();
      //console.log(index);
      if (index.row > 0) {
        let row0 = _this.routeTable.row(index.row);
        //console.log(row0.data());
        let row1 = _this.routeTable.row(index.row - 1);
        //console.log(row1.data());
        let temp = row0.data();
        row0.data(row1.data());
        row1.data(temp);
        _this.routeTable.draw(false);
      }
    } );
    
    $(ORDERED_ROUTES_TABLE + " tbody tr").on( "click", "td:eq(9)", function () {
      //console.log("cell.onclick down");
      let index = _this.routeTable.cell(this).index();
      //console.log(index);
      if (index.row < _this.routes.length - 1) {
        let row0 = _this.routeTable.row(index.row);
        //console.log(row0.data());
        let row1 = _this.routeTable.row(index.row + 1);
        //console.log(row1.data());
        let temp = row0.data();
        row0.data(row1.data());
        row1.data(temp);
        _this.routeTable.draw(false);
      }
    } );
    
    $(SHOW_ITINERARY).on("click", function() {
      //console.log("Show Itinerary clicked.");
      $(ORDERED_ROUTES).hide();
      $(SHOW_ITINERARY).prop("disabled", true);
      let data = _this.routeTable.rows().data();
      //console.log(data);
      $(IB_EVENT_TARGET).trigger(GENERATE_ITINERARY, [data]);
    });
  };
};