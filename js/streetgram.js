function init_gmaps() {
  geocoder = new google.maps.Geocoder();
  var fenway = new google.maps.LatLng(48.856223, 2.297707);

  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: fenway,
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), {
    linksControl: false,
    panControl: false,
    zoomControl: false,
    addressControl: false
  });
  map.setStreetView(panorama);

  function panoChanged() {
    var width = 262; // FIXME
    var height = 264;
    console.log(panorama.getPosition().toString());
    var url = "http://maps.googleapis.com/maps/api/streetview?size=" + width + "x" + height + "&location=" + panorama.getPosition().toString().replace(/ /g, '') + "&heading=" + panorama.getPov().heading + "&fov=90&pitch=" + panorama.getPov().pitch + "&sensor=false";
    console.log(url);
    window.streetViewURL = url;

    $('.map-modal-content').addClass('invisible');
    $('.pano-modal-content').removeClass('invisible');
  }

  console.log(panorama.getPosition());

  google.maps.event.addListener(panorama, 'position_changed', panoChanged);
  google.maps.event.addListener(panorama, 'pov_changed', panoChanged);   var input = document.getElementById('address-input');

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map
  });

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    var place = autocomplete.getPlace();
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }

    var image = new google.maps.MarkerImage(
        place.icon,
        new google.maps.Size(71, 71),
        new google.maps.Point(0, 0),
        new google.maps.Point(17, 34),
        new google.maps.Size(35, 35));
    marker.setIcon(image);
    marker.setPosition(place.geometry.location);

    var address = '';
    if (place.address_components) {
      address = [(place.address_components[0] &&
                  place.address_components[0].short_name || ''),
                 (place.address_components[1] &&
                  place.address_components[1].short_name || ''),
                 (place.address_components[2] &&
                  place.address_components[2].short_name || '')
                ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
  });
}

function camera_flash(between) {
  var flash = $('#camera-flash');
  flash.fadeIn(200, function() { between(); flash.fadeOut(200); });
}

function take_photo() {
  camera_flash(function() {
    $('.screen-camera').hide();
    $('.screen-photo').show();

    var canvas = document.getElementById("photo");
    var context = canvas.getContext("2d");

    $.getImageData({
      url: window.streetViewURL,
      success: function(image) {
        context.drawImage(image, 0, 0, 262, 264);
        Filtrr2($('#photo'), function() {
          /*
          this
            .saturate(-70)
            .contrast(30)
            .expose(1)
            .render();
            */

        var dup = this.dup().expose(-35);
               
        this.contrast(40)
            .saturate(-70)
            .adjust(0.2, 0.2, 0)
            .layer("softLight", dup)
            .render();
        });
      }
    });
  });
}

$(function () {
  init_gmaps();

  $('#address-input').keypress(function (event) {
    if (event.keyCode == 13) {
      $('#map-modal').modal();
      google.maps.event.trigger(map, 'resize');
    }
  });

  $('#camera-button').click(function() {
    take_photo();
  });
});
