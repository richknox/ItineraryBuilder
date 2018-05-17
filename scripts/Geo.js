"use strict";

function TrackPoints(data, threshold, filter) {
  this.data = data;
  this.threshold = threshold;
  this.filter = filter;
  
  // Find closest track point to a point of interest.
  this.findClosestPointIndex = function(poi) {
    let mindif = Number.MAX_VALUE;
    let closest;

    for (let index = 0; index < this.data.length; ++index) {
      let dif = PythagorasEquirectangular(poi.lat, poi.lng, 
        this.data[index].y, this.data[index].x);
      if (dif < mindif) {
        closest = index;
        mindif = dif;
      }
    }
  
    return closest;
  };
  
  // Distance between two track points in miles.
  this.distance = function(start, end) {
    // console.log("distance: " + start + ", " + end);
    return MetersToMiles(this.data[end].d - this.data[start].d);
  };
  
  // Elevation gain between two points in feet.
  this.elevationGain = function(start, end) {
    let base = this.data[start].smoothElevation;
    let gain = 0;
  
    for (let index = start + 1; index < end; ++index) {
      let elevation = this.data[index].smoothElevation;
      let delta = elevation - base;
      if (delta > this.threshold) {
        gain += delta;
        base = elevation;
      } else if (delta < -this.threshold) {
        base = elevation;
      }
    }
  
    return MetersToFeet(gain);
  };
  
  // Elevation loss bewteen two points in feet.
  this.elevationLoss = function(start, end) {
    let base = this.data[start].smoothElevation;
    let loss = 0;
  
    for (let index = start + 1; index < end; ++index) {
      let elevation = this.data[index].smoothElevation;
      let delta = elevation - base;
      if (delta < -this.threshold) {
        loss -= delta;
        base = elevation;
      } else if (delta > this.threshold) {
        base = elevation;
      }
    }
  
    return MetersToFeet(loss);
  };
  
  this.smoothElevation = function() {
    let movingSum = 0;
    
    let index = 0;
    let start = Math.max(0, index - this.filter);
    let end = Math.min(index + this.filter, this.data.length - 1);
    
    for (let i = start; i <= end; ++i) {
      movingSum += this.data[i].e;
    }
    
    while (index < this.data.length) {
      this.data[index].smoothElevation = movingSum / (end - start + 1);
      if (++index < this.data.length) {
        start = Math.max(0, index - this.filter);
        if (start > 0) {
          movingSum -= this.data[start - 1].e;
        }
        end = Math.min(index + this.filter, this.data.length - 1);
        if (end < this.data.length) {
          movingSum += this.data[end].e;
        }
      }
    }
  };
  
  this.smoothElevation(); 
}

// Convert Degress to Radians
function Deg2Rad(deg) {
  return deg * Math.PI / 180;
}

function MetersToFeet(meters) {
  return meters / .3048
}

function MetersToMiles(meters) {
  return meters / 1609.344;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
  lat1 = Deg2Rad(lat1);
  lat2 = Deg2Rad(lat2);
  lon1 = Deg2Rad(lon1);
  lon2 = Deg2Rad(lon2);
  let R = 6371; // km
  let x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  let y = (lat2 - lat1);
  let d = Math.sqrt(x * x + y * y) * R;
  return d;
}

