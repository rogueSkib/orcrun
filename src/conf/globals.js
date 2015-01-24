import device;

// establish globals and constants by importing this file
// globals are prefixed with G_ as a reminder of their global scope
// local references to these variables can be accessed faster

// are we on a native device?
G_IS_NATIVE = !device.isSimulator && !device.isMobileBrowser && !device.isIOSSimulator;

// is Weeby enabled?
G_WEEBY_ENABLED = false;

// background art dimensions
G_BG_WIDTH = 1024;
G_BG_HEIGHT = 576;

// singleton controller
G_CONTROLLER = jsio('import src.controller');
