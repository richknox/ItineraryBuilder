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
  
  const _this = this; // Make a copy of object context (this) for closures.

  $(IB_EVENT_TARGET).on(GENERATE_ITINERARY, function(event, data) {
    console.log("GenerateItinerary - Itinerary");
    //console.log(data);
    
    _this.selectedRoutes = data;
    if (_this.selectedRoutes.length > 0) {
      _this.GetRoutes();
    } else {
      alert("No itinerary routes.");
    }
  });
  
  this.GetRoutes = function() {
    let i = this.routeData.length;
    let routeId = this.selectedRoutes[i][0];
    console.log("Iteration: " + i + ", Route ID: " + routeId);
    
    let success = function(data, textStatus, jqXHR) {
      console.log("GetRoute succeeded.");
      //console.log(data);
      
      _this.routeData.push(data.route);
      if (_this.routeData.length < _this.selectedRoutes.length) {
        _this.GetRoutes();
      } else {
        _this.GenerateItinerary()
      }
    };
    let error = function(jqXhr, textStatus, errorThrown) {
      alert("Failed to get route data.");
    };

    this.rwgpsApi.GetRoute(routeId, success, error);
  };
  
  this.GenerateItinerary = function() {
    console.log("Generate Itinerary");
    console.log(this.routeData);
    
    this.trackPointsArray = [];
    this.itinerary = [];
    for (let i = 0; i < this.routeData.length; i++) {
      let trackPoints = new TrackPoints(this.routeData[i].track_points);
      this.trackPointsArray.push(trackPoints);
      let pointsOfInterest = this.routeData[i].points_of_interest;
      
      let segmentItinerary = [];
      for (let j = 0; j < pointsOfInterest.length; ++j) {
        let poi = pointsOfInterest[j];
        let closestIndex = trackPoints.findClosestPointIndex(poi);
        let closestPoint = trackPoints.data[closestIndex];
        let itineraryPoint = [
          i, // segment
          closestIndex, // index
          poi.n, // name
          poi.d.replace(/\n/g, "<br/>"), // description
          poi.lat, // lat 
          poi.lng, // lng 
          closestPoint.y, // closestLat 
          closestPoint.x, // closestLng 
          PythagorasEquirectangular(poi.lat, poi.lng, closestPoint.y, closestPoint.x), // delta
        ];
        segmentItinerary.push(itineraryPoint);
      }

      segmentItinerary.sort(function(a, b) {
        return a.index - b.index;
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
        currentItineraryPoint.push(currentTrackPoints.distance(startIndex, endIndex)); // distance
        currentItineraryPoint.push(currentTrackPoints.elevationGain(startIndex, endIndex)); // gain
        currentItineraryPoint.push(currentTrackPoints.elevationLoss(startIndex, endIndex)); // loss
      } else {
        let previousTrackPoints = this.trackPointsArray[startSegment];
        let currentTrackPoints = this.trackPointsArray[endSegment];
        let previousLastIndex = previousTrackPoints.data.length - 1;
        currentItineraryPoint.push(previousTrackPoints.distance(startIndex, previousLastIndex)
          + currentTrackPoints.distance(0, endIndex)); // distance
        currentItineraryPoint.push(previousTrackPoints.elevationGain(startIndex, previousLastIndex)
          + currentTrackPoints.elevationGain(0, endIndex)); // gain
        currentItineraryPoint.push(previousTrackPoints.elevationLoss(startIndex, previousLastIndex)
          + currentTrackPoints.elevationLoss(0, endIndex)); // loss
      }
    }

    console.log("Finished itinerary.");
    console.log(this.itinerary);
  
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
    
      
      
/*      
      

      $.each(pointsOfInterest.data, function(index, value) {
        console.log(index, value);
        let closestPoint = trackPoints.data[value.closest];
    
        let poiData = [
          value.n, 
          value.d.replace(/\n/g, "<br/>"), 
          value.lat.toFixed(6), 
          value.lng.toFixed(6), 
          value.closest, 
          closestPoint.y.toFixed(6), 
          closestPoint.x.toFixed(6), 
          value.delta.toPrecision(3), 
          value.distance.toFixed(1), 
          value.gain.toFixed(0), 
          value.loss.toFixed(0)];
        let poiRow = "<tr>";
        $.each(poiData, function(index, value) {
          poiRow += "<td>" + value + "</td>";
        });
        poiRow += "</tr>";
        poiElement = $(poiRow);
        itineraryTableTemplate.before(poiElement);
      });
    }
    */
    
  };
  
  this.ShowItinerary = function() {  
    
    /*
    $.ajax({
      url: routeDataUrl,
      //jsonp: "jsonpCallback",
      dataType: "jsonp",
      success: function(data, textStatus, jqHXR) {
        routeData = data.route;
      
        let summary = "<h1>Summary</h1>";
        summary += "<p><b>Name:</b> " + routeData.name + "<br/>";
        summary += "<b>Description:</b> " + routeData.description + " <br/>";
        summary += "</p>";
        $("#Summary").html(summary);
      
        trackPoints.init(routeDataUrl, routeData.track_points);
        pointsOfInterest.init(routeDataUrl, routeData.points_of_interest);
      
        pointsOfInterest.computeItinerary(trackPoints);
      
        let itineraryTableTemplate = $("#ItineraryTableTemplate");
      
        $.each(pointsOfInterest.data, function(index, value) {
          console.log(index, value);
          let closestPoint = trackPoints.data[value.closest];
      
          let poiData = [
            value.n, 
            value.d.replace(/\n/g, "<br/>"), 
            value.lat.toFixed(6), 
            value.lng.toFixed(6), 
            value.closest, 
            closestPoint.y.toFixed(6), 
            closestPoint.x.toFixed(6), 
            value.delta.toPrecision(3), 
            value.distance.toFixed(1), 
            value.gain.toFixed(0), 
            value.loss.toFixed(0)];
          let poiRow = "<tr>";
          $.each(poiData, function(index, value) {
            poiRow += "<td>" + value + "</td>";
          });
          poiRow += "</tr>";
          poiElement = $(poiRow);
          itineraryTableTemplate.before(poiElement);
        });
      }
    });
    */  
  };
}
