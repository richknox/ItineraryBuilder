"use strict";

function Itinerary(rwgpsApi) {
  // Parameters
  this.rwgpsApi = rwgpsApi;
  
  // Data
  this.selectedRoutes = [];
  this.routeData = [];
  this.trackPointsArray = [];
  this.itinerary = [];
  
  const ITINERARY = "#Itinerary";
  const ITINERARY_TABLE = "#ItineraryTable";
  
  const THRESHOLD_SLIDER = "#ThresholdSlider";
  const FILTER_SLIDER = "#FilterSlider";
  const RECALCULATE = "#Recalculate";
  
  // Column indexes
	const SEGMENT = 0;
	const INDEX = 1;
	const NAME = 2;
	const DESCRIPTION = 3;
	const LATITUDE = 4;
	const LONGITUDE = 5;
	const CLOSEST_LATITUDE = 6;
	const CLOSEST_LONGITUDE = 7;
	const DELTA = 8;
	const DISTANCE = 9;
	const ELEVATION_GAIN = 10;
	const ELEVATION_LOSS = 11;
  
  const _this = this; // Make a copy of object context (this) for closures.

  $(IB_EVENT_TARGET).on(GENERATE_ITINERARY, function(event, data) {
    console.log("GenerateItinerary - Itinerary");
    
    _this.selectedRoutes = data;
    
    if (_this.selectedRoutes.length > 0) {
      let cookies = new Cookies();
      cookies.SetRouteIds(_this.selectedRoutes);
    
      _this.InitControls();
      _this.GetRoutes();
    } else {
      alert("No itinerary routes.");
    }
  });
  
  this.InitControls = function() {
    let cookies = new Cookies();
    
    let thresholdHandle = $( "#ThresholdHandle" );
    $(THRESHOLD_SLIDER).slider({
      create: function() {
        thresholdHandle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        thresholdHandle.text( ui.value );
      },
      max: 20,
      value: cookies.GetThreshold()
    });
    
    let filterHandle = $( "#FilterHandle" );
    $(FILTER_SLIDER).slider({
      create: function() {
        filterHandle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        filterHandle.text( ui.value );
      },
      max: 10,
      value: cookies.GetFilter()
    });
    
    $(RECALCULATE).on("click", function() {
      cookies.SetThreshold($(THRESHOLD_SLIDER).slider("value"));
      cookies.SetFilter($(FILTER_SLIDER).slider("value"));
      _this.GenerateItinerary();
    });
    $(RECALCULATE).button("enable");
  };
  
  this.GetRoutes = function() {
    $("body").css("cursor", "progress");
    let i = this.routeData.length;
    let routeId = this.selectedRoutes[i];
    console.log("Iteration: " + i + ", Route ID: " + routeId);
    
    let success = function(data, textStatus, jqXHR) {
      console.log("GetRoute succeeded.");
      
      _this.routeData.push(data.route);
      if (_this.routeData.length < _this.selectedRoutes.length) {
        _this.GetRoutes();
      } else {
        $("body").css("cursor", "default");
        _this.GenerateItinerary();
      }
    };
    let error = function(jqXhr, textStatus, errorThrown) {
      $("body").css("cursor", "default");
      alert("Failed to get route data.");
    };

    this.rwgpsApi.GetRoute(routeId, success, error);
  };
  
  this.GetTable = function() {
    if (this.itineraryTable === undefined) {
      let columnHeaders = [
        { title: "Segment" },
        { title: "Index" },
        { title: "Name" },
        { title: "Description", width: "20%", orderable: false/*, visible: false*/ },
        { title: "Latitude" },
        { title: "Longitude" },
        { title: "Closest Latitude" },
        { title: "Closest Longitude" },
        { title: "Delta" },
        { title: "Distance (miles)", orderable: false },
        { title: "Elevation Gain (feet)", orderable: false },
        { title: "Elevation Loss (feet)", orderable: false }
      ];
        
      $(ITINERARY).show();
      this.itineraryTable = $(ITINERARY_TABLE).DataTable({
        data: this.itinerary,
        columnDefs: [
          { targets: "_all", orderable: false },
          {
            render: function(data, type, row) {
              return data.toFixed(6);
            },
            targets: [4, 5, 6, 7]
          },
          {
            render: function(data, type, row) {
              return data.toFixed(3);
            },
            targets: [8]
          },
          {
            render: function(data, type, row) {
              return data.toFixed(1);
            },
            targets: [9]
          },
          {
            render: function(data, type, row) {
              return data.toFixed(0);
            },
            targets: [10, 11]
          }
        ],
        columns: columnHeaders,
        order: [],
        scrollY: "500px",
        scrollCollapse: true,
        paging: false
      });
    }
    
    return this.itineraryTable;
  };
  
  this.SetTableData = function(data) {
    let table = this.GetTable();
    table.clear().rows.add(data).draw();
  }
  
  this.GenerateItinerary = function() {
    console.log("Generate Itinerary");
    console.log(this.routeData);
    
    let cookies = new Cookies();
    let threshold = cookies.GetThreshold();
    let filter = cookies.GetFilter();
    
    this.trackPointsArray = [];
    this.itinerary = [];
    for (let i = 0; i < this.routeData.length; i++) {
      let trackPoints = new TrackPoints(this.routeData[i].track_points, threshold, filter);
      this.trackPointsArray.push(trackPoints);
      let pointsOfInterest = this.routeData[i].points_of_interest;
      
      let segmentItinerary = [];
      for (let j = 0; j < pointsOfInterest.length; ++j) {
        let poi = pointsOfInterest[j];
        let closestIndex = trackPoints.findClosestPointIndex(poi);
        let closestPoint = trackPoints.data[closestIndex];
        
        let itineraryPoint = [];
        itineraryPoint[SEGMENT] = i;
        itineraryPoint[INDEX] = closestIndex;
        itineraryPoint[NAME] = poi.n;
        itineraryPoint[DESCRIPTION] = poi.d.replace(/\n/g, "<br/>");
        itineraryPoint[LATITUDE] = poi.lat;
        itineraryPoint[LONGITUDE] = poi.lng;
        itineraryPoint[CLOSEST_LATITUDE] = closestPoint.y;
        itineraryPoint[CLOSEST_LONGITUDE] = closestPoint.x;
        itineraryPoint[DELTA] = PythagorasEquirectangular(poi.lat, poi.lng, closestPoint.y, closestPoint.x);
        
        segmentItinerary.push(itineraryPoint);
      }

      segmentItinerary.sort(function(a, b) {
        return a[1] - b[1];
      });
      
      $.merge(this.itinerary, segmentItinerary);
    }

    console.log("Merged itinerary.");
    console.log(this.itinerary);
  
    for (let j = 0; j < this.itinerary.length; ++j) {
      let currentItineraryPoint = this.itinerary[j];
      
      let startSegment = 0;
      let startIndex = 0;
      if (j > 0) {
        let previousItineraryPoint = this.itinerary[j - 1];
        startSegment = previousItineraryPoint[0];
        startIndex = previousItineraryPoint[1];
      }
      let endSegment = currentItineraryPoint[0];
      let endIndex = currentItineraryPoint[1];
      
      if (startSegment == endSegment) {
        let currentTrackPoints = this.trackPointsArray[endSegment];
        
      	currentItineraryPoint[DISTANCE] = currentTrackPoints.distance(startIndex, endIndex);
      	currentItineraryPoint[ELEVATION_GAIN] = currentTrackPoints.elevationGain(startIndex, endIndex);
      	currentItineraryPoint[ELEVATION_LOSS] = currentTrackPoints.elevationLoss(startIndex, endIndex);
      } else {
        let previousTrackPoints = this.trackPointsArray[startSegment];
        let currentTrackPoints = this.trackPointsArray[endSegment];
        let previousLastIndex = previousTrackPoints.data.length - 1;

      	currentItineraryPoint[DISTANCE] = previousTrackPoints.distance(startIndex, previousLastIndex)
          + currentTrackPoints.distance(0, endIndex);
      	currentItineraryPoint[ELEVATION_GAIN] = previousTrackPoints.elevationGain(startIndex, previousLastIndex)
          + currentTrackPoints.elevationGain(0, endIndex);
      	currentItineraryPoint[ELEVATION_LOSS] = previousTrackPoints.elevationLoss(startIndex, previousLastIndex)
          + currentTrackPoints.elevationLoss(0, endIndex);
      }
    }

    console.log("Finished itinerary.");
    console.log(this.itinerary);
    
    this.SetTableData(this.itinerary);
  };
};
