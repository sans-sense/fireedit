const widgets = require("widget");
const tabs = require("tabs");

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    tabs.open("http://www.imaginea.com/");
  }
});

const { Hotkey } = require("hotkeys");
 
var showHotKey = Hotkey({
  combo: "accel-shift-p",
  onPress: function() {
    showMyPanel();
  }
});
console.log("The add-on is running.");
